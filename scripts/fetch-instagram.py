#!/usr/bin/env python3
"""Scrape Instagram #67 tag → Supabase. Every 1 hour."""
import json, asyncio, urllib.request
from pathlib import Path

SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "***REMOVED_SERVICE_KEY***"
PROFILE = Path("/Users/oscarbrendon/67agent-mission-control/scripts/.instagram_profile")

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

async def run():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        ctx = await p.firefox.launch_persistent_context(str(PROFILE), headless=False)
        page = await ctx.new_page()
        await page.goto("https://www.instagram.com/explore/tags/67/", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(4000)
        # Dismiss ads/cookie/notification popups
        for _ in range(30):  # wait up to 2.5 min for manual dismiss
            popup = await page.query_selector('button:has-text("OK"), button:has-text("Not Now"), button:has-text("Decline"), button:has-text("Accept"), div[role="dialog"] button')
            if popup:
                try:
                    await popup.click()
                    print("  ✅ Dismissed popup")
                    await page.wait_for_timeout(2000)
                except:
                    print("  🖐️ Popup detected — dismiss it manually...")
                    await page.wait_for_timeout(5000)
            else:
                break
        for _ in range(15):
            await page.evaluate("window.scrollBy(0, 1000)")
            await page.wait_for_timeout(800)

        posts = await page.evaluate("""() => {
            const links = Array.from(document.querySelectorAll('a[href*="/p/"]'))
            return links.slice(0, 60).map(a => {
                const img = a.querySelector('img')
                return {
                    link: 'https://www.instagram.com' + a.getAttribute('href'),
                    thumbnail: img?.src || '',
                    alt: img?.alt || ''
                }
            })
        }""")
        await ctx.close()

    # Deduplicate
    seen, result = set(), []
    for p in posts:
        if p["link"] not in seen and p["thumbnail"]:
            seen.add(p["link"])
            result.append(p)

    sb_upsert("instagram_posts", result)
    print(f"✅ instagram_posts synced ({len(result)} posts)")

asyncio.run(run())
