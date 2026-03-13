#!/usr/bin/env python3
"""Fetch #67 hashtag latest videos via Playwright → Supabase"""
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

    print("🎬 TikTok #67 hashtag scrape (180+ videos)...")

    with sync_playwright() as p:
        browser = p.firefox.launch_persistent_context(
            PROFILE_DIR, headless=False,
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
        )
        page = browser.pages[0] if browser.pages else browser.new_page()
        page.goto("https://www.tiktok.com/tag/67", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)

        # CF check
        if "challenge" in page.url or "captcha" in page.content().lower()[:2000]:
            print("⚠️  CF puzzle — solve manually!")
            for i in range(24):
                time.sleep(5)
                if "tag" in page.url:
                    print("  ✅ Solved!"); break
            else:
                print("  ❌ Timeout"); browser.close(); return

        time.sleep(3)
        print(f"  URL: {page.url}")

        # Scroll to load 180+ videos
        prev_count = 0
        stall_count = 0
        for i in range(60):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1.5)
            count = page.evaluate("() => document.querySelectorAll('a[href*=\"/video/\"]').length")
            if i % 5 == 0: print(f"  Scroll {i}: {count} videos")
            if count >= 180:
                print(f"  ✅ {count} videos!"); break
            if count == prev_count:
                stall_count += 1
                if stall_count >= 5:
                    print(f"  Stalled at {count}"); break
            else: stall_count = 0
            prev_count = count

        # Extract
        video_data = page.evaluate("""() => {
            const results = []; const seen = new Set();
            document.querySelectorAll('a[href*="/video/"]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || seen.has(href)) return;
                seen.add(href);
                const img = link.querySelector('img');
                const viewsEl = link.querySelector('[data-e2e="video-views"], strong');
                results.push({
                    url: href.startsWith('http') ? href : 'https://www.tiktok.com' + href,
                    thumbnail: img ? img.src : '',
                    views_text: viewsEl ? viewsEl.textContent.trim() : '0',
                    alt: img ? (img.alt || '') : '',
                });
            });
            return results;
        }""")

        print(f"  Extracted {len(video_data)} videos")

        videos = []
        for v in video_data:
            vid_id = v.get("url","").split("/video/")[-1].split("?")[0]
            vt = v.get("views_text","0").replace(",","")
            try:
                if "M" in vt: vc = int(float(vt.replace("M",""))*1000000)
                elif "K" in vt: vc = int(float(vt.replace("K",""))*1000)
                elif vt.isdigit(): vc = int(vt)
                else: vc = 0
            except: vc = 0
            videos.append({
                "id": vid_id, "desc": v.get("alt","")[:120],
                "url": v.get("url",""), "thumbnail": v.get("thumbnail",""), "views": vc,
            })

        browser.close()

    result = {
        "hashtag": "67",
        "videos": videos,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    sb_upsert("tiktok_spotlight", result)
    print(f"✅ Supabase: tiktok_spotlight ({len(videos)} videos from #67)")

if __name__ == "__main__":
    main()
