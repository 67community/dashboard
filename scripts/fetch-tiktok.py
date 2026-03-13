#!/usr/bin/env python3
"""Fetch TikTok @67coin videos via Playwright persistent Firefox profile → Supabase kv_store
Run every 6h. If Cloudflare puzzle appears, solve manually, then script continues.
"""
import os, json, time, urllib.request
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / '.env')

SB_URL  = os.environ["SUPABASE_URL"]
SB_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
PROFILE_DIR = str(Path(__file__).parent / ".tiktok_browser_profile")

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=data, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    urllib.request.urlopen(req, timeout=10)

def main():
    from playwright.sync_api import sync_playwright
    
    print("🎬 TikTok scraper starting (Playwright + persistent profile)...")
    
    with sync_playwright() as p:
        browser = p.firefox.launch_persistent_context(
            PROFILE_DIR,
            headless=False,
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
        )
        
        page = browser.pages[0] if browser.pages else browser.new_page()
        
        # Navigate to profile
        print("  Loading @67coin profile...")
        page.goto("https://www.tiktok.com/@67coin", wait_until="domcontentloaded", timeout=30000)
        
        # Wait for CF if needed (user solves manually)
        time.sleep(5)
        
        # Check if CF challenge
        if "challenge" in page.url or "captcha" in page.content().lower():
            print("⚠️  Cloudflare puzzle detected — solve it manually!")
            print("    Waiting up to 120 seconds...")
            for i in range(24):
                time.sleep(5)
                if "67coin" in page.url:
                    print("  ✅ Puzzle solved!")
                    break
            else:
                print("  ❌ Timeout — puzzle not solved")
                browser.close()
                return
        
        # Wait for content to load
        time.sleep(3)
        
        # Extract data from page
        data = page.evaluate("""() => {
            // Try to get SIGI_STATE or __UNIVERSAL_DATA
            const scripts = document.querySelectorAll('script');
            for (const s of scripts) {
                if (s.id === '__UNIVERSAL_DATA_FOR_REHYDRATION__' || s.id === 'SIGI_STATE') {
                    try { return JSON.parse(s.textContent); } catch(e) {}
                }
            }
            return null;
        }""")
        
        stats = {}
        videos = []
        
        if data:
            # Extract from __UNIVERSAL_DATA
            default_scope = data.get("__DEFAULT_SCOPE__", {})
            user_detail = default_scope.get("webapp.user-detail", {})
            user_info = user_detail.get("userInfo", {})
            stats = user_info.get("stats", {})
            user = user_info.get("user", {})
            
            print(f"  Followers: {stats.get('followerCount')}, Videos: {stats.get('videoCount')}, Likes: {stats.get('heartCount')}")
        
        # Scroll to load videos
        print("  Scrolling to load videos...")
        for i in range(8):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
        
        # Extract video elements
        video_data = page.evaluate("""() => {
            const items = document.querySelectorAll('[data-e2e="user-post-item"], [class*="DivItemContainer"]');
            const results = [];
            items.forEach(item => {
                const link = item.querySelector('a');
                const desc = item.querySelector('[class*="title"], [class*="desc"], [data-e2e="video-desc"]');
                const views = item.querySelector('[class*="video-count"], [data-e2e="video-views"]');
                if (link) {
                    results.push({
                        url: link.href,
                        desc: desc ? desc.textContent.trim().slice(0, 120) : '',
                        views_text: views ? views.textContent.trim() : '0',
                        thumbnail: (item.querySelector('img') || {}).src || '',
                    });
                }
            });
            return results;
        }""")
        
        for v in (video_data or [])[:30]:
            vid_id = v.get("url", "").split("/")[-1].split("?")[0]
            # Parse views text (e.g., "1.2M", "45K", "123")
            vt = v.get("views_text", "0").replace(",", "")
            try:
                if "M" in vt: view_count = int(float(vt.replace("M","")) * 1000000)
                elif "K" in vt: view_count = int(float(vt.replace("K","")) * 1000)
                else: view_count = int(vt) if vt.isdigit() else 0
            except: view_count = 0
            
            videos.append({
                "id": vid_id,
                "desc": v.get("desc", ""),
                "url": v.get("url", ""),
                "thumbnail": v.get("thumbnail", ""),
                "views": view_count,
            })
        
        browser.close()
    
    result = {
        "followers": stats.get("followerCount", 0),
        "following": stats.get("followingCount", 0),
        "video_count": stats.get("videoCount", 0),
        "total_likes": stats.get("heartCount", 0),
        "nickname": "67coin",
        "videos": videos,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    
    sb_upsert("tiktok_spotlight", result)
    print(f"✅ Supabase: tiktok_spotlight ({len(videos)} videos, {stats.get('followerCount')} followers)")

if __name__ == "__main__":
    main()
