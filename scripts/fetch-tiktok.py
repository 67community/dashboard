#!/usr/bin/env python3
"""Fetch TikTok @67coin latest videos via RapidAPI tiktok-api23 → Supabase kv_store"""
import os, json, urllib.request, time
from pathlib import Path; from dotenv import load_dotenv; load_dotenv(Path(__file__).resolve().parent.parent / '.env')

SB_URL  = os.environ["SUPABASE_URL"]
SB_KEY  = os.environ["SUPABASE_SERVICE_KEY"]
RAPIDAPI_KEY = os.environ["RAPIDAPI_KEY"]

def rapidapi_get(endpoint, params=""):
    url = f"https://tiktok-api23.p.rapidapi.com/api/{endpoint}?{params}"
    req = urllib.request.Request(url, headers={
        "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY, "User-Agent": "Mozilla/5.0"
    })
    return json.loads(urllib.request.urlopen(req, timeout=15).read())

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=data, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    urllib.request.urlopen(req, timeout=10)

print("Fetching TikTok @67coin info...")
info = rapidapi_get("user/info", "uniqueId=67coin")
user = info.get("userInfo", {}).get("user", {})
stats = info.get("userInfo", {}).get("stats", {})
sec_uid = user.get("secUid", "")
print(f"  Followers: {stats.get('followerCount')}, Videos: {stats.get('videoCount')}, Likes: {stats.get('heartCount')}")

print("Fetching latest videos...")
posts = rapidapi_get("user/posts", f"secUid={sec_uid}&count=10")
items = posts.get("itemList", posts.get("data", {}).get("itemList", []))

videos = []
for v in items[:10]:
    s = v.get("stats", {})
    videos.append({
        "id": v.get("id"),
        "desc": (v.get("desc") or "")[:120],
        "url": f"https://www.tiktok.com/@67coin/video/{v.get('id')}",
        "thumbnail": v.get("video", {}).get("cover", ""),
        "views": s.get("playCount", 0),
        "likes": s.get("diggCount", 0),
        "comments": s.get("commentCount", 0),
        "shares": s.get("shareCount", 0),
        "created": v.get("createTime", 0),
    })

result = {
    "followers": stats.get("followerCount", 0),
    "following": stats.get("followingCount", 0),
    "video_count": stats.get("videoCount", 0),
    "total_likes": stats.get("heartCount", 0),
    "avatar": user.get("avatarMedium", ""),
    "nickname": user.get("nickname", "67coin"),
    "videos": videos,
    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
}

sb_upsert("tiktok_spotlight", result)
print(f"✅ Supabase: tiktok_spotlight ({len(videos)} videos, {stats.get('followerCount')} followers)")
