#!/usr/bin/env python3
"""TikTok videos by hashtag → Supabase via tikwm.com API. Every 6 hours."""
import os
from pathlib import Path; from dotenv import load_dotenv; load_dotenv(Path(__file__).resolve().parent.parent / '.env')
import json, urllib.request, urllib.parse, time

SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]

KEYWORDS = ["67coin", "67 coin", "official 67", "mav67", "67kids", "maverick 67", "67kid"]
MAX_PER_KEYWORD = 30

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

def sb_get(key):
    try:
        req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store?key=eq.{key}&select=value",
            headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
        with urllib.request.urlopen(req, timeout=10) as r:
            rows = json.load(r)
        return rows[0]["value"] if rows else []
    except: return []

def fetch_keyword(keyword, count=30):
    videos = []
    cursor = 0
    while len(videos) < count:
        url = f"https://www.tikwm.com/api/feed/search?keywords={urllib.parse.quote(keyword)}&count=20&cursor={cursor}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.load(r)
            if data.get("code") != 0:
                break
            vids = data.get("data", {}).get("videos", [])
            if not vids:
                break
            videos.extend(vids)
            cursor = data.get("data", {}).get("cursor", 0)
            if not data.get("data", {}).get("hasMore", False):
                break
            time.sleep(1)
        except Exception as e:
            print(f"    ⚠️ '{keyword}': {e}")
            break
    return videos[:count]

def main():
    seen_ids = set()
    all_videos = []

    for kw in KEYWORDS:
        raw = fetch_keyword(kw, MAX_PER_KEYWORD)
        count = 0
        for v in raw:
            vid_id = str(v.get("video_id", v.get("id", "")))
            if not vid_id or vid_id in seen_ids:
                continue
            seen_ids.add(vid_id)

            author = v.get("author", {})
            username = author.get("unique_id", "") if isinstance(author, dict) else ""
            cover = v.get("cover", v.get("origin_cover", ""))

            all_videos.append({
                "id": vid_id,
                "video_url": f"https://www.tiktok.com/@{username}/video/{vid_id}",
                "thumbnail_url": cover,
                "plays": v.get("play_count", 0),
                "likes": v.get("digg_count", 0),
                "comments": v.get("comment_count", 0),
                "description": v.get("title", ""),
            })
            count += 1
        print(f"  '{kw}' → {count} new videos")
        time.sleep(1)

    if all_videos:
        old_list = sb_get("tiktok_spotlight")
        old_map = {v.get("id", ""): v for v in old_list if isinstance(v, dict)}
        for v in all_videos:
            old_map[v["id"]] = v
        merged = sorted(old_map.values(), key=lambda x: x.get("plays", 0), reverse=True)[:180]
        sb_upsert("tiktok_spotlight", merged)
        print(f"\n✅ tiktok_spotlight synced ({len(merged)} videos, {len(all_videos)} new)")
    else:
        print("⚠️ No new videos — keeping existing data")

main()
