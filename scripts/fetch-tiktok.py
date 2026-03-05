#!/usr/bin/env python3
"""Scrape TikTok @67coin videos, download thumbnails immediately, update data.json."""
import json, os, asyncio, re, hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
DATA_JSON = REPO_ROOT / "public/data.json"
THUMB_DIR = REPO_ROOT / "public/tiktok-thumbs"
PROFILE_DIR = REPO_ROOT / ".tiktok_browser_profile"
THUMB_DIR.mkdir(exist_ok=True)

async def run():
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        ctx = await p.firefox.launch_persistent_context(
            str(PROFILE_DIR),
            headless=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            viewport={"width": 390, "height": 844},
        )
        page = await ctx.new_page()

        async def scrape_videos(url, selector):
            print(f"Loading {url}...")
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(3000)
            for _ in range(3):
                await page.evaluate("window.scrollBy(0, 800)")
                await page.wait_for_timeout(1000)
            return await page.evaluate(f"""() => {{
                const cards = document.querySelectorAll('{selector}')
                return Array.from(cards).slice(0, 12).map(card => {{
                    const link = card.querySelector('a')
                    const img = card.querySelector('img')
                    const url = link?.href || ''
                    const thumb = img?.src || img?.getAttribute('src') || ''
                    const id = url.match(/video\\/([0-9]+)/)?.[1] || ''
                    return {{ id, url, thumb }}
                }})
            }}""")

        # @67coin profili + #67 tag sayfası
        profile_videos = await scrape_videos("https://www.tiktok.com/@67coin", '[data-e2e="user-post-item"]')
        tag_videos     = await scrape_videos("https://www.tiktok.com/tag/67",   '[data-e2e="challenge-item"]')

        # Birleştir, deduplicate
        seen_ids = set()
        videos = []
        for v in profile_videos + tag_videos:
            if v["id"] and v["id"] not in seen_ids:
                seen_ids.add(v["id"])
                videos.append(v)

        print(f"Found {len(videos)} videos")

        # Also grab stats from API response captured during page load
        # Try getting existing videos data
        videos_with_stats = []
        
        with open(DATA_JSON) as f:
            data = json.load(f)
        
        old_tiktoks = {v.get("id", ""): v for v in data.get("tiktok_spotlight", [])}

        for v in videos:
            if not v["id"]:
                continue
            
            uid = v["id"]
            filename = f"{uid}.jpg"
            filepath = THUMB_DIR / filename
            thumb_url = v["thumb"]

            # Download thumbnail immediately while session is active
            local_thumb = None
            if thumb_url and not (THUMB_DIR / filename).exists():
                try:
                    resp = await page.request.get(thumb_url, headers={"Referer": "https://www.tiktok.com/"})
                    if resp.status == 200:
                        body = await resp.body()
                        if len(body) > 1000:
                            filepath.write_bytes(body)
                            local_thumb = f"/tiktok-thumbs/{filename}"
                            print(f"✅ Thumb {uid}: {len(body)//1024}KB")
                except Exception as e:
                    print(f"⚠️ Thumb {uid}: {e}")
            elif (THUMB_DIR / filename).exists():
                local_thumb = f"/tiktok-thumbs/{filename}"

            # Merge with old stats if available
            old = old_tiktoks.get(uid, {})
            videos_with_stats.append({
                "id": uid,
                "video_url": v["url"],
                "thumbnail_url": local_thumb or thumb_url or old.get("thumbnail_url", ""),
                "plays": old.get("plays", 0),
                "likes": old.get("likes", 0),
                "comments": old.get("comments", 0),
                "description": old.get("description", ""),
            })

        await ctx.close()

        if videos_with_stats:
            data["tiktok_spotlight"] = videos_with_stats
            with open(DATA_JSON, "w") as f:
                json.dump(data, f, indent=2)
            print(f"\n✅ Saved {len(videos_with_stats)} TikTok videos to data.json")
        else:
            print("⚠️ No videos found — data.json unchanged")

asyncio.run(run())
