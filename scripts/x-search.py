#!/usr/bin/env python3
import sys, json, random, re
from pathlib import Path
from playwright.sync_api import sync_playwright

QUERY = "67coin OR %2467coin OR %2267+coin%22 solana"
SESSIONS_DIR = Path("/Users/oscarbrendon/.openclaw/workspace/skills/67coin/assets/sessions")
mode = sys.argv[1] if len(sys.argv) > 1 else "recent"

# recent = Latest tab, popular = Top tab
tab_param = "live" if mode == "recent" else "top"

sessions = list(SESSIONS_DIR.glob("session.*.json"))
random.shuffle(sessions)

results = []

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    for sf in sessions[:15]:
        try:
            storage = json.loads(sf.read_text())
            ctx = browser.new_context(storage_state=storage, viewport={"width":1280,"height":900})
            page = ctx.new_page()
            url = f"https://x.com/search?q={QUERY.replace(' ','%20')}&src=typed_query&f={tab_param}"
            page.goto(url, timeout=25000, wait_until="domcontentloaded")
            if "login" in page.url or "flow" in page.url or "i/flow" in page.url:
                ctx.close()
                continue
            # Wait for tweets to render
            try:
                page.wait_for_selector("article[data-testid='tweet']", timeout=12000)
            except:
                page.wait_for_timeout(8000)
            page.evaluate("window.scrollBy(0, 400)")
            # Collect tweet articles
            articles = page.query_selector_all("article[data-testid='tweet']")
            if not articles:
                ctx.close()
                continue
            for art in articles[:10]:
                try:
                    text_el = art.query_selector("[data-testid='tweetText']")
                    text = text_el.inner_text() if text_el else ""
                    time_el = art.query_selector("time")
                    time_str = time_el.get_attribute("datetime") if time_el else ""
                    link_el = art.query_selector("a[href*='/status/']")
                    link = "https://x.com" + link_el.get_attribute("href") if link_el else ""
                    user_el = art.query_selector("[data-testid='User-Name']")
                    user = user_el.inner_text().split("\n")[0] if user_el else "Unknown"
                    # Metrics
                    likes = 0; replies = 0; reposts = 0
                    for btn in art.query_selector_all("[data-testid$='-count']"):
                        try:
                            val_el = btn.query_selector("span")
                            val = int(val_el.inner_text().replace(",","").replace("K","000").replace("M","000000")) if val_el and val_el.inner_text().strip().isdigit() else 0
                            tid = btn.get_attribute("data-testid") or ""
                            if "like" in tid: likes = val
                            elif "reply" in tid: replies = val
                            elif "retweet" in tid: reposts = val
                        except: pass
                    if text:
                        results.append({"text":text,"user":user,"time":time_str,"link":link,"likes":likes,"replies":replies,"reposts":reposts})
                except: pass
            ctx.close()
            if results:
                break
        except Exception as e:
            try: ctx.close()
            except: pass
    browser.close()

print(json.dumps(results[:10]))
