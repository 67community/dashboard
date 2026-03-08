#!/usr/bin/env python3
"""Fetch 67 Community member count via Twitter241 RapidAPI → Supabase."""
import json, urllib.request
from datetime import datetime, timezone

RAPIDAPI_KEY = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
COMMUNITY_ID = "1987949705322508569"

SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXd3Y2NlcmN4aXd0eWVkd3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMjgyOSwiZXhwIjoyMDg3Nzk4ODI5fQ.Gox3T828yW7HEP51ijpN8SkImMIzFXFw8o5_FEXt3FU"

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?on_conflict=key", data=data, method="POST",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                 "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    urllib.request.urlopen(req, timeout=10)

def sb_get(key):
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?key=eq.{key}&select=value",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
    with urllib.request.urlopen(req, timeout=10) as r:
        rows = json.load(r)
    if rows:
        v = rows[0]["value"]
        return json.loads(v) if isinstance(v, str) else v
    return None

def main():
    print("Fetching 67 Community members via API...")
    try:
        url = f"https://twitter241.p.rapidapi.com/community-details?communityId={COMMUNITY_ID}"
        req = urllib.request.Request(url, headers={
            "x-rapidapi-host": "twitter241.p.rapidapi.com", "x-rapidapi-key": RAPIDAPI_KEY})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.load(r)
        community = data.get("result", {}).get("result", {})
    except Exception as e:
        print(f"❌ API error: {e}"); return

    count = community.get("member_count")
    if count is None:
        print("❌ No member count"); return
    count = int(count)
    name = community.get("name", "")
    print(f"✅ {name}: {count:,} members")

    # Get snapshot for delta
    snapshot = sb_get("snapshot_24h") or {}
    snap_val = snapshot.get("x_community_members", count)
    delta = count - snap_val

    result = {
        "x_community_members": count,
        "x_community_delta_24h": delta,
        "x_community_last_scrape": datetime.now(timezone.utc).timestamp(),
    }
    sb_upsert("x_community", result)
    print(f"✅ Supabase: x_community (delta: {delta:+d})")

if __name__ == "__main__":
    main()
