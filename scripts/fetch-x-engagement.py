#!/usr/bin/env python3
"""
Compute @67coinX engagement stats from user-tweets API.
Updates: engagement_rate, avg_engagement, total_engagement_7d,
         posting_streak_days, content_type_stats
"""
import json, urllib.request, urllib.parse, re
from pathlib import Path
from datetime import datetime, timezone, timedelta

RAPIDAPI_KEY  = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
USER_ID_67CON = "1993727649202814976"
DATA_JSON     = Path(__file__).parent.parent / "public/data.json"

now = datetime.now(timezone.utc)

CONTENT_KEYWORDS = {
    "meme":         ["meme", "😂", "lol", "💀", "🤣", "funny", "lmao"],
    "thesis":       ["thesis", "because", "why", "mindvirus", "eternal", "movement", "💭", "think"],
    "announcement": ["listing", "exchange", "cex", "bybit", "mexc", "gate", "listed", "announcement", "new", "launch"],
    "sighting":     ["sighting", "spotted", "found", "saw", "see", "look", "#67sighting"],
    "community":    ["discord", "telegram", "join", "welcome", "community", "members"],
}

def classify(text: str) -> str:
    t = text.lower()
    for label, kws in CONTENT_KEYWORDS.items():
        if any(k in t for k in kws):
            return label
    return "other"

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
            if not text or text.startswith("RT "): continue
            date_str = leg.get("created_at", "")
            try:
                dt = datetime.strptime(date_str, "%a %b %d %H:%M:%S +0000 %Y").replace(tzinfo=timezone.utc)
            except: continue
            likes    = int(leg.get("favorite_count", 0))
            replies  = int(leg.get("reply_count", 0))
            retweets = int(leg.get("retweet_count", 0))
            views    = int(tw.get("views", {}).get("count", 0) or 0)
            tweets.append({
                "text": text, "dt": dt, "date": dt.strftime("%Y-%m-%d"),
                "likes": likes, "replies": replies, "retweets": retweets, "views": views,
                "engagement": likes + replies + retweets,
            })
    return tweets

def main():
    print("Computing @67coinX engagement stats...")

    try:
        data = api_get("user-tweets", {"user": USER_ID_67CON, "count": 40})
        tweets = parse_tweets(data)
        print(f"  ✅ {len(tweets)} tweets fetched")
    except Exception as e:
        print(f"  ❌ API error: {e}")
        return

    cutoff_7d = now - timedelta(days=7)
    tweets_7d = [t for t in tweets if t["dt"] >= cutoff_7d]

    # Engagement rate = total_engagement / total_views (×100) or per-tweet avg
    total_eng_7d  = sum(t["engagement"] for t in tweets_7d)
    total_views   = sum(t["views"] for t in tweets_7d)
    all_views     = sum(t["views"] for t in tweets)
    all_likes     = sum(t["likes"] for t in tweets)
    avg_eng      = round(total_eng_7d / len(tweets_7d), 1) if tweets_7d else 0
    eng_rate     = round((total_eng_7d / total_views * 100), 3) if total_views > 0 else round(avg_eng / 10, 3)

    # Posting streak — consecutive days posted
    posted_days = sorted({t["date"] for t in tweets}, reverse=True)
    streak = 0
    check  = now.strftime("%Y-%m-%d")
    for day in posted_days:
        if day == check:
            streak += 1
            # next day to check
            check = (datetime.strptime(check, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            break

    # Content type stats
    ct_stats: dict = {}
    for t in tweets_7d:
        label = classify(t["text"])
        if label not in ct_stats:
            ct_stats[label] = {"count": 0, "total_eng": 0, "avg_eng": 0}
        ct_stats[label]["count"]     += 1
        ct_stats[label]["total_eng"] += t["engagement"]
    for label, s in ct_stats.items():
        s["avg_eng"] = round(s["total_eng"] / s["count"], 1) if s["count"] else 0

    print(f"  ✅ Engagement rate: {eng_rate}%")
    print(f"  ✅ Avg / tweet: {avg_eng}")
    print(f"  ✅ Total 7d: {total_eng_7d}")
    print(f"  ✅ Posting streak: {streak} days")
    print(f"  ✅ Content types: {list(ct_stats.keys())}")
    print(f"  ✅ Total views (recent): {all_views:,}")
    print(f"  ✅ Total likes (recent): {all_likes:,}")

    with open(DATA_JSON) as f:
        d = json.load(f)
    sp = d.get("social_pulse", {})
    sp["engagement_rate"]      = eng_rate
    sp["avg_engagement"]       = avg_eng
    sp["total_engagement_7d"]  = total_eng_7d
    sp["posting_streak_days"]  = streak
    sp["content_type_stats"]   = ct_stats
    sp["total_views_recent"]   = all_views
    sp["total_likes_recent"]   = all_likes
    d["social_pulse"] = sp
    with open(DATA_JSON, "w") as f:
        json.dump(d, f, indent=2)
    print("  ✅ data.json updated")

main()
