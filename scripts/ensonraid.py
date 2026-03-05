import asyncio
import re
import json
import hashlib
import subprocess
from pathlib import Path
from datetime import datetime, timezone

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError

# =========================
# CONFIG
# =========================
X_NOTIFICATIONS_URL = "https://x.com/notifications"

POLL_SECONDS = 600  # 10 dakika

STATE_DIR          = Path(__file__).parent / "state"
STATE_DIR.mkdir(exist_ok=True)
STORAGE_STATE_PATH = Path(__file__).parent / "67coinx_session.json"
SEEN_DB_PATH       = STATE_DIR / "seen_hashes.json"
DATA_JSON          = Path(__file__).parent.parent / "public" / "data.json"
REPO_DIR           = Path(__file__).parent.parent

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
        except:
            return set()
    return set()

def save_seen(seen: set) -> None:
    lst = list(seen)[-5000:]
    SEEN_DB_PATH.write_text(json.dumps(lst, ensure_ascii=False, indent=2), encoding="utf-8")

def send_to_dashboard(tweet: dict):
    """Telegram yerine data.json'a yaz ve git push yap"""
    try:
        data = json.loads(DATA_JSON.read_text())
    except:
        data = {}

    notifs = data.get("x_notifications", [])
    # Duplicate kontrolü
    if any(n.get("id") == tweet["id"] for n in notifs):
        return
    notifs.insert(0, tweet)
    data["x_notifications"] = notifs[:30]
    DATA_JSON.write_text(json.dumps(data, ensure_ascii=True))

    # Git push
    try:
        subprocess.run(["git", "add", "public/data.json"], cwd=REPO_DIR, check=True)
        subprocess.run(["git", "commit", "-m", f"data: new x notif {tweet['id']}",
                        "--author=Nova <team@67coin.com>"], cwd=REPO_DIR, check=True)
        subprocess.run(["git", "push", "origin", "main"], cwd=REPO_DIR, check=True)
        print("✅ Dashboard'a gönderildi")
    except Exception as e:
        print(f"⚠️ Git push hatası: {e}")

# =========================
# CLICK NOTIFICATION
# =========================
async def click_new_post_notification(page) -> bool:
    try:
        await page.wait_for_selector('[data-testid="notification"]', timeout=10000)

        notif = page.locator('[data-testid="notification"]:has-text("yeni gönderi")').first
        if await notif.count() == 0:
            notif = page.locator('[data-testid="notification"]:has-text("new post")').first

        if await notif.count() == 0:
            print("ℹ️ 'Yeni gönderi' yok")
            return False

        print("🆕 'Yeni gönderi' → tıklanıyor")
        await notif.click()
        await page.wait_for_timeout(1500)
        await page.wait_for_selector('article:has(a[href*="/status/"])', timeout=15000)
        print("✅ Post listesi açıldı")
        return True

    except PlaywrightTimeoutError:
        print("⚠️ Timeout")
        return False
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
        href = await article.locator('a[href*="/status/"]').first.get_attribute("href")
        if not href or not text:
            return None
        link = "https://x.com" + href
        print("✅ Tweet extract edildi:", link)
        return {"text": text, "link": link}
    except Exception as e:
        print("⚠️ Extract hatası:", e)
        return None

# =========================
# MAIN
# =========================
async def main():
    seen = load_seen()
    print(f"🚀 ensonraid başladı | seen: {len(seen)}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            storage_state=str(STORAGE_STATE_PATH),
            viewport={"width": 1280, "height": 900}
        )
        page = await context.new_page()
        page.set_default_navigation_timeout(60000)

        await page.goto(X_NOTIFICATIONS_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)

        if "login" in page.url or "flow" in page.url:
            print("❌ Session expired")
            await browser.close()
            return

        print("👂 Dinleniyor...")
        last_refresh = datetime.now()

        while True:
            try:
                await page.wait_for_timeout(3000)

                if (datetime.now() - last_refresh).total_seconds() > 50:
                    print("🔄 Refresh...")
                    await page.goto(X_NOTIFICATIONS_URL, wait_until="domcontentloaded")
                    await page.wait_for_timeout(4000)
                    last_refresh = datetime.now()

                print(f"\n🔁 {now_utc_str()}")

                clicked = await click_new_post_notification(page)
                tweet = await extract_open_tweet(page) if clicked else None

                if tweet:
                    status_id = extract_status_id(tweet["link"])
                    if status_id:
                        hh = hash_text(status_id)
                        if hh not in seen:
                            seen.add(hh)
                            print("🆕 Yeni tweet → dashboard'a gönderiliyor")
                            send_to_dashboard({
                                "id": status_id,
                                "text": tweet["text"],
                                "link": tweet["link"],
                                "time": now_utc_str()
                            })
                            save_seen(seen)
                        else:
                            print("⏭ Duplicate → skip")

                await asyncio.sleep(POLL_SECONDS)

                if "/status/" in page.url or "/i/timeline" in page.url:
                    await page.goto(X_NOTIFICATIONS_URL)
                    last_refresh = datetime.now()

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
