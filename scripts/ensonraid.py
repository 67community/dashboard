import asyncio
import os
import re
import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError

# =========================
# CONFIG
# =========================
X_NOTIFICATIONS_URL = "https://x.com/notifications"
X_LOGIN_URL         = "https://x.com/login"
POLL_SECONDS        = int(os.getenv("POLL_SECONDS", "20"))

STATE_DIR           = Path("state")
STATE_DIR.mkdir(exist_ok=True)

STORAGE_STATE_PATH  = STATE_DIR / "x_storage_state.json"
SEEN_DB_PATH        = STATE_DIR / "seen_hashes.json"

# Mission Control feed — JSON file read by /api/raid-feed
FEED_PATH = Path(os.getenv(
    "RAID_FEED_PATH",
    "/Users/oscarbrendon/67agent-mission-control/x_notif_feed.json"
))

FIREFOX_NIGHTLY_PATH = os.getenv("FIREFOX_NIGHTLY_PATH", r"C:\Program Files\Firefox Nightly\firefox.exe")

# =========================
# HELPERS
# =========================
def now_utc_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

def normalize_text(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip())

def hash_text(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8", errors="ignore")).hexdigest()

def extract_status_id(link: str):
    m = re.search(r"/status/(\d+)", link)
    return m.group(1) if m else None

def load_seen() -> set:
    if SEEN_DB_PATH.exists():
        try:
            data = json.loads(SEEN_DB_PATH.read_text(encoding="utf-8"))
            return set(data if isinstance(data, list) else [])
        except Exception:
            return set()
    return set()

def save_seen(seen: set) -> None:
    lst = list(seen)
    if len(lst) > 5000:
        lst = lst[-5000:]
    SEEN_DB_PATH.write_text(json.dumps(lst, indent=2), encoding="utf-8")

# Supabase config
import urllib.request as _ur
SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "***REMOVED_SERVICE_KEY***"

def sb_get_feed() -> list:
    try:
        req = _ur.Request(f"{SB_URL}/rest/v1/kv_store?key=eq.x_raid_feed&select=value",
            headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
        with _ur.urlopen(req, timeout=10) as r:
            rows = json.load(r)
        return rows[0]["value"] if rows else []
    except: return []

def sb_upsert_feed(feed: list) -> None:
    body = json.dumps({"key": "x_raid_feed", "value": feed}).encode()
    req = _ur.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with _ur.urlopen(req, timeout=10): pass

def append_to_feed(tweet: dict) -> None:
    """Append new tweet to Supabase x_raid_feed (max 200 items)."""
    feed = sb_get_feed()
    entry = {
        "id":   extract_status_id(tweet["link"]) or hash_text(tweet["link"]),
        "text": tweet["text"],
        "link": tweet["link"],
        "time": now_utc_str(),
    }
    feed.insert(0, entry)
    if len(feed) > 200:
        feed = feed[:200]
    sb_upsert_feed(feed)
    print(f"💾 Supabase x_raid_feed updated ({len(feed)} items)")

# =========================
# LOGIN CHECK
# =========================
async def ensure_logged_in(page):
    await page.goto(X_NOTIFICATIONS_URL, wait_until="domcontentloaded")
    await page.wait_for_timeout(2000)
    if "login" in page.url.lower():
        print("🔐 Login gerekiyor. Manuel giriş yap...")
        await page.goto(X_LOGIN_URL)
        print("⏳ 90 saniye login süresi...")
        await page.wait_for_timeout(90_000)
        await page.goto(X_NOTIFICATIONS_URL)
        await page.wait_for_timeout(3000)

# =========================
# CLICK NOTIFICATION
# =========================
async def click_new_post_notification(page) -> bool:
    try:
        await page.wait_for_selector('[data-testid="notification"]', timeout=10000)
        notif = page.locator('[data-testid="notification"]:has-text("yeni gönderi")').first
        if await notif.count() == 0:
            print("ℹ️ 'New post' yok")
            return False
        print("🆕 'New post' → tıklanıyor")
        await notif.click()
        await page.wait_for_timeout(1500)
        await page.wait_for_selector('article:has(a[href*="/status/"])', timeout=15000)
        return True
    except Exception as e:
        print("⚠️ Click hatası:", e)
        return False

# =========================
# EXTRACT TWEET
# =========================
async def extract_open_tweet(page):
    try:
        await page.wait_for_selector('article:has(a[href*="/status/"])', timeout=15000)
        article = page.locator('article:has(a[href*="/status/"])').first
        raw_text = await article.inner_text()
        text = normalize_text(raw_text)
        status_a = article.locator('a[href*="/status/"]').first
        href = await status_a.get_attribute("href")
        if not href or len(text) < 1:
            return None
        return {"text": text, "link": "https://x.com" + href}
    except Exception as e:
        print("⚠️ extract_open_tweet hatası:", e)
        return None

# =========================
# MAIN
# =========================
async def main():
    seen = load_seen()
    print(f"🧠 Seen DB: {len(seen)}")
    print(f"📂 Feed path: {FEED_PATH}")

    async with async_playwright() as p:
        browser = await p.firefox.launch(
            headless=True,
            executable_path=FIREFOX_NIGHTLY_PATH if Path(FIREFOX_NIGHTLY_PATH).exists() else None
        )
        context = await browser.new_context(
            storage_state=str(STORAGE_STATE_PATH) if STORAGE_STATE_PATH.exists() else None,
            viewport={"width": 1280, "height": 900}
        )
        page = await context.new_page()
        await ensure_logged_in(page)

        try:
            await context.storage_state(path=str(STORAGE_STATE_PATH))
            print("💾 Session kaydedildi")
        except Exception:
            pass

        print("👂 Notifications dinleniyor → Mission Control feed yazılıyor...")
        last_refresh = datetime.now()

        while True:
            try:
                await page.wait_for_timeout(3000)
                now = datetime.now()
                if (now - last_refresh).total_seconds() > 50:
                    print("🔄 Refresh")
                    await page.goto(X_NOTIFICATIONS_URL, wait_until="domcontentloaded")
                    await page.wait_for_timeout(4000)
                    last_refresh = now

                print(f"\n🔁 Döngü → {page.url}")
                clicked = await click_new_post_notification(page)
                tweet = await extract_open_tweet(page) if clicked else None

                if tweet:
                    status_id = extract_status_id(tweet["link"])
                    h = hash_text(status_id or tweet["link"])
                    if h in seen:
                        print("⏭ Duplicate → skip")
                    else:
                        seen.add(h)
                        append_to_feed(tweet)
                        save_seen(seen)
                        print(f"✅ Yeni tweet → {tweet['link']}")

                await asyncio.sleep(POLL_SECONDS)

                if "/status/" in page.url or "/i/timeline" in page.url:
                    await page.goto(X_NOTIFICATIONS_URL)

            except KeyboardInterrupt:
                print("\n🛑 Durduruldu")
                break
            except Exception as e:
                print("⚠️ Döngü hatası:", e)
                await asyncio.sleep(5)

        await context.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
