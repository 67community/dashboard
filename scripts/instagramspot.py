#!/usr/bin/env python3
"""Instagram #67 scraper v2 — collect posts during scroll (DOM recycles), max 100"""
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

    print("📸 Instagram #67 v2 — collect during scroll, max 100...")

    with sync_playwright() as p:
        browser = p.firefox.launch_persistent_context(
            PROFILE_DIR, headless=False,
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
        )
        page = browser.pages[0] if browser.pages else browser.new_page()

        # API intercept for stats
        post_stats = {}
        def handle_response(response):
            try:
                url = response.url
                if any(x in url for x in ["graphql", "api/v1/tags", "sections", "web_info", "feed/tag"]):
                    data = response.json()
                    def extract(obj, depth=0):
                        if depth > 8 or not isinstance(obj, (dict, list)): return
                        if isinstance(obj, dict):
                            if "shortcode" in obj or "code" in obj:
                                sc = obj.get("shortcode") or obj.get("code", "")
                                if not sc: return
                                cap = ""
                                if isinstance(obj.get("caption"), dict):
                                    cap = obj["caption"].get("text", "")[:120]
                                elif isinstance(obj.get("edge_media_to_caption"), dict):
                                    edges = obj["edge_media_to_caption"].get("edges", [])
                                    if edges: cap = edges[0].get("node", {}).get("text", "")[:120]
                                
                                thumb = obj.get("thumbnail_src") or obj.get("display_url") or ""
                                if not thumb:
                                    cands = obj.get("image_versions2", {}).get("candidates", [])
                                    if cands: thumb = cands[0].get("url", "")
                                
                                post_stats[sc] = {
                                    "likes": obj.get("edge_liked_by", {}).get("count", obj.get("like_count", 0)),
                                    "comments": obj.get("edge_media_to_comment", {}).get("count", obj.get("comment_count", 0)),
                                    "views": obj.get("video_view_count", obj.get("play_count", 0)),
                                    "thumbnail": thumb,
                                    "caption": cap,
                                    "is_video": obj.get("is_video", obj.get("media_type", 0) == 2),
                                    "timestamp": obj.get("taken_at_timestamp", obj.get("taken_at", 0)),
                                }
                            for v in obj.values():
                                extract(v, depth+1)
                        elif isinstance(obj, list):
                            for item in obj:
                                extract(item, depth+1)
                    extract(data)
            except:
                pass

        page.on("response", handle_response)

        # Login check
        page.goto("https://www.instagram.com/", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        if "login" in page.url or page.query_selector('input[name="username"]'):
            print("  Logging in...")
            page.fill('input[name="username"]', IG_USER)
            page.fill('input[name="password"]', IG_PASS)
            page.click('button[type="submit"]')
            time.sleep(5)
            twofa = page.query_selector('input[name="verificationCode"]')
            if twofa:
                code = pyotp.TOTP(IG_2FA_SEED).now()
                print(f"  2FA: {code}")
                twofa.fill(code)
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

        # Inject collector that runs continuously in page
        page.evaluate("""() => {
            window.__ig_collected = window.__ig_collected || {};
            window.__ig_collector = setInterval(() => {
                document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(link => {
                    const href = link.getAttribute('href');
                    if (!href) return;
                    const sc = (href.split('/p/')[1] || href.split('/reel/')[1] || '').replace('/', '');
                    if (!sc || window.__ig_collected[sc]) return;
                    const img = link.querySelector('img');
                    window.__ig_collected[sc] = {
                        shortcode: sc,
                        url: 'https://www.instagram.com' + href,
                        thumbnail: img ? (img.src || '') : '',
                        alt: img ? (img.alt || '') : '',
                    };
                });
            }, 500);
        }""")

        # Slow scroll — collector grabs posts before DOM recycles them
        stall = 0; prev_collected = 0
        for i in range(80):
            page.evaluate("window.scrollBy(0, window.innerHeight * 0.6)")
            time.sleep(2)
            
            collected = page.evaluate("() => Object.keys(window.__ig_collected).length")
            if i % 10 == 0:
                print(f"  Scroll {i}: {collected} collected, {len(post_stats)} with stats")
            if collected >= 100:
                print(f"  ✅ {collected} posts collected!")
                break
            if collected == prev_collected:
                stall += 1
                if stall >= 10:
                    print(f"  Stalled at {collected}")
                    break
            else:
                stall = 0
            prev_collected = collected

        # Stop collector, get results
        page.evaluate("() => clearInterval(window.__ig_collector)")
        dom_posts = page.evaluate("() => Object.values(window.__ig_collected)")
        
        browser.close()

        # Merge
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
