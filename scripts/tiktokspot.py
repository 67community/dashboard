#!/usr/bin/env python3
"""TikTok #67 v4 — extract views from embedded JSON + slow scroll for thumbnails"""
import os, json, time, urllib.request
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path("/Users/oscarbrendon/67agent-mission-control/.env"))

SB_URL  = os.environ["SUPABASE_URL"]
SB_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
PROFILE_DIR = "/Users/oscarbrendon/67agent-mission-control/scripts/.tiktok_browser_profile"

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=data, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    urllib.request.urlopen(req, timeout=10)

def main():
    from playwright.sync_api import sync_playwright
    print("🎬 TikTok #67 v4 — embedded JSON + slow scroll...")

    with sync_playwright() as p:
        browser = p.firefox.launch_persistent_context(
            PROFILE_DIR, headless=False,
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
        )
        page = browser.pages[0] if browser.pages else browser.new_page()
        
        # Intercept XHR responses to capture video data with stats
        video_stats = {}
        def handle_response(response):
            try:
                url = response.url
                if "api/challenge/item_list" in url or "api/search" in url or "/item_list" in url:
                    data = response.json()
                    items = data.get("itemList", data.get("items", []))
                    for item in items:
                        vid_id = item.get("id", "")
                        stats = item.get("stats", {})
                        video_info = item.get("video", {})
                        if vid_id:
                            video_stats[vid_id] = {
                                "plays": stats.get("playCount", 0),
                                "likes": stats.get("diggCount", 0),
                                "shares": stats.get("shareCount", 0),
                                "comments": stats.get("commentCount", 0),
                                "cover": video_info.get("cover", ""),
                                "desc": item.get("desc", ""),
                            }
                    if items:
                        print(f"  📡 Intercepted {len(items)} videos from API (total: {len(video_stats)})")
            except:
                pass
        
        page.on("response", handle_response)
        
        page.goto("https://www.tiktok.com/tag/67", wait_until="domcontentloaded", timeout=30000)
        time.sleep(6)

        if "challenge" in page.url:
            print("⚠️  CF puzzle!")
            for i in range(24):
                time.sleep(5)
                if "tag" in page.url: print("  ✅ Solved!"); break
            else: browser.close(); return

        # Also extract from embedded rehydration data
        rehydration = page.evaluate("""() => {
            const el = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
            if (!el) return null;
            try { return JSON.parse(el.textContent); } catch(e) { return null; }
        }""")
        
        if rehydration:
            ds = rehydration.get("__DEFAULT_SCOPE__", {})
            # Try different paths
            for key in ds:
                val = ds[key]
                if isinstance(val, dict):
                    items = val.get("itemList", val.get("items", []))
                    if isinstance(items, list):
                        for item in items:
                            if isinstance(item, dict) and item.get("id"):
                                vid_id = item["id"]
                                stats = item.get("stats", {})
                                video_info = item.get("video", {})
                                video_stats[vid_id] = {
                                    "plays": stats.get("playCount", 0),
                                    "likes": stats.get("diggCount", 0),
                                    "cover": video_info.get("cover", ""),
                                    "desc": item.get("desc", ""),
                                }
            print(f"  📦 Rehydration data: {len(video_stats)} videos with stats")
        
        time.sleep(3)

        # Slow scroll — trigger API pagination calls
        prev_count = 0; stall = 0
        for i in range(80):
            page.evaluate("window.scrollBy(0, window.innerHeight * 0.8)")
            time.sleep(2.5)  # slower scroll, wait for API response
            
            page.evaluate("""() => {
                document.querySelectorAll('img').forEach(img => { if (!img.complete) img.loading = 'eager'; });
            }""")
            time.sleep(0.5)

            count = page.evaluate("() => document.querySelectorAll('a[href*=\"/video/\"]').length")
            if i % 10 == 0: print(f"  Scroll {i}: {count} videos loaded, {len(video_stats)} with stats")
            if count >= 180: print(f"  ✅ {count} videos!"); break
            if count == prev_count: stall += 1
            else: stall = 0
            if stall >= 8: print(f"  Stalled at {count}"); break
            prev_count = count

        # Scroll back up + down to force all thumbnails
        print("  ⬆️ Re-scrolling to load all thumbnails...")
        for _ in range(25):
            page.evaluate("window.scrollBy(0, -window.innerHeight * 2)")
            time.sleep(0.3)
        time.sleep(1)
        for _ in range(25):
            page.evaluate("window.scrollBy(0, window.innerHeight * 2)")
            time.sleep(0.3)
        time.sleep(2)

        # Extract DOM data
        dom_videos = page.evaluate("""() => {
            const results = []; const seen = new Set();
            document.querySelectorAll('a[href*="/video/"]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || seen.has(href)) return;
                seen.add(href);
                const img = link.querySelector('img');
                results.push({
                    url: href.startsWith('http') ? href : 'https://www.tiktok.com' + href,
                    thumbnail: img ? (img.src || '') : '',
                    alt: img ? (img.alt || '') : '',
                });
            });
            return results;
        }""")

        browser.close()

        # Merge DOM thumbnails + API stats
        videos = []
        for v in dom_videos:
            vid_id = v.get("url","").split("/video/")[-1].split("?")[0]
            stats = video_stats.get(vid_id, {})
            thumb = stats.get("cover") or v.get("thumbnail", "")
            views = stats.get("plays", 0)
            desc = stats.get("desc") or v.get("alt", "")[:120]
            
            videos.append({
                "id": vid_id, "desc": desc,
                "url": v.get("url",""), "thumbnail": thumb, "views": views,
            })

        with_views = sum(1 for v in videos if v["views"] > 0)
        with_thumb = sum(1 for v in videos if v["thumbnail"])
        total_views = sum(v["views"] for v in videos)
        print(f"\n  📊 {len(videos)} videos | {with_thumb} thumbnails | {with_views} with views | {total_views:,} total plays")

        # Sort by views (most viewed first)
        videos.sort(key=lambda x: x["views"], reverse=True)
        for v in videos[:5]:
            print(f"    🎥 {v['views']:>12,} plays | {v['desc'][:50]}")

        result = {
            "hashtag": "67",
            "videos": videos,
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        sb_upsert("tiktok_spotlight", result)
        print(f"\n✅ Done: {len(videos)} videos → Supabase")

if __name__ == "__main__":
    main()
