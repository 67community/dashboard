#!/usr/bin/env python3
"""Rotate _snapshot_24h — runs once daily. Copies current values as the 24h baseline."""
import json, urllib.request
from pathlib import Path
from datetime import datetime, timezone

DATA_JSON = Path(__file__).parent.parent / "public/data.json"
SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "***REMOVED_SERVICE_KEY***"

def sb_get(key):
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store?key=eq.{key}&select=value",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
    with urllib.request.urlopen(req, timeout=10) as r:
        rows = json.load(r)
    return rows[0]["value"] if rows else None

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

def main():
    with open(DATA_JSON) as f:
        data = json.load(f)
    
    sp = data.get("social_pulse", {})
    
    # Get current holders from Supabase
    holders_data = sb_get("holders")
    holders = holders_data.get("count", 0) if holders_data else data.get("token_health", {}).get("holders", 0)
    
    snapshot = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "twitter_followers": sp.get("twitter_followers", 0),
        "x_community_members": sp.get("x_community_members", 0),
        "discord_members": data.get("community", {}).get("discord_members", 0),
        "telegram_members": data.get("community", {}).get("telegram_members", 0),
        "holders": holders,
    }
    
    data["_snapshot_24h"] = snapshot
    
    with open(DATA_JSON, "w") as f:
        json.dump(data, f, indent=2)
    
    # Also save to Supabase so Vercel can read it
    sb_upsert("snapshot_24h", snapshot)
    
    print(f"✅ _snapshot_24h rotated at {snapshot['timestamp']}")
    for k, v in snapshot.items():
        if k != "timestamp":
            print(f"   {k}: {v}")

main()
