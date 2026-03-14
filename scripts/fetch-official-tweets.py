#!/usr/bin/env python3
"""@67coinX best tweets (48h + 7d) → Supabase. Runs every 3 hours."""
import os, json, urllib.request, urllib.parse
from pathlib import Path
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
load_dotenv(Path("/Users/oscarbrendon/67agent-mission-control/.env"))

RAPIDAPI_KEY = os.environ["RAPIDAPI_KEY"]
SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]
USER_ID = "1993727649202814976"  # @67coinX

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=data, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    urllib.request.urlopen(req, timeout=10)

def api_get(endpoint, params):
    url = f"https://twitter241.p.rapidapi.com/{endpoint}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def parse_tweets(data, default_screen=""):
    tweets = []
    for inst in data.get("result", {}).get("timeline", {}).get("instructions", []):
        for entry in inst.get("entries", []):
            tw = entry.get("content", {}).get("itemContent", {}).get("tweet_results", {}).get("result", {})
            leg = tw.get("legacy", {})
            text = leg.get("full_text", "")
            if not text or text.startswith("RT "): continue
            try:
                dt = datetime.strptime(leg.get("created_at", ""), "%a %b %d %H:%M:%S +0000 %Y").replace(tzinfo=timezone.utc)
            except: continue
            tid = leg.get("id_str", "")
            core = tw.get("core", {}).get("user_results", {}).get("result", {}).get("legacy", {})
            tweets.append({
                "tweet_id": tid,
                "tweet_url": f"https://x.com/{core.get('screen_name', default_screen)}/status/{tid}",
                "screen_name": core.get("screen_name", default_screen),
                "name": core.get("name", default_screen),
                "avatar": core.get("profile_image_url_https", ""),
                "text": text[:280],
                "likes": int(leg.get("favorite_count", 0)),
                "replies": int(leg.get("reply_count", 0)),
                "retweets": int(leg.get("retweet_count", 0)),
                "date": dt.strftime("%Y-%m-%d"),
                "ts": dt.timestamp(),
            })
    return tweets

def main():
    now = datetime.now(timezone.utc)
    print("📌 @67coinX best tweets (3h refresh)...")
    
    try:
        data = api_get("user-tweets", {"user": USER_ID, "count": 40})
        tweets = parse_tweets(data, "67coinX")
        print(f"  ✅ {len(tweets)} tweets fetched")
    except Exception as e:
        print(f"  ❌ Error: {e}"); return

    t48h = [t for t in tweets if t["ts"] >= (now - timedelta(hours=48)).timestamp()]
    t7d = [t for t in tweets if t["ts"] >= (now - timedelta(days=7)).timestamp()]

    best_48h = max(t48h, key=lambda t: t["likes"], default=None)
    best_7d = max(t7d, key=lambda t: t["likes"], default=None)

    # Remove ts before saving
    def clean(t):
        if not t: return None
        return {k: v for k, v in t.items() if k != "ts"}

    result = {
        "best_tweet_2d": clean(best_48h),
        "best_tweet_week": clean(best_7d),
        "updated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    
    sb_upsert("official_tweets", result)
    print(f"  ⭐ 48h: {best_48h['likes'] if best_48h else 0} likes")
    print(f"  ⭐ 7d: {best_7d['likes'] if best_7d else 0} likes")
    print("✅ Supabase: official_tweets")

if __name__ == "__main__":
    main()
