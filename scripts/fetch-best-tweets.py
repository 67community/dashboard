#!/usr/bin/env python3
"""
@67coinX'in son tweetlerini çek, 48h ve 7 günlük en etkileşimlisini seç
"""
import json, re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from playwright.sync_api import sync_playwright

SESSION   = Path(__file__).parent / "67coinx_session.json"
DATA_JSON = Path(__file__).parent.parent / "public" / "data.json"

storage = json.loads(SESSION.read_text())
now = datetime.now(timezone.utc)

def parse_num(s):
    s = str(s).strip().replace(",","")
    if s.upper().endswith("K"): return int(float(s[:-1])*1000)
    if s.upper().endswith("M"): return int(float(s[:-1])*1000000)
    try: return int(s)
    except: return 0

tweets = []

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx = browser.new_context(storage_state=storage, viewport={"width":1280,"height":900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    page = ctx.new_page()
    # image blocking yok — metrics doğru yüklensin

    page.goto("https://x.com/67coinX", timeout=30000, wait_until="domcontentloaded")
    page.wait_for_timeout(4000)

    # Scroll to load more tweets
    for _ in range(8):
        page.keyboard.press("End")
        page.wait_for_timeout(1000)

    for art in page.query_selector_all("article[data-testid='tweet']"):
        try:
            time_el = art.query_selector("time")
            if not time_el: continue
            dt_str = time_el.get_attribute("datetime")
            dt = datetime.fromisoformat(dt_str.replace("Z","+00:00"))

            # Only last 30 days
            if (now - dt).days > 30: continue

            text_el = art.query_selector("[data-testid='tweetText']")
            text = text_el.inner_text() if text_el else ""
            if not text: continue

            link_el = art.query_selector("a[href*='/status/']")
            href = link_el.get_attribute("href") if link_el else ""
            link = "https://x.com" + href if href else ""
            m = re.search(r"/status/(\d+)", link)
            tid = m.group(1) if m else ""

            likes = reposts = replies = 0
            for btn in art.query_selector_all("button[aria-label]"):
                lbl = (btn.get_attribute("aria-label") or "").lower()
                match = re.match(r'^([\d,]+(?:\.\d+)?[km]?)\s', lbl)
                val = parse_num(match.group(1)) if match else 0
                if "like" in lbl or "beğeni" in lbl: likes = val
                elif "repost" in lbl or "yeniden gönderi" in lbl: reposts = val
                elif "repl" in lbl or "yanıt" in lbl: replies = val

            engagement = likes + reposts * 2 + replies
            tweets.append({
                "id": tid, "text": text, "link": link,
                "dt": dt, "likes": likes, "reposts": reposts,
                "replies": replies, "engagement": engagement,
                "date": dt.strftime("%b %d"),
                "tweet_id": tid,
                "tweet_url": link,
                "img_url": None,
            })
        except: pass

    ctx.close()
    browser.close()

print(f"Toplam {len(tweets)} tweet bulundu (son 7 gün)")

cutoff_48h = now - timedelta(hours=48)
cutoff_7d  = now - timedelta(days=7)
tweets_48h = [t for t in tweets if t["dt"] >= cutoff_48h] or tweets  # fallback: en yeni
tweets_7d  = [t for t in tweets if t["dt"] >= cutoff_7d]  or tweets  # fallback: hepsi

best_48h = max(tweets_48h, key=lambda t: t["engagement"]) if tweets_48h else None
best_7d  = max(tweets_7d,  key=lambda t: t["engagement"]) if tweets_7d  else None

if best_48h: print(f"Best 48h: {best_48h['likes']}❤️  {best_48h['text'][:60]}")
if best_7d:  print(f"Best 7d:  {best_7d['likes']}❤️  {best_7d['text'][:60]}")

# Update data.json
data = json.loads(DATA_JSON.read_text())
sp = data.get("social_pulse", {})

def to_entry(t):
    if not t: return None
    return {
        "tweet_id":  t["tweet_id"],
        "tweet_url": t["tweet_url"],
        "text":      t["text"][:280],
        "likes":     t["likes"],
        "replies":   t["replies"],
        "date":      t["date"],
        "img_url":   None,
        "embed_html": ""
    }

if best_48h: sp["best_tweet_2d"]   = to_entry(best_48h)
if best_7d:  sp["best_tweet_week"] = to_entry(best_7d)

data["social_pulse"] = sp
DATA_JSON.write_text(json.dumps(data, ensure_ascii=True))
print("✅ data.json güncellendi")
