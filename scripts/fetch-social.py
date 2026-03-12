#!/usr/bin/env python3
"""Social counts — Discord + Telegram → Supabase. Every 5 min."""
import json, os, urllib.request
from datetime import datetime, timezone

SB_URL       = os.environ["SUPABASE_URL"]
SB_KEY       = os.environ["SUPABASE_SERVICE_KEY"]
GUILD_ID     = "1440077830456082545"
TG_TOKEN     = os.environ["TG_ANNOUNCE_BOT_TOKEN"]
TG_CHAT      = "-1003158749697"

DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN", "")
if not DISCORD_TOKEN:
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
    if os.path.exists(env_path):
        for line in open(env_path):
            if line.startswith("DISCORD_TOKEN="):
                DISCORD_TOKEN = line.strip().split("=",1)[1].strip('"').strip("'")

def fetch(url, headers={}):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0",**headers})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

def main():
    result = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if DISCORD_TOKEN:
        try:
            g = fetch(f"https://discord.com/api/v10/guilds/{GUILD_ID}?with_counts=true",
                      {"Authorization": DISCORD_TOKEN})
            result["discord_members"] = g.get("approximate_member_count", 0)
            result["discord_online"]  = g.get("approximate_presence_count", 0)
            print(f"  Discord: {result['discord_members']} members, {result['discord_online']} online")
        except Exception as e:
            print(f"  ❌ Discord: {e}")
    try:
        tg = fetch(f"https://api.telegram.org/bot{TG_TOKEN}/getChatMemberCount?chat_id={TG_CHAT}")
        result["telegram_members"] = tg.get("result", 0)
        print(f"  Telegram: {result['telegram_members']} members")
    except Exception as e:
        print(f"  ❌ Telegram: {e}")

    sb_upsert("social_counts", result)
    print("✅ social_counts synced to Supabase")

main()
