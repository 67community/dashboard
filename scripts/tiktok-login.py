#!/usr/bin/env python3
"""Run this once to log into TikTok and save the session."""
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        ctx = await p.firefox.launch_persistent_context(
            "scripts/.tiktok_browser_profile",
            headless=False,
            viewport={"width": 390, "height": 844},
        )
        page = await ctx.new_page()
        await page.goto("https://www.tiktok.com/login")
        print("Tarayici acildi. TikToka giris yap.")
        print("Giris bittikten sonra buraya don ve Enter'a bas.")
        input()
        await ctx.close()
        print("Session kaydedildi! Artik fetch-tiktok.py calisir.")

asyncio.run(run())
