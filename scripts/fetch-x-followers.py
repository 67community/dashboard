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
    now_ts = datetime.now(timezone.utc).timestamp()

    # 7-day snapshot rotation
    snap7d = data.get("_snapshot_7d", {})
    last_snap = snap3d.get("timestamp", 0)
    if now_ts - last_snap >= 7 * 86400:  # 7 gün geçtiyse yeni snapshot
        data["_snapshot_7d"] = {
            "twitter_followers":   result,
            "x_community_members": sp.get("x_community_members", 0),
            "total_views_recent":  sp.get("total_views_recent", 0),
            "total_likes_recent":  sp.get("total_likes_recent", 0),
            "engagement_rate":     sp.get("engagement_rate", 0),
            "timestamp":           now_ts,
            "date":                today,
        }
        print(f"  📸 7-day snapshot saved")

    history = sp.get("follower_history", [])
    if not history or history[-1].get("date") != today:
        history.append({"date": today, "count": result})
    else:
        history[-1]["count"] = result
    sp["follower_history"] = history[-30:]

    # 3d deltas
    snap7d_data = data.get("_snapshot_7d", {})
    sp["follower_change_3d_snap"] = result - snap7d_data.get("twitter_followers", result)

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
