#!/usr/bin/env python3
"""
@67coinX best tweets + X Community top tweets via Twitter241 RapidAPI.
"""
import json, urllib.request, urllib.parse
from pathlib import Path
from datetime import datetime, timezone, timedelta

RAPIDAPI_KEY  = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
DATA_JSON     = Path(__file__).parent.parent / "public/data.json"
USER_ID_67CON = "1993727649202814976"   # @67coinX
SEARCH_QUERIES = ["67coin", "#67coin"]

now = datetime.now(timezone.utc)

def api_get(endpoint, params):
    url = f"https://twitter241.p.rapidapi.com/{endpoint}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
        "x-rapidapi-key":  RAPIDAPI_KEY,
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def parse_tweets(data, default_screen=""):
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
            core_sn = tw.get("core", {}).get("user_results", {}).get("result", {}).get("legacy", {}).get("screen_name", default_screen)
            core_name = tw.get("core", {}).get("user_results", {}).get("result", {}).get("legacy", {}).get("name", core_sn)
            core_avatar = tw.get("core", {}).get("user_results", {}).get("result", {}).get("legacy", {}).get("profile_image_url_https", "")
            tweets.append({
                "tweet_id":    tid,
                "tweet_url":   f"https://x.com/{core_sn}/status/{tid}",
                "screen_name": core_sn,
                "name":        core_name,
                "avatar":      core_avatar,
                "text":        text[:280],
                "likes":       int(leg.get("favorite_count", 0)),
                "replies":     int(leg.get("reply_count", 0)),
                "retweets":    int(leg.get("retweet_count", 0)),
                "date":        dt.strftime("%Y-%m-%d"),
                "dt":          dt,
            })
    return tweets

def clean(t):
    if not t: return None
    return {k: v for k, v in t.items() if k != "dt"}

def main():
    print("Fetching @67coinX official tweets...")
    official = []
    try:
        data = api_get("user-tweets", {"user": USER_ID_67CON, "count": 40})
        official = parse_tweets(data, "67coinX")
        print(f"  ✅ @67coinX user-tweets → {len(official)} tweets")
    except Exception as e:
        print(f"  ❌ user-tweets error: {e}")

    cutoff_48h = now - timedelta(hours=48)
    cutoff_7d  = now - timedelta(days=7)

    tweets_48h = [t for t in official if t["dt"] >= cutoff_48h]
    tweets_7d  = [t for t in official if t["dt"] >= cutoff_7d]

    best_48h = max(tweets_48h, key=lambda t: t["likes"], default=None)
    best_7d  = max(tweets_7d,  key=lambda t: t["likes"], default=None)

    print(f"  ⭐ Best 48h: {best_48h['likes'] if best_48h else 0} likes")
    print(f"  ⭐ Best 7d:  {best_7d['likes'] if best_7d else 0} likes")

    # Community tweets — search, exclude @67coinX
    print("\nFetching X Community tweets...")
    community_all = []
    seen_ids = {t["tweet_id"] for t in official}

    for q in SEARCH_QUERIES:
        try:
            data = api_get("search", {"query": q, "type": "Latest", "count": 20})
            tweets = parse_tweets(data)
            for t in tweets:
                if t["tweet_id"] not in seen_ids and t["screen_name"].lower() != "67coinx":
                    seen_ids.add(t["tweet_id"])
                    community_all.append(t)
            print(f"  ✅ search '{q}' → {len(tweets)} tweets")
        except Exception as e:
            print(f"  ❌ search '{q}' error: {e}")

    # Top 2 community tweets by likes (last 7 days)
    community_7d = [t for t in community_all if t["dt"] >= cutoff_7d]
    top_community = sorted(community_7d, key=lambda t: t["likes"], reverse=True)[:2]
    print(f"  ⭐ Top community (7d): {[t['likes'] for t in top_community]}")

    # Write to data.json
    with open(DATA_JSON) as f:
        data = json.load(f)

    sp = data.get("social_pulse", {})
    if best_48h:  sp["best_tweet_2d"]   = clean(best_48h)
    if best_7d:   sp["best_tweet_week"] = clean(best_7d)
    sp["community_tweets"] = [clean(t) for t in top_community]

    data["social_pulse"] = sp
    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print("\n✅ data.json updated")

main()
