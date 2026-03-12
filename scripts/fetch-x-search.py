#!/usr/bin/env python3
import os
"""X search via Twitter241 RapidAPI — $67 coin targeted, spam filtered."""
import json, urllib.request, urllib.parse, time
from pathlib import Path
from datetime import datetime, timezone

RAPIDAPI_KEY = os.environ["RAPIDAPI_KEY"]
DATA_JSON    = Path(__file__).parent.parent / "public/data.json"

QUERIES = [
    "#67coin",
    "#67to67billion",
    "$67 solana",
    "67coin solana",
    "maverick 67 coin",
    "#67meme",
    '"Six Seven" solana',
    '"Six Seven" coin',
]

RELEVANT_TERMS = [
    "67coin", "#67", "$67", "67 coin", "six seven",
    "maverick 67", "67kid", "67to67", "67meme", "67 solana",
    "six and seven",
]

# Spam / irrelevant keyword blacklist
SPAM_KEYWORDS = [
    "casino", "poker", "betting", "gambl", "slot", "jackpot", "desk when",
    "vault that", "upfront cash", "tables from", "your phone", "breakthrough",
    "super:https", "clicking here", "earn from", "passive income", "click below",
    "make money", "onlinepokies", "ultrafirtina", "smartsampiyon", "mkingbet",
    "crypto signal", "airdrop to 500", "join now", "dm me", "t.me/",
    "hitting the table", "biggest breakthrough", "zero upfront",
    "everything you are looking for", "why stay stuck",
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
    return any(t.lower() in low for t in RELEVANT_TERMS)

def is_spam(text: str) -> bool:
    low = text.lower()
    return any(kw in low for kw in SPAM_KEYWORDS)

def is_valid(t: dict) -> bool:
    text = t["text"]
    low  = text.lower()

    # Must be relevant
    if not is_relevant(text):
        return False
    # Must not be spam
    if is_spam(text):
        return False

    # Zero-engagement + URL = likely spam bot
    total_eng = t["likes"] + t["reposts"] + t["replies"]
    if total_eng == 0 and "http" in low and len(text) > 100:
        return False

    # If tweet mentions another coin as its main subject, skip
    # (spam bots add #67coin to unrelated posts)
    other_coins = ["$aura", "$aicoin", "$pippin", "$pepe", "$doge",
                   "$lockin", "$trump", "$bonk", "$wif", "$popcat",
                   "#solana at $", "exit #solana", "dex paid", "dexscreener",
                   "traded sideways", "same with $"]
    if any(c in low for c in other_coins):
        return False

    # Tweet should have 67-related content in first 120 chars OR have engagement
    first = low[:120]
    core_terms = ["67coin", "#67", "$67", "67 coin", "maverick 67", "67meme", "67to67"]
    in_first = any(t in first for t in core_terms)
    if not in_first and total_eng == 0:
        return False  # Hashtag stuffing with no engagement

    # For generic terms like "six seven", require crypto context
    generic_matches = ["six seven", "six and seven"]
    if any(g in low for g in generic_matches):
        crypto_ctx = ["solana", "coin", "crypto", "token", "sol", "wallet",
                      "pump", "buy", "sell", "market", "chart", "mc", "holder"]
        if not any(c in low for c in crypto_ctx):
            return False

    return True

def main():
    print("Fetching X search data via API...")

    recent_all   = []
    popular_all  = []
    seen_recent  = set()
    seen_popular = set()

    for query in QUERIES:
        print(f"  🔍 '{query}'")
        for mode, bucket, seen in [("Latest", recent_all, seen_recent),
                                    ("Top",    popular_all, seen_popular)]:
            tweets = parse_tweets(api_search(query, mode, 40))
            for t in tweets:
                if not is_valid(t):
                    continue
                k = t["link"] or t["text"][:50]
                if k not in seen:
                    seen.add(k)
                    bucket.append(t)
            time.sleep(0.3)

    recent_all.sort(key=lambda t: t["time"], reverse=True)
    popular_all = [t for t in popular_all if t["likes"] + t["reposts"] + t["replies"] > 0]
    popular_all.sort(key=lambda t: t["likes"] + t["reposts"] * 2, reverse=True)

    recent_final  = recent_all[:60]
    popular_final = popular_all[:20]

    print(f"\n📊 Recent: {len(recent_final)} | Popular: {len(popular_final)}")
    for t in recent_final[:5]:
        print(f"  @{t['handle']}: {t['text'][:70]}")

    with open(DATA_JSON) as f:
        data = json.load(f)
    data["x_recent"]  = recent_final
    data["x_popular"] = popular_final
    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)
    print("✅ data.json updated")

main()
