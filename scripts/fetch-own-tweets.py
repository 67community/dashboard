#!/usr/bin/env python3
"""Fetch @67coinX own tweets — Best 48H & Best 7D for dashboard. No proxy."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from datetime import datetime, timezone, timedelta

SESSION   = Path("os.environ.get("WORKSPACE", os.path.dirname(os.path.abspath(__file__)))/scripts/67coinx_session.json")
DATA_JSON = Path("os.environ.get("PROJECT_DIR", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))/public/data.json")

storage = json.loads(SESSION.read_text())
now     = datetime.now(timezone.utc)

tweets = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx = browser.new_context(
        storage_state=storage,
        viewport={"width":1280,"height":900},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122 Safari/537.36",
    )
    page = ctx.new_page()
    page.route("**/*.{png,jpg,jpeg,gif,webp,mp4,svg}", lambda r: r.abort())
    page.goto("https://x.com/67coinX", timeout=30000, wait_until="domcontentloaded")
    page.wait_for_timeout(4000)

    # Scroll to load more tweets
    for _ in range(8):
        page.keyboard.press("End")
        page.wait_for_timeout(900)

    seen = set()
    for article in page.query_selector_all("article[data-testid='tweet']"):
        try:
            text_el = article.query_selector("[data-testid='tweetText']")
            text = text_el.inner_text().strip() if text_el else ""
            if not text or text in seen: continue
            seen.add(text)

            link_el = article.query_selector("a[href*='/status/']")
            link = "https://x.com" + link_el.get_attribute("href") if link_el else ""

            # Time
            time_el = article.query_selector("time")
            time_iso = time_el.get_attribute("datetime") if time_el else ""
            try:
                dt = datetime.strptime(time_iso, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc)
                age_h = (now - dt).total_seconds() / 3600
            except:
                dt = now; age_h = 999

            def parse_num(sel):
                el = article.query_selector(sel + " span")
                if not el: return 0
                t = el.inner_text().strip()
                if not t: return 0
                if "K" in t: return int(float(t.replace("K",""))*1000)
                try: return int(t)
                except: return 0

            tweets.append({
                "text":    text[:280],
                "handle":  "67coinX",
                "user":    "The Official 67 Coin",
                "time":    time_iso,
                "link":    link,
                "likes":   parse_num("[data-testid='like']"),
                "reposts": parse_num("[data-testid='retweet']"),
                "replies": parse_num("[data-testid='reply']"),
                "age_hours": age_h,
            })
        except: pass

    ctx.close(); browser.close()

print(f"Çekildi: {len(tweets)} tweet")

# Best 48H
best_48h = sorted([t for t in tweets if t["age_hours"] <= 48],
                  key=lambda t: t["likes"] + t["reposts"]*2, reverse=True)
# Best 7D
best_7d  = sorted([t for t in tweets if t["age_hours"] <= 168],
                  key=lambda t: t["likes"] + t["reposts"]*2, reverse=True)

print(f"Best 48H: {len(best_48h)} | Best 7D: {len(best_7d)}")
if best_48h: print(f"  #1 48H: ❤️{best_48h[0]['likes']} {best_48h[0]['text'][:60]}")
if best_7d:  print(f"  #1 7D:  ❤️{best_7d[0]['likes']}  {best_7d[0]['text'][:60]}")

data = json.loads(DATA_JSON.read_text())
data["x_popular"]    = best_7d[:10]   # Best 7D
data["x_best_48h"]   = best_48h[:5]   # Best 48H
DATA_JSON.write_text(json.dumps(data, indent=2))
print("✅ data.json güncellendi")
