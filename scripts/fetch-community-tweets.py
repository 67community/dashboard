#!/usr/bin/env python3
"""67 Community tweets (48h + 7d) → Supabase. Runs every 24 hours."""
import os, json, urllib.request, urllib.parse
from pathlib import Path
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
load_dotenv(Path("/Users/oscarbrendon/67agent-mission-control/.env"))

RAPIDAPI_KEY = os.environ["RAPIDAPI_KEY"]
SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]
SEARCH_QUERIES = ["67coin", "#67coin", "#67"]

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

def parse_tweets(data):
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
            sn = core.get("screen_name", "")
            if sn.lower() == "67coinx": continue  # exclude official account
            tweets.append({
                "tweet_id": tid,
                "tweet_url": f"https://x.com/{sn}/status/{tid}",
                "screen_name": sn,
                "name": core.get("name", sn),
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
    print("🌐 67 Community tweets (24h refresh)...")

    all_tweets = []
    seen = set()
    for q in SEARCH_QUERIES:
        try:
            data = api_get("search", {"query": q, "type": "Latest", "count": 20})
            tweets = parse_tweets(data)
            for t in tweets:
                if t["tweet_id"] not in seen:
                    seen.add(t["tweet_id"])
                    all_tweets.append(t)
            print(f"  ✅ '{q}' → {len(tweets)} tweets")
        except Exception as e:
            print(f"  ❌ '{q}': {e}")

    cutoff_48h = (now - timedelta(hours=48)).timestamp()
    cutoff_7d = (now - timedelta(days=7)).timestamp()

    t48h = sorted([t for t in all_tweets if t["ts"] >= cutoff_48h], key=lambda t: t["likes"], reverse=True)
    t7d = sorted([t for t in all_tweets if t["ts"] >= cutoff_7d], key=lambda t: t["likes"], reverse=True)

    def clean(t):
        return {k: v for k, v in t.items() if k != "ts"}

    result = {
        "best_community_48h": clean(t48h[0]) if t48h else None,
        "best_community_week": clean(t7d[0]) if t7d else None,
        "community_tweets": [clean(t) for t in t7d[:15]],
        "updated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

    sb_upsert("community_tweets", result)
    print(f"  ⭐ 48h best: {t48h[0]['likes'] if t48h else 0} likes")
    print(f"  ⭐ 7d best: {t7d[0]['likes'] if t7d else 0} likes")
    print(f"  📊 {len(t7d[:15])} community tweets saved")
    print("✅ Supabase: community_tweets")

if __name__ == "__main__":
    main()
