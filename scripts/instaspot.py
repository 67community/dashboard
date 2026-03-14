#!/usr/bin/env python3
"""Instagram #67 scraper — Playwright Firefox, slow scroll, API intercept, max 100 posts → Supabase"""
import os, json, time, urllib.request
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path("/Users/oscarbrendon/67agent-mission-control/.env"))

SB_URL  = os.environ["SUPABASE_URL"]
SB_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
IG_USER = os.environ.get("IG_USERNAME", "bawosay454")
IG_PASS = os.environ.get("IG_PASSWORD", "")
IG_2FA_SEED = os.environ.get("IG_2FA_SEED", "")
PROFILE_DIR = "/Users/oscarbrendon/67agent-mission-control/scripts/.instagram_browser_profile"

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=data, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    urllib.request.urlopen(req, timeout=10)

def main():
    from playwright.sync_api import sync_playwright
    import pyotp

    print("📸 Instagram #67 scraper (slow scroll + API intercept, max 100)...")

    with sync_playwright() as p:
        browser = p.firefox.launch_persistent_context(
            PROFILE_DIR, headless=False,
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
        )
        page = browser.pages[0] if browser.pages else browser.new_page()

        post_stats = {}
        def handle_response(response):
            try:
                url = response.url
                if "graphql" in url or "api/v1/tags" in url or "web_info" in url or "sections" in url:
                    data = response.json()
                    def extract_posts(obj, depth=0):
                        if depth > 6 or not isinstance(obj, (dict, list)): return
                        if isinstance(obj, dict):
                            if "shortcode" in obj:
                                sc = obj["shortcode"]
                                cap = ""
                                if isinstance(obj.get("caption"), dict):
                                    cap = obj["caption"].get("text", "")[:120]
                                elif isinstance(obj.get("edge_media_to_caption"), dict):
                                    edges = obj["edge_media_to_caption"].get("edges", [])
                                    if edges: cap = edges[0].get("node", {}).get("text", "")[:120]
                                else:
                                    cap = str(obj.get("caption", ""))[:120]
                                
                                thumb = obj.get("thumbnail_src", obj.get("display_url", ""))
                                if not thumb:
                                    iv2 = obj.get("image_versions2", {})
                                    cands = iv2.get("candidates", [])
                                    if cands: thumb = cands[0].get("url", "")

                                post_stats[sc] = {
                                    "likes": obj.get("edge_liked_by", {}).get("count", obj.get("like_count", 0)),
                                    "comments": obj.get("edge_media_to_comment", {}).get("count", obj.get("comment_count", 0)),
                                    "views": obj.get("video_view_count", obj.get("play_count", 0)),
                                    "thumbnail": thumb,
                                    "caption": cap,
                                    "is_video": obj.get("is_video", False),
                                    "timestamp": obj.get("taken_at_timestamp", obj.get("taken_at", 0)),
                                }
                            for v in obj.values():
                                extract_posts(v, depth+1)
                        elif isinstance(obj, list):
                            for item in obj:
                                extract_posts(item, depth+1)
                    extract_posts(data)
                    if post_stats:
                        print(f"  📡 API intercept — {len(post_stats)} posts with stats")
            except:
                pass

        page.on("response", handle_response)

        page.goto("https://www.instagram.com/", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)

        if "login" in page.url or page.query_selector('input[name="username"]'):
            print("  Logging in...")
            page.fill('input[name="username"]', IG_USER)
            page.fill('input[name="password"]', IG_PASS)
            page.click('button[type="submit"]')
            time.sleep(5)
            twofa_input = page.query_selector('input[name="verificationCode"]')
            if twofa_input:
                code = pyotp.TOTP(IG_2FA_SEED).now()
                print(f"  2FA: {code}")
                twofa_input.fill(code)
                page.click('button:has-text("Confirm")')
                time.sleep(5)
            try: page.click('button:has-text("Not Now")', timeout=5000)
            except: pass
            print("  ✅ Logged in")
        else:
            print("  ✅ Already logged in")

        print("  Loading #67...")
        page.goto("https://www.instagram.com/explore/tags/67/", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)

        prev_count = 0; stall = 0
        for i in range(60):
            page.evaluate("window.scrollBy(0, window.innerHeight * 0.8)")
            time.sleep(2.5)
            page.evaluate("() => document.querySelectorAll('img').forEach(img => { if (!img.complete) img.loading = 'eager'; })")
            time.sleep(0.5)
            count = page.evaluate("() => document.querySelectorAll('a[href*=\"/p/\"], a[href*=\"/reel/\"]').length")
            if i % 10 == 0: print(f"  Scroll {i}: {count} posts, {len(post_stats)} with stats")
            if count >= 100: print(f"  ✅ {count} posts!"); break
            if count == prev_count: stall += 1
            else: stall = 0
            if stall >= 8: print(f"  Stalled at {count}"); break
            prev_count = count

        print("  ⬆️ Re-scrolling for thumbnails...")
        for _ in range(20):
            page.evaluate("window.scrollBy(0, -window.innerHeight * 2)")
            time.sleep(0.3)
        time.sleep(1)
        for _ in range(20):
            page.evaluate("window.scrollBy(0, window.innerHeight * 2)")
            time.sleep(0.3)
        time.sleep(2)

        dom_posts = page.evaluate("""() => {
            const posts = []; const seen = new Set();
            document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || seen.has(href)) return;
                seen.add(href);
                const shortcode = (href.split('/p/')[1] || href.split('/reel/')[1] || '').replace('/', '');
                const img = link.querySelector('img');
                posts.push({
                    shortcode: shortcode,
                    url: 'https://www.instagram.com' + href,
                    thumbnail: img ? (img.src || '') : '',
                    alt: img ? (img.alt || '') : '',
                });
            });
            return posts;
        }""")

        browser.close()

        posts = []
        for p_data in dom_posts[:100]:
            sc = p_data.get("shortcode", "")
            stats = post_stats.get(sc, {})
            thumb = stats.get("thumbnail") or p_data.get("thumbnail", "")
            posts.append({
                "id": sc,
                "url": p_data.get("url", ""),
                "thumbnail": thumb,
                "is_video": stats.get("is_video", False),
                "caption": stats.get("caption") or p_data.get("alt", "")[:120],
                "likes": stats.get("likes", 0),
                "comments": stats.get("comments", 0),
                "views": stats.get("views", 0),
                "timestamp": stats.get("timestamp", 0),
            })

        with_thumb = sum(1 for pp in posts if pp["thumbnail"])
        with_stats = sum(1 for pp in posts if pp["likes"] > 0)
        print(f"\n  📊 {len(posts)} posts | {with_thumb} thumbnails | {with_stats} with stats")

        result = {"hashtag": "67", "posts": posts, "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        sb_upsert("instagram_posts", result)
        print(f"✅ Done: {len(posts)} posts → Supabase")

if __name__ == "__main__":
    main()
