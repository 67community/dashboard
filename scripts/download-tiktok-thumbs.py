#!/usr/bin/env python3
"""Download TikTok thumbnails via Playwright (with browser cookies) and update data.json."""
import json, os, asyncio, hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
DATA_JSON = REPO_ROOT / "public/data.json"
THUMB_DIR = REPO_ROOT / "public/tiktok-thumbs"
PROFILE_DIR = REPO_ROOT / ".tiktok_browser_profile"
THUMB_DIR.mkdir(exist_ok=True)

async def run():
    from playwright.async_api import async_playwright

    with open(DATA_JSON) as f:
        data = json.load(f)

    tiktoks = data.get("tiktok_spotlight", [])
    to_fetch = [(i, v) for i, v in enumerate(tiktoks)
                if v.get("thumbnail_url") and not v["thumbnail_url"].startswith("/tiktok-thumbs/")]

    if not to_fetch:
        print("All thumbnails already local.")
        return

    async with async_playwright() as p:
        ctx = await p.firefox.launch_persistent_context(
            str(PROFILE_DIR),
            headless=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        )
        page = await ctx.new_page()
        await page.goto("https://www.tiktok.com/", wait_until="domcontentloaded", timeout=20000)

        updated = 0
        for i, video in to_fetch:
            url = video["thumbnail_url"]
            uid = video.get("id") or hashlib.md5(url.encode()).hexdigest()[:12]
            filename = f"{uid}.jpg"
            filepath = THUMB_DIR / filename

            try:
                resp = await page.request.get(url, headers={"Referer": "https://www.tiktok.com/"})
                if resp.status == 200:
                    body = await resp.body()
                    if len(body) > 1000:
                        filepath.write_bytes(body)
                        tiktoks[i]["thumbnail_url"] = f"/tiktok-thumbs/{filename}"
                        updated += 1
                        print(f"✅ {uid}: {len(body)//1024}KB")
                    else:
                        print(f"❌ {uid}: too small ({len(body)} bytes)")
                else:
                    print(f"❌ {uid}: HTTP {resp.status}")
            except Exception as e:
                print(f"❌ {uid}: {e}")

        await ctx.close()

    data["tiktok_spotlight"] = tiktoks
    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\nDone — {updated}/{len(to_fetch)} thumbnails downloaded")

asyncio.run(run())
