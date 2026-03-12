#!/usr/bin/env python3
"""Scrape TikTok videos by tags → Supabase. Every 1 hour."""
import json, asyncio
from pathlib import Path
import urllib.request

REPO_ROOT   = Path(__file__).parent.parent
THUMB_DIR   = REPO_ROOT / "public/tiktok-thumbs"
PROFILE_DIR = REPO_ROOT / ".tiktok_browser_profile"
THUMB_DIR.mkdir(exist_ok=True)

SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# Profile + hashtag pages to scrape
SOURCES = [
    ("tag", "https://www.tiktok.com/tag/67", '[data-e2e="video-item"]'),
]

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

STORAGE_BASE = f"{SB_URL}/storage/v1/object/public/tiktok-thumbs"

def upload_thumb(filename: str, data: bytes) -> str:
    try:
        req = urllib.request.Request(
            f"{SB_URL}/storage/v1/object/tiktok-thumbs/{filename}",
            data=data, method="POST",
            headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                     "Content-Type": "image/jpeg", "x-upsert": "true"}
        )
        with urllib.request.urlopen(req, timeout=15): pass
        return f"{STORAGE_BASE}/{filename}"
    except: return ""

def sb_get(key):
    try:
        req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store?key=eq.{key}&select=value",
            headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
        with urllib.request.urlopen(req, timeout=10) as r:
            rows = json.load(r)
        return rows[0]["value"] if rows else []
    except: return []

async def run():
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        ctx = await p.firefox.launch_persistent_context(
            str(PROFILE_DIR), headless=False,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            viewport={"width": 390, "height": 844},
        )
        page = await ctx.new_page()

        # Capture video stats from API responses
        video_stats: dict = {}
        async def handle_response(response):
            if "api/challenge/item_list" in response.url or "api/post/item_list" in response.url:
                try:
                    data = await response.json()
                    for item in data.get("itemList", []):
                        vid_id = item.get("id","")
                        stats  = item.get("stats", {})
                        if vid_id:
                            video_stats[vid_id] = {
                                "plays":    stats.get("playCount", 0),
                                "likes":    stats.get("diggCount", 0),
                                "comments": stats.get("commentCount", 0),
                                "description": item.get("desc",""),
                            }
                except: pass
        page.on("response", handle_response)

        async def scrape(url, selector):
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(3000)
                # Wait for puzzle/captcha — try to solve automatically
                for attempt in range(10):
                    puzzle = await page.query_selector('div.captcha_verify_container, div[class*="captcha"], div[class*="puzzle"], div[id*="captcha"]')
                    if not puzzle:
                        break
                    print(f'  🧩 Puzzle detected! Attempting auto-solve (attempt {attempt+1})...')
                    # Screenshot the puzzle area
                    await page.screenshot(path='/tmp/tiktok_puzzle.png')
                    
                    # TikTok slider puzzle: find the slider and drag it
                    slider = await page.query_selector('div.secsdk-captcha-drag-icon, div[class*="slider"], button[class*="slider"]')
                    if slider:
                        box = await slider.bounding_box()
                        if box:
                            # Drag slider from left to approximate position
                            import random
                            start_x = box['x'] + box['width'] / 2
                            start_y = box['y'] + box['height'] / 2
                            # Try different drag distances
                            distances = [150, 200, 180, 160, 220, 130, 170, 190, 140, 210]
                            drag_dist = distances[attempt % len(distances)]
                            
                            await page.mouse.move(start_x, start_y)
                            await page.mouse.down()
                            # Move in small steps to simulate human
                            steps = 20
                            for step in range(steps):
                                await page.mouse.move(
                                    start_x + (drag_dist * (step + 1) / steps) + random.uniform(-2, 2),
                                    start_y + random.uniform(-1, 1),
                                )
                                await page.wait_for_timeout(random.randint(10, 30))
                            await page.mouse.up()
                            print(f'    Dragged {drag_dist}px')
                            await page.wait_for_timeout(3000)
                    else:
                        # Maybe click-based puzzle, try clicking verify
                        verify = await page.query_selector('button[class*="verify"], div[class*="verify-btn"]')
                        if verify:
                            await verify.click()
                        await page.wait_for_timeout(5000)
                for _ in range(16):
                    await page.evaluate("window.scrollBy(0, 1200)")
                    await page.wait_for_timeout(600)
                return await page.evaluate(f"""() => {{
import os
                    const cards = document.querySelectorAll('{selector}')
                    return Array.from(cards).slice(0, 60).map(card => {{
                        const link = card.querySelector('a')
                        const img  = card.querySelector('img')
                        const url  = link?.href || ''
                        const thumb= img?.src || img?.getAttribute('src') || ''
                        const id   = url.match(/video\\/([0-9]+)/)?.[1] || ''
                        return {{ id, url, thumb }}
                    }})
                }}""")
            except Exception as e:
                print(f"  ⚠️ {url}: {e}")
                return []

        seen_ids = set()
        all_videos = []
        for kind, url, selector in SOURCES:
            vids = await scrape(url, selector)
            for v in vids:
                if v["id"] and v["id"] not in seen_ids:
                    seen_ids.add(v["id"])
                    all_videos.append(v)
            print(f"  {url} → {len(vids)} videos")

        # Old stats from Supabase
        old_list = sb_get("tiktok_spotlight")
        old_map  = {v.get("id",""): v for v in old_list}

        result = []
        for v in all_videos:
            if not v["id"]: continue
            uid      = v["id"]
            filepath = THUMB_DIR / f"{uid}.jpg"
            local_thumb = None

            if not filepath.exists() and v["thumb"]:
                try:
                    resp = await page.request.get(v["thumb"], headers={"Referer":"https://www.tiktok.com/"})
                    if resp.status == 200:
                        body = await resp.body()
                        if len(body) > 1000:
                            filepath.write_bytes(body)
                            local_thumb = upload_thumb(f"{uid}.jpg", body) or f"/tiktok-thumbs/{uid}.jpg"
                except: pass
            elif filepath.exists():
                local_thumb = f"{STORAGE_BASE}/{uid}.jpg"

            stats = video_stats.get(uid, old_map.get(uid, {}))
            result.append({
                "id":            uid,
                "video_url":     v["url"],
                "thumbnail_url": local_thumb or v["thumb"] or stats.get("thumbnail_url",""),
                "plays":         stats.get("plays", 0),
                "likes":         stats.get("likes", 0),
                "comments":      stats.get("comments", 0),
                "description":   stats.get("description",""),
            })

        await ctx.close()

    if result:
        sb_upsert("tiktok_spotlight", result)
        print(f"\n✅ tiktok_spotlight synced ({len(result)} videos)")
    else:
        print("⚠️ No videos found")

asyncio.run(run())
