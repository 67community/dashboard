#!/usr/bin/env python3
"""X Search via Playwright (no login needed - X shows public results)"""
import sys, json, re
from playwright.sync_api import sync_playwright

PROXY = {"server":"http://gw.dataimpulse.com:823","username":"7e379971cf932ac8eb64","password":"dbdbbaad5bc9f565"}
mode  = sys.argv[1] if len(sys.argv) > 1 else "recent"
tab   = "live" if mode == "recent" else "top"
MAX   = 50

def parse_num(s):
    s = str(s).strip().replace(",","")
    if s.endswith("K"): return int(float(s[:-1])*1000)
    if s.endswith("M"): return int(float(s[:-1])*1000000)
    try: return int(s)
    except: return 0

results = []
seen    = set()

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx = browser.new_context(proxy=PROXY, viewport={"width":1280,"height":900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        locale="en-US")
    page = ctx.new_page()

    # Load accounts and set cookies
    import re as _re
    from pathlib import Path
    accs_file = Path("/Users/oscarbrendon/.openclaw/workspace/skills/67coin/x-profile-changer/accounts.txt")
    auth_tokens = [p for line in accs_file.read_text().splitlines() for p in line.split(":") if _re.match(r'^[a-f0-9]{40}$', p.strip())]
    import random
    auth = random.choice(auth_tokens) if auth_tokens else None

    logged_in = False
    if auth_tokens:
        for auth in auth_tokens[:10]:
            ctx2 = browser.new_context(proxy=PROXY, viewport={"width":1280,"height":900},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                locale="en-US")
            ctx2.add_cookies([
                {"name":"auth_token","value":auth,"domain":".x.com","path":"/"},
            ])
            p2 = ctx2.new_page()
            p2.goto("https://x.com/home", timeout=20000, wait_until="domcontentloaded")
            p2.wait_for_timeout(2000)
            if "login" not in p2.url and "flow" not in p2.url:
                # Good session — use this context
                ctx.close()
                ctx = ctx2
                page = p2
                logged_in = True
                break
            ctx2.close()
    if not logged_in:
        ctx.close(); browser.close(); print("[]"); sys.exit(0)

    # Block images/media to speed up
    page.route("**/*.{png,jpg,jpeg,gif,webp,mp4,svg}", lambda r: r.abort())

    url = f"https://x.com/search?q=67&src=typed_query&f={tab}"
    page.goto(url, timeout=30000, wait_until="domcontentloaded")
    page.wait_for_timeout(4000)

    # Scroll to load more tweets
    for _ in range(15):
        page.keyboard.press("End")
        page.wait_for_timeout(1000)

    articles = page.query_selector_all("article[data-testid='tweet']")

    for art in articles:
        if len(results) >= MAX: break
        try:
            link_el = art.query_selector("a[href*='/status/']")
            link = "https://x.com" + link_el.get_attribute("href") if link_el else ""
            if not link or link in seen: continue
            seen.add(link)

            text_el  = art.query_selector("[data-testid='tweetText']")
            time_el  = art.query_selector("time")
            user_el  = art.query_selector("[data-testid='User-Name']")

            text = text_el.inner_text() if text_el else ""
            time_str = time_el.get_attribute("datetime") if time_el else ""
            user_lines = user_el.inner_text().split("\n") if user_el else ["",""]
            user   = user_lines[0] if user_lines else ""
            handle = user_lines[1].lstrip("@") if len(user_lines) > 1 else ""

            likes = reposts = replies = 0
            try:
                for btn in art.query_selector_all("button[aria-label]"):
                    lbl = (btn.get_attribute("aria-label") or "").lower()
                    m = re.match(r'^([\d,]+(?:\.\d+)?[km]?)\s', lbl)
                    val = parse_num(m.group(1)) if m else 0
                    if "like" in lbl: likes = val
                    elif "repost" in lbl: reposts = val
                    elif "repl" in lbl: replies = val
            except: pass

            if text:
                results.append({"text":text,"user":user,"handle":handle,"time":time_str,"link":link,
                                 "likes":likes,"reposts":reposts,"replies":replies})
        except: pass

    ctx.close()
    browser.close()

print(json.dumps(results))
