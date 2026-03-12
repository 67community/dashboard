#!/usr/bin/env python3
import os
"""Fetch map-admin pins from Discord → Supabase. Every 5 hours."""
import json, os, urllib.request
from datetime import datetime, timezone
from pathlib import Path

MAP_ADMIN_CHANNEL = "1465826546882449471"

SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]

DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN", "")
if not DISCORD_TOKEN:
    env_file = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("DISCORD_TOKEN="):
                DISCORD_TOKEN = line.split("=", 1)[1].strip('"').strip("'")

def discord_get(endpoint):
    req = urllib.request.Request(
        f"https://discord.com/api/v10/{endpoint}",
        headers={"Authorization": DISCORD_TOKEN, "User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?on_conflict=key", data=data, method="POST",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                 "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    urllib.request.urlopen(req, timeout=10)

def main():
    if not DISCORD_TOKEN:
        print("❌ No DISCORD_TOKEN"); return

    print("Fetching map-admin pins...")
    try:
        msgs = discord_get(f"channels/{MAP_ADMIN_CHANNEL}/messages?limit=50")
    except Exception as e:
        print(f"❌ Discord: {e}"); return

    items = []
    for m in (msgs if isinstance(msgs, list) else []):
        if not (m.get("author", {}).get("username") == "m7-bot" or m.get("author", {}).get("bot")):
            continue
        for e in m.get("embeds", []):
            fields = {f["name"]: f["value"] for f in e.get("fields", [])}
            items.append({
                "id": m["id"],
                "title": fields.get("Title", e.get("title", "Untitled")),
                "location": fields.get("Location", ""),
                "description": e.get("description", ""),
                "credit": fields.get("Credit", ""),
                "time": m.get("timestamp", ""),
                "image": (e.get("image") or {}).get("url"),
                "media_count": int(''.join(c for c in fields.get("Media", "0") if c.isdigit()) or "0"),
            })

    sb_upsert("map_admin", {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()})
    print(f"✅ Supabase: map_admin ({len(items)} pins)")

if __name__ == "__main__":
    main()
