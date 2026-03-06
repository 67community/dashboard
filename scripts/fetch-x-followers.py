#!/usr/bin/env python3
"""Fetch @67coinX follower count via Twitter241 RapidAPI — no Playwright, no proxy."""
import json, urllib.request
from pathlib import Path
from datetime import datetime, timezone

RAPIDAPI_KEY = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
TARGET       = "67coinX"
DATA_JSON    = Path(__file__).parent.parent / "public/data.json"

def fetch_followers() -> int | None:
    url = f"https://twitter241.p.rapidapi.com/user?username={TARGET}"
    req = urllib.request.Request(url, headers={
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
        "x-rapidapi-key":  RAPIDAPI_KEY,
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.load(r)

    legacy = (data.get("result", {})
                  .get("data", {})
                  .get("user", {})
                  .get("result", {})
                  .get("legacy", {}))
    count = legacy.get("followers_count")
    return int(count) if count is not None else None

def main():
    print(f"Fetching @{TARGET} followers via API...")
    try:
        result = fetch_followers()
    except Exception as e:
        print(f"❌ API error: {e}")
        return

    if not result:
        print("❌ No follower count returned")
        return

    print(f"✅ Followers: {result:,}")

    with open(DATA_JSON) as f:
        data = json.load(f)

    sp   = data.get("social_pulse", {})
    old  = sp.get("twitter_followers", 0)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    history = sp.get("follower_history", [])
    if not history or history[-1].get("date") != today:
        history.append({"date": today, "count": result})
    else:
        history[-1]["count"] = result
    sp["follower_history"] = history[-30:]

    # Delta — snapshot'tan hesapla (daha doğru 24h fark)
    snap = data.get("_snapshot_24h", {})
    snap_followers = snap.get("twitter_followers", old)
    sp["follower_change_24h"] = result - snap_followers
    if len(history) >= 3:
        sp["follower_change_3d"] = result - history[-3]["count"]
    if len(history) >= 7:
        sp["follower_change_7d"] = result - history[-7]["count"]
    sp["twitter_followers"] = result
    data["social_pulse"] = sp

    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print(f"✅ data.json updated: {old:,} → {result:,}")

main()
