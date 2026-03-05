#!/usr/bin/env python3
"""X Search via Playwright — multi-query to collect 30+ tweets"""
import sys, json, re, random
from pathlib import Path
from playwright.sync_api import sync_playwright

PROXY = {"server":"http://gw.dataimpulse.com:823","username":"7e379971cf932ac8eb64","password":"dbdbbaad5bc9f565"}
mode  = sys.argv[1] if len(sys.argv) > 1 else "recent"
tab   = "live" if mode == "recent" else "top"
MAX   = 60

QUERIES = ["67coin", "67 coin", "maverick 67", "67kid", "67"]

ACCS_FILE = Path("/Users/oscarbrendon/.openclaw/workspace/skills/67coin/x-profile-changer/accounts.txt")
auth_tokens = [p.strip() for line in ACCS_FILE.read_text().splitlines() for p in line.split(":") if re.match(r'^[a-f0-9]{40}$', p.strip())]
random.shuffle(auth_tokens)

def parse_num(s):
    s = str(s).strip().replace(",","")
    if s.endswith("K"): return int(float(s[:-1])*1000)
    if s.endswith("M"): return int(float(s[:-1])*1000000)
    try: return int(s)
    except: return 0

def extract_tweets(page, seen):
    tweets = []
    for art in page.query_selector_all("article[data-testid='tweet']"):
        try:
            link_el = art.query_selector("a[href*='/status/']")
            link = "https://x.com" + link_el.get_attribute("href") if link_el else ""
            if not link or link in seen: continue
            seen.add(link)

            text_el = art.query_selector("[data-testid='tweetText']")
            time_el = art.query_selector("time")
            user_el = art.query_selector("[data-testid='User-Name']")

            text = text_el.inner_text() if text_el else ""
            time_str = time_el.get_attribute("datetime") if time_el else ""
            lines = user_el.inner_text().split("\n") if user_el else ["",""]
            user   = lines[0] if lines else ""
            handle = lines[1].lstrip("@") if len(lines) > 1 else ""

            likes = reposts = replies = 0
            for btn in art.query_selector_all("button[aria-label]"):
                lbl = (btn.get_attribute("aria-label") or "").lower()
                m = re.match(r'^([\d,]+(?:\.\d+)?[km]?)\s', lbl)
                val = parse_num(m.group(1)) if m else 0
                if "like" in lbl: likes = val
                elif "repost" in lbl: reposts = val
                elif "repl" in lbl: replies = val

            if text:
                tweets.append({"text":text,"user":user,"handle":handle,"time":time_str,"link":link,
                                "likes":likes,"reposts":reposts,"replies":replies})
        except: pass
    return tweets

results = []
seen    = set()

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)

    # Find a working session
    ctx = page = None
    for auth in auth_tokens[:20]:
        try:
            c = browser.new_context(proxy=PROXY, viewport={"width":1280,"height":900},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                locale="en-US")
            c.add_cookies([{"name":"auth_token","value":auth,"domain":".x.com","path":"/"}])
            p = c.new_page()
            p.route("**/*.{png,jpg,jpeg,gif,webp,mp4,svg}", lambda r: r.abort())
            p.goto("https://x.com/home", timeout=15000, wait_until="domcontentloaded")
            p.wait_for_timeout(1500)
            if "login" not in p.url and "flow" not in p.url:
                ctx, page = c, p
                break
            c.close()
        except: pass

    if not ctx:
        browser.close(); print("[]"); sys.exit(0)

    # Search each query
    for query in QUERIES:
        if len(results) >= MAX: break
        try:
            import urllib.parse
            q_enc = urllib.parse.quote(query)
            url = f"https://x.com/search?q={q_enc}&src=typed_query&f={tab}"
            page.goto(url, timeout=25000, wait_until="domcontentloaded")
            page.wait_for_timeout(3000)

            # Scroll 10 times per query
            for _ in range(10):
                page.keyboard.press("End")
                page.evaluate("window.scrollBy(0, 1500)")
                page.wait_for_timeout(800)

            new = extract_tweets(page, seen)
            results.extend(new)
        except: pass

    ctx.close()
    browser.close()

def is_english(text):
    # Filter out tweets with too many non-Latin characters (Turkish/Japanese/Arabic/Korean etc.)
    if not text: return False
    non_latin = sum(1 for c in text if ord(c) > 591)
    return non_latin / max(len(text), 1) < 0.3

results = [t for t in results if is_english(t["text"])]

# For popular: sort by engagement
if mode == "popular":
    results = sorted(results, key=lambda t: t["likes"] + t["reposts"]*2, reverse=True)

print(json.dumps(results[:MAX]))
