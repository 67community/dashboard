#!/usr/bin/env python3
"""
Fetch X notifications for @67coinX via its own session
Saves to public/data.json under x_notifications key
"""
import json, re
from pathlib import Path
from playwright.sync_api import sync_playwright

PROXY    = {"server": os.environ.get("PROXY_URL", "http://gw.dataimpulse.com:823"), "username": os.environ.get("PROXY_USER", ""), "password": os.environ.get("PROXY_PASS", "")}
SESSION  = Path("/Users/oscarbrendon/.openclaw/workspace/mission-control/scripts/67coinx_session.json")
DATA_FILE = Path("/Users/oscarbrendon/.openclaw/workspace/mission-control/public/data.json")

storage = json.loads(SESSION.read_text())

results = []
seen = set()

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx = browser.new_context(proxy=PROXY, storage_state=storage,
        viewport={"width":1280,"height":900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        locale="en-US")
    page = ctx.new_page()
    page.route("**/*.{png,jpg,jpeg,gif,webp,mp4,svg}", lambda r: r.abort())

    page.goto("https://x.com/notifications", timeout=25000, wait_until="domcontentloaded")
    page.wait_for_timeout(4000)

    if "login" in page.url or "flow" in page.url:
        print("❌ Session expired")
        ctx.close(); browser.close()
        exit(1)

    # Scroll to load more
    for _ in range(6):
        page.keyboard.press("End")
        page.wait_for_timeout(900)

    # Extract notification cells
    for cell in page.query_selector_all("[data-testid='notification']"):
        try:
            text_el = cell.query_selector("[data-testid='tweetText']") or cell.query_selector("span[lang]")
            text = text_el.inner_text().strip() if text_el else ""
            if not text or len(text) < 5: continue

            link_el = cell.query_selector("a[href*='/status/']")
            link = "https://x.com" + link_el.get_attribute("href") if link_el else ""
            uid = link or text[:50]
            if uid in seen: continue
            seen.add(uid)

            time_el = cell.query_selector("time")
            time_str = time_el.get_attribute("datetime") if time_el else ""
            user_el = cell.query_selector("[data-testid='User-Name']")
            user = user_el.inner_text().split("\n")[0].strip() if user_el else ""
            handle_m = re.search(r'@(\w+)', user_el.inner_text() if user_el else "")
            handle = handle_m.group(1) if handle_m else ""

            status_m = re.search(r'/status/(\d+)', link) if link else None
            nid = status_m.group(1) if status_m else str(abs(hash(uid)))

            # Likes/RT for the notified tweet
            likes = reposts = replies = 0
            for btn in cell.query_selector_all("button[aria-label]"):
                lbl = (btn.get_attribute("aria-label") or "").lower()
                m = re.match(r'^([\d,]+(?:\.\d+)?[km]?)\s', lbl)
                val_str = m.group(1) if m else "0"
                val_str = val_str.replace(",","")
                if val_str.endswith("k"): val = int(float(val_str[:-1])*1000)
                elif val_str.endswith("m"): val = int(float(val_str[:-1])*1000000)
                else:
                    try: val = int(val_str)
                    except: val = 0
                if "like" in lbl: likes = val
                elif "repost" in lbl: reposts = val
                elif "repl" in lbl: replies = val

            results.append({
                "id": nid, "text": text, "user": user, "handle": handle,
                "link": link, "time": time_str,
                "likes": likes, "reposts": reposts, "replies": replies
            })
        except: pass

    ctx.close()
    browser.close()

# Save to data.json
try:
    data = json.loads(DATA_FILE.read_text())
except:
    data = {}

data["x_notifications"] = results[:30]
DATA_FILE.write_text(json.dumps(data, ensure_ascii=True))
print(f"✅ {len(results)} notifications saved")
