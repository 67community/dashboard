#!/usr/bin/env python3
"""
X search via Twitter241 RapidAPI — no Playwright, no proxy.
Fetches x_recent (latest) and x_popular (top 20) for 67-related queries.
"""
import json, urllib.request, urllib.parse, time
from pathlib import Path
from datetime import datetime, timezone

RAPIDAPI_KEY = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
DATA_JSON    = Path(__file__).parent.parent / "public/data.json"

QUERIES = ["67coin", "67 coin", "Six Seven crypto", "6-7 coin", "maverick 67"]

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

            # Author — name/screen_name are in core, not legacy
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

def main():
    print("Fetching X search data via API...")

    recent_all   = []
    popular_all  = []
    seen_recent  = set()
    seen_popular = set()

    for query in QUERIES:
        print(f"  🔍 Recent: '{query}'")
        tweets = parse_tweets(api_search(query, "Latest", 40))
        for t in tweets:
            k = t["link"] or t["text"][:50]
            if k not in seen_recent:
                seen_recent.add(k)
                recent_all.append(t)
        time.sleep(0.3)

        print(f"  🔍 Popular: '{query}'")
        tweets = parse_tweets(api_search(query, "Top", 40))
        for t in tweets:
            k = t["link"] or t["text"][:50]
            if k not in seen_popular:
                seen_popular.add(k)
                popular_all.append(t)
        time.sleep(0.3)

    # Sort
    recent_all.sort(key=lambda t: t["time"], reverse=True)
    popular_all.sort(key=lambda t: t["likes"] + t["reposts"] * 2, reverse=True)

    recent_final  = recent_all[:60]
    popular_final = popular_all[:20]

    print(f"\n📊 Recent: {len(recent_final)} | Popular: {len(popular_final)}")
    if recent_final:
        print(f"  Latest: @{recent_final[0]['handle']} — {recent_final[0]['text'][:60]}")
    if popular_final:
        print(f"  Top: @{popular_final[0]['handle']} — {popular_final[0]['likes']} likes — {popular_final[0]['text'][:60]}")

    with open(DATA_JSON) as f:
        data = json.load(f)
    data["x_recent"]  = recent_final
    data["x_popular"] = popular_final
    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print("✅ data.json updated")

main()
