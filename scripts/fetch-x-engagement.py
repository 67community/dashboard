#!/usr/bin/env python3
import os
from pathlib import Path; from dotenv import load_dotenv; load_dotenv(Path(__file__).resolve().parent.parent / '.env')
"""Compute @67coinX engagement stats → Supabase."""
import json, urllib.request, urllib.parse
from datetime import datetime, timezone, timedelta

RAPIDAPI_KEY  = os.environ["RAPIDAPI_KEY"]
USER_ID_67CON = "1993727649202814976"

SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]

now = datetime.now(timezone.utc)

CONTENT_KEYWORDS = {
    "meme": ["meme","😂","lol","💀","🤣","funny","lmao"],
    "thesis": ["thesis","because","why","mindvirus","eternal","movement","💭","think"],
    "announcement": ["listing","exchange","cex","bybit","mexc","gate","listed","announcement","new","launch"],
    "sighting": ["sighting","spotted","found","saw","see","look","#67sighting"],
    "community": ["discord","telegram","join","welcome","community","members"],
}

def classify(text):
    t = text.lower()
    for label, kws in CONTENT_KEYWORDS.items():
        if any(k in t for k in kws): return label
    return "other"

def api_get(endpoint, params):
    url = f"https://twitter241.p.rapidapi.com/{endpoint}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "x-rapidapi-host": "twitter241.p.rapidapi.com", "x-rapidapi-key": RAPIDAPI_KEY})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def parse_tweets(data):
    tweets = []
    for inst in data.get("result",{}).get("timeline",{}).get("instructions",[]):
        for entry in inst.get("entries",[]):
            tw = entry.get("content",{}).get("itemContent",{}).get("tweet_results",{}).get("result",{})
            leg = tw.get("legacy",{})
            text = leg.get("full_text","")
            if not text or text.startswith("RT "): continue
            try:
                dt = datetime.strptime(leg.get("created_at",""), "%a %b %d %H:%M:%S +0000 %Y").replace(tzinfo=timezone.utc)
            except: continue
            likes = int(leg.get("favorite_count",0))
            replies = int(leg.get("reply_count",0))
            retweets = int(leg.get("retweet_count",0))
            views = int(tw.get("views",{}).get("count",0) or 0)
            tweets.append({"text": text, "dt": dt, "date": dt.strftime("%Y-%m-%d"),
                "likes": likes, "replies": replies, "retweets": retweets, "views": views,
                "engagement": likes + replies + retweets})
    return tweets

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?on_conflict=key", data=data, method="POST",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                 "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    urllib.request.urlopen(req, timeout=10)

def main():
    print("Computing @67coinX engagement stats...")
    try:
        data = api_get("user-tweets", {"user": USER_ID_67CON, "count": 40})
        tweets = parse_tweets(data)
        print(f"  ✅ {len(tweets)} tweets fetched")
    except Exception as e:
        print(f"  ❌ API error: {e}"); return

    cutoff_7d = now - timedelta(days=7)
    tweets_7d = [t for t in tweets if t["dt"] >= cutoff_7d]

    total_eng_7d = sum(t["engagement"] for t in tweets_7d)
    total_views = sum(t["views"] for t in tweets_7d)
    all_views = sum(t["views"] for t in tweets)
    all_likes = sum(t["likes"] for t in tweets)
    avg_eng = round(total_eng_7d / len(tweets_7d), 1) if tweets_7d else 0
    eng_rate = round((total_eng_7d / total_views * 100), 3) if total_views > 0 else round(avg_eng / 10, 3)

    posted_days = sorted({t["date"] for t in tweets}, reverse=True)
    streak = 0
    check = now.strftime("%Y-%m-%d")
    for day in posted_days:
        if day == check:
            streak += 1
            check = (datetime.strptime(check, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
        else: break

    ct_stats = {}
    for t in tweets_7d:
        label = classify(t["text"])
        if label not in ct_stats: ct_stats[label] = {"count": 0, "total_eng": 0, "avg_eng": 0}
        ct_stats[label]["count"] += 1
        ct_stats[label]["total_eng"] += t["engagement"]
    for s in ct_stats.values():
        s["avg_eng"] = round(s["total_eng"] / s["count"], 1) if s["count"] else 0

    result = {
        "engagement_rate": eng_rate, "avg_engagement": avg_eng,
        "total_engagement_7d": total_eng_7d, "posting_streak_days": streak,
        "content_type_stats": ct_stats, "total_views_recent": all_views,
        "total_likes_recent": all_likes, "updated_at": now.isoformat(),
    }

    sb_upsert("x_engagement", result)
    print(f"  ✅ Supabase: x_engagement (rate: {eng_rate}%, streak: {streak}d)")

if __name__ == "__main__":
    main()
