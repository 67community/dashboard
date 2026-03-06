#!/usr/bin/env python3
"""
X search via Twitter241 RapidAPI — targeted $67 coin queries.
Writes x_recent (latest) and x_popular (top 20) to public/data.json
"""
import json, urllib.request, urllib.parse, time
from pathlib import Path
from datetime import datetime, timezone

RAPIDAPI_KEY = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
DATA_JSON    = Path(__file__).parent.parent / "public/data.json"

# Specific queries — $67 coin focused
QUERIES = [
    "#67coin",
    "#67to67billion",
    "$67 solana",
    "67coin solana",
    "maverick 67 coin",
    "#67meme",
]

# Terms that MUST appear for a tweet to be relevant
RELEVANT_TERMS = [
    "67coin", "#67", "$67", "67 coin", "six seven", "six&seven",
    "maverick 67", "67kid", "67to67", "67meme", "67 solana",
    "9avytnuksLxpxfhfqs6vlxaxt5p6bhy",  # CA (lowercase)
]

def api_search(query: str, mode: str = "Latest", count: int = 40) -> dict:
    params = urllib.parse.urlencode({"query": query, "type": mode, "count": count})
    url = f"https://twitter241.p.rapidapi.com/search?{params}"
    req = urllib.request.Request(url, headers={
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
        "x-rapidapi-key":  RAPIDAPI_KEY,
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.load(r)
    except Exception as e:
        print(f"  ⚠️  API error: {e}")
        return {}

def parse_tweets(data: dict) -> list:
    tweets = []
    for inst in data.get("result", {}).get("timeline", {}).get("instructions", []):
        for entry in inst.get("entries", []):
            tw  = (entry.get("content", {})
                        .get("itemContent", {})
                        .get("tweet_results", {})
                        .get("result", {}))
            leg = tw.get("legacy", {})
            text = leg.get("full_text", "")
            if not text or text.startswith("RT "):
                continue

            ucore  = (tw.get("core", {})
                        .get("user_results", {})
                        .get("result", {})
                        .get("core", {}))
            user   = ucore.get("name", "")
            handle = ucore.get("screen_name", "")
            tid    = leg.get("id_str", "")

            date_str = leg.get("created_at", "")
            try:
                dt = datetime.strptime(date_str, "%a %b %d %H:%M:%S +0000 %Y").replace(tzinfo=timezone.utc)
                time_iso = dt.isoformat()
            except:
                time_iso = ""

            tweets.append({
                "text":      text[:280],
                "user":      user,
                "handle":    handle,
                "time":      time_iso,
                "link":      f"https://x.com/{handle}/status/{tid}" if handle and tid else "",
                "tweet_url": f"https://x.com/{handle}/status/{tid}" if handle and tid else "",
                "likes":     int(leg.get("favorite_count", 0)),
                "reposts":   int(leg.get("retweet_count", 0)),
                "replies":   int(leg.get("reply_count", 0)),
            })
    return tweets

def is_relevant(text: str) -> bool:
    low = text.lower()
    return any(term.lower() in low for term in RELEVANT_TERMS)

def main():
    print("Fetching X search data via API...")

    recent_all   = []
    popular_all  = []
    seen_recent  = set()
    seen_popular = set()

    for query in QUERIES:
        print(f"  🔍 '{query}'")
        # Recent
        tweets = parse_tweets(api_search(query, "Latest", 40))
        for t in tweets:
            if not is_relevant(t["text"]): continue
            k = t["link"] or t["text"][:50]
            if k not in seen_recent:
                seen_recent.add(k)
                recent_all.append(t)
        time.sleep(0.3)

        # Popular
        tweets = parse_tweets(api_search(query, "Top", 40))
        for t in tweets:
            if not is_relevant(t["text"]): continue
            k = t["link"] or t["text"][:50]
            if k not in seen_popular:
                seen_popular.add(k)
                popular_all.append(t)
        time.sleep(0.3)

    recent_all.sort(key=lambda t: t["time"], reverse=True)
    popular_all.sort(key=lambda t: t["likes"] + t["reposts"] * 2, reverse=True)

    recent_final  = recent_all[:60]
    popular_final = popular_all[:20]

    print(f"\n📊 Recent: {len(recent_final)} | Popular: {len(popular_final)}")
    for t in recent_final[:3]:
        print(f"  @{t['handle']}: {t['text'][:70]}")

    with open(DATA_JSON) as f:
        data = json.load(f)
    data["x_recent"]  = recent_final
    data["x_popular"] = popular_final
    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)
    print("✅ data.json updated")

main()
