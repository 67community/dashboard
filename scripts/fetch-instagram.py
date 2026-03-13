#!/usr/bin/env python3
"""Fetch Instagram #67coin posts via Playwright persistent Firefox profile → Supabase kv_store
Login with 2FA, then scrape hashtag page.
"""
import os, json, time, urllib.request
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / '.env')

SB_URL  = os.environ["SUPABASE_URL"]
SB_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
IG_USER = os.environ.get("IG_USERNAME", "bawosay454")
IG_PASS = os.environ.get("IG_PASSWORD", "")
IG_2FA_SEED = os.environ.get("IG_2FA_SEED", "")
PROFILE_DIR = str(Path(__file__).parent / ".instagram_browser_profile")

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

    print("📸 Instagram scraper starting (Playwright + persistent profile)...")

    with sync_playwright() as p:
        browser = p.firefox.launch_persistent_context(
            PROFILE_DIR,
            headless=False,
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
        )

        page = browser.pages[0] if browser.pages else browser.new_page()

        # Check if logged in
        page.goto("https://www.instagram.com/", wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)

        # If login page appears
        if "login" in page.url or page.query_selector('input[name="username"]'):
            print("  Logging in...")
            page.fill('input[name="username"]', IG_USER)
            page.fill('input[name="password"]', IG_PASS)
            page.click('button[type="submit"]')
            time.sleep(5)

            # Check for 2FA
            twofa_input = page.query_selector('input[name="verificationCode"]')
            if twofa_input:
                code = pyotp.TOTP(IG_2FA_SEED).now()
                print(f"  Entering 2FA code: {code}")
                twofa_input.fill(code)
                page.click('button:has-text("Confirm")')
                time.sleep(5)

            # Dismiss notifications popup if present
            try:
                page.click('button:has-text("Not Now")', timeout=5000)
            except:
                pass
            print("  ✅ Logged in")
        else:
            print("  ✅ Already logged in (session active)")

        # Navigate to hashtag page
        print("  Loading #67coin hashtag...")
        page.goto("https://www.instagram.com/explore/tags/67coin/", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)

        # Scroll to load more posts
        print("  Scrolling to load posts...")
        for i in range(5):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)

        # Extract posts from page
        posts_data = page.evaluate("""() => {
            const posts = [];
            // Instagram renders posts as links with images
            const links = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]');
            const seen = new Set();
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!href || seen.has(href)) return;
                seen.add(href);
                const shortcode = href.split('/p/')[1]?.replace('/', '') || '';
                const img = link.querySelector('img');
                const video = link.querySelector('video, svg[aria-label*="Video"], span[aria-label*="Video"], div[class*="video"]');
                posts.push({
                    shortcode: shortcode,
                    url: 'https://www.instagram.com' + href,
                    thumbnail: img ? img.src : '',
                    alt: img ? (img.alt || '') : '',
                    is_video: !!video,
                });
            });
            return posts;
        }""")

        print(f"  Found {len(posts_data)} posts")

        posts = []
        for p in (posts_data or [])[:20]:
            posts.append({
                "id": p.get("shortcode", ""),
                "url": p.get("url", ""),
                "thumbnail": p.get("thumbnail", ""),
                "is_video": p.get("is_video", False),
                "caption": p.get("alt", "")[:120],
                "timestamp": 0,
            })

        browser.close()

    result = {
        "total_posts": len(posts_data) if posts_data else 0,
        "posts": posts,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    sb_upsert("instagram_posts", result)
    print(f"✅ Supabase: instagram_posts ({len(posts)} posts)")

if __name__ == "__main__":
    main()
