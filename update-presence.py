#!/usr/bin/env python3
"""
update-presence.py — Real-time Discord presence via Gateway WebSocket
Cron: */5 * * * * /usr/bin/python3 /Users/oscarbrendon/.openclaw/workspace/mission-control/update-presence.py
"""

import asyncio, json, ssl, certifi, os
from datetime import datetime
import websockets

GUILD_ID = "1440077830456082545"
TEAM_IDS = {
    "1444130836415905993": "brandon",
    "1440075589557158100": "jamie",
    "682831521396031498":  "nick",
    "788495124061487154":  "wjp",
    "965681608604647514":  "gen",
    "767811814557089802":  "oscar",
    "201710326347988993":  "crispy",
}

TOKEN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".presence_token")
DATA_FILES = [
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json"),
    "/Users/oscarbrendon/Projects/67-mission-control/public/data.json",
]

ssl_ctx = ssl.create_default_context(cafile=certifi.where())

async def fetch_presence():
    token = open(TOKEN_FILE).read().strip()
    presence = {}

    async with websockets.connect("wss://gateway.discord.gg/?v=10&encoding=json", ssl=ssl_ctx) as ws:
        await ws.recv()  # HELLO

        # IDENTIFY as user
        await ws.send(json.dumps({
            "op": 2,
            "d": {
                "token": token,
                "capabilities": 16381,
                "properties": {
                    "os": "Windows", "browser": "Chrome", "device": "",
                    "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "browser_version": "120.0.0.0", "os_version": "10",
                    "release_channel": "stable", "client_build_number": 269086,
                },
                "presence": {"status": "invisible", "since": 0, "activities": [], "afk": False},
                "compress": False,
                "client_state": {"guild_versions": {}},
            }
        }))

        ready = False
        deadline = asyncio.get_event_loop().time() + 20

        while asyncio.get_event_loop().time() < deadline:
            try:
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=5))
                op = msg.get("op"); t = msg.get("t"); d = msg.get("d") or {}

                if t == "READY":
                    ready = True
                    # Get presences from READY event
                    for g in d.get("guilds", []):
                        if str(g.get("id")) == GUILD_ID:
                            for p in g.get("presences", []):
                                uid = p.get("user", {}).get("id")
                                if uid in TEAM_IDS:
                                    presence[uid] = p.get("status", "offline")

                    # Subscribe to guild for full presence list
                    await ws.send(json.dumps({
                        "op": 14,
                        "d": {"guild_id": GUILD_ID, "typing": True, "activities": True, "threads": False, "members": []}
                    }))
                    # Request specific members
                    await ws.send(json.dumps({
                        "op": 8,
                        "d": {"guild_id": GUILD_ID, "user_ids": list(TEAM_IDS.keys()), "presences": True}
                    }))

                elif t == "GUILD_MEMBERS_CHUNK":
                    for p in d.get("presences", []):
                        uid = p.get("user", {}).get("id")
                        if uid in TEAM_IDS:
                            presence[uid] = p.get("status", "offline")

                elif t == "PRESENCE_UPDATE":
                    uid = d.get("user", {}).get("id")
                    if uid in TEAM_IDS:
                        presence[uid] = d.get("status", "offline")

                elif op == 1:
                    await ws.send(json.dumps({"op": 1, "d": None}))

            except asyncio.TimeoutError:
                if ready:
                    break

    # Fill missing with offline
    for uid in TEAM_IDS:
        if uid not in presence:
            presence[uid] = "offline"

    return presence

def save(presence):
    for path in DATA_FILES:
        try:
            with open(path) as f:
                d = json.load(f)
            d["team_presence"] = presence
            d["presence_updated"] = datetime.utcnow().isoformat() + "Z"
            with open(path, "w") as f:
                json.dump(d, f, indent=2)
        except Exception as e:
            print(f"⚠️ {path}: {e}")

    # Also write to Supabase
    try:
        import urllib.request
        SB_URL = 'https://oqqwwccercxiwtyedwqm.supabase.co'
        SB_KEY = '***REMOVED_SERVICE_KEY***'
        sb_data = json.dumps({'key': 'team_presence', 'value': json.dumps(presence)}).encode()
        req = urllib.request.Request(
            f'{SB_URL}/rest/v1/kv_store?on_conflict=key', data=sb_data, method='POST',
            headers={'apikey': SB_KEY, 'Authorization': f'Bearer {SB_KEY}',
                     'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates'})
        urllib.request.urlopen(req, timeout=10)
        print(f'✅ Supabase: team_presence')
    except Exception as e:
        print(f'⚠️ Supabase presence: {e}')

if __name__ == "__main__":
    presence = asyncio.run(fetch_presence())
    dots = {"online": "🟢", "idle": "🟡", "dnd": "🔴", "offline": "⚫"}
    for uid, name in TEAM_IDS.items():
        s = presence.get(uid, "offline")
        print(f"  {dots.get(s,'⚫')} {name}: {s}")
    save(presence)
    # Write last_run timestamp for agent health check
    import os
    open(os.path.expanduser("~/.openclaw/workspace/mission-control/.presence_last_run"), "w").write(datetime.utcnow().isoformat())
    print(f"✅ Done — {datetime.utcnow().strftime('%H:%M:%S')}")
