#!/usr/bin/env python3
"""Fetch Instagram #67coin latest posts via RapidAPI instagram-data1 → Supabase kv_store"""
import os, json, urllib.request, time
from pathlib import Path; from dotenv import load_dotenv; load_dotenv(Path(__file__).resolve().parent.parent / '.env')

SB_URL  = os.environ["SUPABASE_URL"]
SB_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
RAPIDAPI_KEY = os.environ["RAPIDAPI_KEY"]

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=data, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "User-Agent": "Mozilla/5.0", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    urllib.request.urlopen(req, timeout=10)

print("Fetching Instagram #67coin posts...")
req = urllib.request.Request(
    "https://instagram-data1.p.rapidapi.com/hashtag/feed/?hashtag=67coin",
    headers={
        "x-rapidapi-host": "instagram-data1.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
        "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"
    }
)
data = json.loads(urllib.request.urlopen(req, timeout=20).read())
items = data.get("collector", [])
print(f"  Found {len(items)} posts")

posts = []
for p in items[:12]:
    posts.append({
        "id": p.get("shortcode", p.get("id")),
        "type": p.get("type", ""),
        "is_video": p.get("is_video", False),
        "url": f"https://www.instagram.com/p/{p.get('shortcode', '')}",
        "thumbnail": p.get("display_url", p.get("thumbnail_src", "")),
        "likes": p.get("likes", p.get("edge_liked_by", {}).get("count", 0)),
        "comments": p.get("comments", p.get("edge_media_to_comment", {}).get("count", 0)),
        "caption": (p.get("description") or p.get("text") or "")[:120],
        "owner": p.get("owner", {}).get("username", ""),
        "timestamp": p.get("taken_at_timestamp", 0),
    })

result = {
    "total_posts": data.get("count", len(items)),
    "posts": posts,
    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
}

sb_upsert("instagram_posts", result)
print(f"✅ Supabase: instagram_posts ({len(posts)} posts)")
