#!/usr/bin/env python3
"""Fetch 67 Community member count via Twitter241 RapidAPI."""
import json, urllib.request
from pathlib import Path
from datetime import datetime, timezone

RAPIDAPI_KEY = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
COMMUNITY_ID = "1987949705322508569"
DATA_JSON    = Path(__file__).parent.parent / "public/data.json"

def fetch_community():
    url = f"https://twitter241.p.rapidapi.com/community-details?communityId={COMMUNITY_ID}"
    req = urllib.request.Request(url, headers={
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
        "x-rapidapi-key":  RAPIDAPI_KEY,
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.load(r)
    return data.get("result", {}).get("result", {})

def main():
    print("Fetching 67 Community members via API...")
    try:
        community = fetch_community()
    except Exception as e:
        print(f"❌ API error: {e}")
        return

    count = community.get("member_count")
    name  = community.get("name", "")
    if count is None:
        print("❌ No member count returned")
        return

    count = int(count)
    print(f"✅ {name}: {count:,} members")

    with open(DATA_JSON) as f:
        data = json.load(f)

    sp  = data.get("social_pulse", {})
    old = sp.get("x_community_members", 0)

    sp["x_community_members"]   = count
    # Delta — snapshot'tan hesapla
    snap = data.get("_snapshot_24h", {})
    snap_community = snap.get("x_community_members", old)
    sp["x_community_delta_24h"] = count - snap_community
    sp["x_community_last_scrape"] = datetime.now(timezone.utc).timestamp()
    data["social_pulse"] = sp

    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print(f"✅ data.json updated: {old:,} → {count:,} (+{count - old})")

main()
