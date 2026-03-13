#!/usr/bin/env python3
"""TikTok #67 hashtag scraper v3 — slow scroll, wait for images"""
import os, json, time, urllib.request
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path("/Users/oscarbrendon/67agent-mission-control/.env"))

SB_URL  = os.environ["SUPABASE_URL"]
SB_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY", "")
PROFILE_DIR = "/Users/oscarbrendon/67agent-mission-control/scripts/.tiktok_browser_profile"

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=data, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    urllib.request.urlopen(req, timeout=10)

def rapidapi_video_detail(video_id):
    """Get play count + cover from RapidAPI"""
    try:
        req = urllib.request.Request(
            f"https://tiktok-api23.p.rapidapi.com/api/post/detail?videoId={video_id}",
            headers={"x-rapidapi-host": "tiktok-api23.p.rapidapi.com", "x-rapidapi-key": RAPIDAPI_KEY}
        )
        resp = urllib.request.urlopen(req, timeout=10)
        d = json.loads(resp.read())
        item = d.get("itemInfo", {}).get("itemStruct", {})
        stats = item.get("stats", {})
        cover = item.get("video", {}).get("cover", "")
        return {
            "plays": stats.get("playCount", 0),
            "likes": stats.get("diggCount", 0),
            "cover": cover,
        }
    except:
        return None

def main():
    from playwright.sync_api import sync_playwright
    print("🎬 TikTok #67 v3 — slow scroll + RapidAPI enrichment...")

    with sync_playwright() as p:
        browser = p.firefox.launch_persistent_context(
            PROFILE_DIR, headless=False,
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
        )
        page = browser.pages[0] if browser.pages else browser.new_page()
        page.goto("https://www.tiktok.com/tag/67", wait_until="domcontentloaded", timeout=30000)
        time.sleep(6)

        if "challenge" in page.url:
            print("⚠️  CF puzzle!")
            for i in range(24):
                time.sleep(5)
                if "tag" in page.url: print("  ✅ Solved!"); break
            else: browser.close(); return

        time.sleep(3)

        # SLOW scroll — wait for images to load between each scroll
        prev_count = 0; stall = 0
        for i in range(80):
            # Scroll one viewport height
            page.evaluate("window.scrollBy(0, window.innerHeight * 0.8)")
            time.sleep(2)  # wait for content

            # Wait for images in viewport to load
            page.evaluate("""() => {
                const imgs = document.querySelectorAll('img[src*="tiktokcdn"]');
                // trigger lazy loading by checking each
                imgs.forEach(img => { if (!img.complete) img.loading = 'eager'; });
            }""")
            time.sleep(1)

            count = page.evaluate("() => document.querySelectorAll('a[href*=\"/video/\"]').length")
            if i % 10 == 0: print(f"  Scroll {i}: {count} videos")
            if count >= 180: print(f"  ✅ {count} videos!"); break
            if count == prev_count: stall += 1
            else: stall = 0
            if stall >= 8: print(f"  Stalled at {count}"); break
            prev_count = count

        # Scroll back up slowly to force all thumbnails to load
        print("  ⬆️ Scrolling back up to force all thumbnails...")
        for _ in range(20):
            page.evaluate("window.scrollBy(0, -window.innerHeight * 2)")
            time.sleep(0.5)
        time.sleep(2)
        # Scroll back down
        for _ in range(20):
            page.evaluate("window.scrollBy(0, window.innerHeight * 2)")
            time.sleep(0.5)

        # Extract all videos
        video_data = page.evaluate("""() => {
            const results = []; const seen = new Set();
            document.querySelectorAll('a[href*="/video/"]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || seen.has(href)) return;
                seen.add(href);
                const img = link.querySelector('img');
                const thumb = img ? (img.src || img.getAttribute('data-src') || '') : '';
                results.push({
                    url: href.startsWith('http') ? href : 'https://www.tiktok.com' + href,
                    thumbnail: thumb,
                    alt: img ? (img.alt || '') : '',
                });
            });
            return results;
        }""")

        browser.close()
        
        with_thumb = sum(1 for v in video_data if v.get("thumbnail"))
        print(f"  Extracted {len(video_data)} videos, {with_thumb} with thumbnails")

        # Enrich top videos with RapidAPI (get views + stable cover)
        videos = []
        api_calls = 0
        MAX_API = 20  # conserve quota
        
        for idx, v in enumerate(video_data):
            vid_id = v.get("url","").split("/video/")[-1].split("?")[0]
            views = 0
            thumb = v.get("thumbnail", "")
            desc = v.get("alt", "")[:120]
            
            # Use RapidAPI for first MAX_API videos (get views + stable cover URL)
            if RAPIDAPI_KEY and api_calls < MAX_API and vid_id:
                detail = rapidapi_video_detail(vid_id)
                if detail:
                    views = detail.get("plays", 0)
                    if detail.get("cover"):
                        thumb = detail["cover"]  # stable CDN URL
                    api_calls += 1
                    if idx < 5:
                        print(f"    #{idx}: {views:,} plays | thumb: {'YES' if thumb else 'NO'}")
                    time.sleep(0.3)

            videos.append({
                "id": vid_id, "desc": desc,
                "url": v.get("url", ""), "thumbnail": thumb, "views": views,
            })

        total_views = sum(v["views"] for v in videos)
        print(f"  API calls used: {api_calls}, Total views: {total_views:,}")

        result = {
            "hashtag": "67",
            "videos": videos,
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        sb_upsert("tiktok_spotlight", result)
        print(f"✅ Done: {len(videos)} videos → Supabase")

if __name__ == "__main__":
    main()
