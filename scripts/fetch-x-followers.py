#!/usr/bin/env python3
"""Scrape @67coinX follower count from Twitter using a session file."""
import json, asyncio, os, sys
from pathlib import Path
from glob import glob

SESSIONS_DIR = Path("/Users/oscarbrendon/.openclaw/workspace/skills/67coin/assets/sessions")
DATA_JSON    = Path(__file__).parent.parent / "public/data.json"
TARGET       = "67coinX"
PROXY        = "http://gw.dataimpulse.com:823"
PROXY_USER   = "7e379971cf932ac8eb64"
PROXY_PASS   = "dbdbbaad5bc9f565"

def get_sessions():
    return sorted(glob(str(SESSIONS_DIR / "session.*.json")))

async def try_scrape(session_file: str) -> int | None:
    from playwright.async_api import async_playwright
    session = json.load(open(session_file))

    async with async_playwright() as p:
        browser = await p.firefox.launch(
            headless=True,
            proxy={"server": PROXY, "username": PROXY_USER, "password": PROXY_PASS},
        )
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
        )
        await ctx.add_cookies(session.get("cookies", []))

        for origin in session.get("origins", []):
            if origin.get("origin","").startswith("https://x.com") or origin.get("origin","").startswith("https://twitter.com"):
                try:
                    await ctx.add_init_script(f"""
                        Object.entries({json.dumps({i['name']: i['value'] for i in origin.get('localStorage', [])})}).forEach(([k,v])=>localStorage.setItem(k,v))
                    """)
                except: pass

        page = await ctx.new_page()
        try:
            await page.goto(f"https://x.com/{TARGET}", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(3000)

            followers = await page.evaluate("""() => {
                const text = document.body.innerText
                const lines = text.split('\\n')
                for (const line of lines) {
                    if (line.toLowerCase().includes('follower')) {
                        const m = line.match(/([\\d,\\.]+[KkMm]?)\\s*Follower/)
                        if (m) return m[1]
                    }
                }
                return null
            }""")

            if followers:
                print(f"✅ Session {Path(session_file).stem}: followers = {followers}")
                await ctx.close()
                await browser.close()
                # parse "1.6K" → 1600 etc
                f = followers.strip().upper().replace(",","")
                if "K" in f: return int(float(f.replace("K","")) * 1000)
                if "M" in f: return int(float(f.replace("M","")) * 1_000_000)
                return int(f)

            title = await page.title()
            print(f"⚠️  Session {Path(session_file).stem}: no followers found (title: {title[:50]})")
        except Exception as e:
            print(f"❌ Session {Path(session_file).stem}: {e}")
        finally:
            await ctx.close()
            await browser.close()
    return None

async def main():
    sessions = get_sessions()
    print(f"Trying sessions to scrape @{TARGET} followers...")
    
    for sf in sessions[:10]:  # try first 10 sessions
        result = await try_scrape(sf)
        if result and result > 100:
            print(f"\n✅ Followers: {result:,}")
            # Update data.json
            with open(DATA_JSON) as f:
                data = json.load(f)
            sp = data.get("social_pulse", {})
            old = sp.get("twitter_followers", 0)
            sp["follower_change_24h"] = result - old
            sp["twitter_followers"] = result
            data["social_pulse"] = sp
            with open(DATA_JSON, "w") as f:
                json.dump(data, f, indent=2)
            print(f"✅ data.json updated: {old} → {result}")
            return
    
    print("❌ All sessions failed")

asyncio.run(main())
