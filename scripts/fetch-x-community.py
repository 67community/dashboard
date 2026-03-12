#!/usr/bin/env python3
"""Fetch 67 Community member count via Twitter241 RapidAPI → Supabase."""
import json, urllib.request
from datetime import datetime, timezone

RAPIDAPI_KEY = os.environ["RAPIDAPI_KEY"]
COMMUNITY_ID = "1987949705322508569"

SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?on_conflict=key", data=data, method="POST",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                 "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    urllib.request.urlopen(req, timeout=10)

def sb_get(key):
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?key=eq.{key}&select=value",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
    with urllib.request.urlopen(req, timeout=10) as r:
        rows = json.load(r)
    if rows:
        v = rows[0]["value"]
        return json.loads(v) if isinstance(v, str) else v
    return None

def main():
    print("Fetching 67 Community members via API...")
    try:
        url = f"https://twitter241.p.rapidapi.com/community-details?communityId={COMMUNITY_ID}"
        req = urllib.request.Request(url, headers={
            "x-rapidapi-host": "twitter241.p.rapidapi.com", "x-rapidapi-key": RAPIDAPI_KEY})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.load(r)
        community = data.get("result", {}).get("result", {})
    except Exception as e:
        print(f"❌ API error: {e}"); return

    count = community.get("member_count")
    if count is None:
        print("❌ No member count"); return
    count = int(count)
    name = community.get("name", "")
    print(f"✅ {name}: {count:,} members")

    # Get snapshot for delta
    snapshot = sb_get("snapshot_24h") or {}
    snap_val = snapshot.get("x_community_members", count)
    delta = count - snap_val

    result = {
        "x_community_members": count,
        "x_community_delta_24h": delta,
        "x_community_last_scrape": datetime.now(timezone.utc).timestamp(),
    }
    sb_upsert("x_community", result)
    print(f"✅ Supabase: x_community (delta: {delta:+d})")

def fetch_community_tweets():
    """Fetch recent tweets from the 67 community via RapidAPI."""
import os
    print("Fetching community tweets...")
    try:
        url = f"https://twitter241.p.rapidapi.com/community-tweets?communityId={COMMUNITY_ID}&count=20"
        req = urllib.request.Request(url, headers={
            "x-rapidapi-host": "twitter241.p.rapidapi.com", "x-rapidapi-key": RAPIDAPI_KEY})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.load(r)
    except Exception as e:
        print(f"❌ Community tweets error: {e}"); return []

    tweets = []
    instructions = data.get("result", {}).get("timeline", {}).get("instructions", [])
    
    for inst in instructions:
        # Single pinned entry
        entry = inst.get("entry")
        if entry:
            _parse_tweet_entry(entry, tweets)
        # Multiple entries
        for e in inst.get("entries", []):
            _parse_tweet_entry(e, tweets)

    print(f"  Found {len(tweets)} community tweets")
    return tweets[:15]


def _parse_tweet_entry(entry, tweets):
    try:
        result = entry.get("content", {}).get("itemContent", {}).get("tweet_results", {}).get("result", {})
        if not result: return
        legacy = result.get("legacy", {})
        user = result.get("core", {}).get("user_results", {}).get("result", {}).get("legacy", {})
        if not legacy.get("full_text") or not user: return
        
        tweet_id = legacy.get("id_str", "")
        screen_name = user.get("screen_name", "")
        
        tweets.append({
            "tweet_url": f"https://x.com/{screen_name}/status/{tweet_id}",
            "screen_name": screen_name,
            "name": user.get("name", screen_name),
            "avatar": (user.get("profile_image_url_https", "") or "").replace("_normal", "_bigger"),
            "text": legacy.get("full_text", ""),
            "date": legacy.get("created_at", ""),
            "likes": legacy.get("favorite_count", 0),
            "replies": legacy.get("reply_count", 0),
            "retweets": legacy.get("retweet_count", 0),
        })
    except Exception:
        pass


if __name__ == "__main__":
    main()
    tweets = fetch_community_tweets()
    if tweets:
        existing = sb_get("x_community") or {}
        existing["community_tweets"] = tweets
        sb_upsert("x_community", existing)
        print(f"✅ Supabase: community_tweets ({len(tweets)})")
