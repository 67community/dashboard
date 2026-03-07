#!/usr/bin/env python3
"""
@67coinX best tweets via Twitter241 RapidAPI.
ONLY @67coinX official tweets — best in 48h and 7 days by likes.
"""
import json, urllib.request, urllib.parse
from pathlib import Path
from datetime import datetime, timezone, timedelta

RAPIDAPI_KEY  = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
DATA_JSON     = Path(__file__).parent.parent / "public/data.json"
USER_ID_67CON = "1993727649202814976"   # @67coinX

now = datetime.now(timezone.utc)

def api_get(endpoint, params):
    url = f"https://twitter241.p.rapidapi.com/{endpoint}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
        "x-rapidapi-key":  RAPIDAPI_KEY,
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def parse_tweets(data):
    tweets = []
    for inst in data.get("result", {}).get("timeline", {}).get("instructions", []):
        for entry in inst.get("entries", []):
            tw = (entry.get("content", {})
                       .get("itemContent", {})
                       .get("tweet_results", {})
                       .get("result", {}))
            leg = tw.get("legacy", {})
            text = leg.get("full_text", "")
            if not text or text.startswith("RT "):
                continue
            date_str = leg.get("created_at", "")
            try:
                dt = datetime.strptime(date_str, "%a %b %d %H:%M:%S +0000 %Y").replace(tzinfo=timezone.utc)
            except:
                continue
            tid = leg.get("id_str", "")
            tweets.append({
                "tweet_id":  tid,
                "tweet_url": f"https://x.com/67coinX/status/{tid}",
                "text":      text[:280],
                "likes":     int(leg.get("favorite_count", 0)),
                "replies":   int(leg.get("reply_count", 0)),
                "retweets":  int(leg.get("retweet_count", 0)),
                "date":      dt.strftime("%Y-%m-%d"),
                "dt":        dt,
            })
    return tweets

def main():
    print("Fetching @67coinX official tweets...")

    try:
        data = api_get("user-tweets", {"user": USER_ID_67CON, "count": 40})
        tweets = parse_tweets(data)
        print(f"  ✅ @67coinX user-tweets → {len(tweets)} tweets")
    except Exception as e:
        print(f"  ❌ user-tweets error: {e}")
        return

    cutoff_48h = now - timedelta(hours=48)
    cutoff_7d  = now - timedelta(days=7)

    tweets_48h = [t for t in tweets if t["dt"] >= cutoff_48h]
    tweets_7d  = [t for t in tweets if t["dt"] >= cutoff_7d]

    best_48h = max(tweets_48h, key=lambda t: t["likes"], default=None)
    best_7d  = max(tweets_7d,  key=lambda t: t["likes"], default=None)

    print(f"\n📊 48h: {len(tweets_48h)} tweets | 7d: {len(tweets_7d)} tweets")
    if best_48h:
        print(f"⭐ Best 48h: {best_48h['likes']} likes — {best_48h['text'][:70]}")
    if best_7d:
        print(f"⭐ Best 7d:  {best_7d['likes']} likes — {best_7d['text'][:70]}")

    with open(DATA_JSON) as f:
        data = json.load(f)

    sp = data.get("social_pulse", {})

    def clean(t):
        if not t: return None
        return {k: v for k, v in t.items() if k != "dt"}

    if best_48h:
        sp["best_tweet_2d"] = clean(best_48h)
    if best_7d:
        sp["best_tweet_week"] = clean(best_7d)

    data["social_pulse"] = sp
    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print("\n✅ data.json updated")

main()
