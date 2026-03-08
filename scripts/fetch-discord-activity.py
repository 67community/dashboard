#!/usr/bin/env python3
"""
Fetch Discord activity (joins, top channels, contributors, voice, events, boost, mod)
and write to Supabase kv_store key: discord_activity
Runs every 5 minutes from Mac mini cron.
"""
import json, os, re, time, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

GUILD_ID  = "1440077830456082545"
INTRO_CH  = "1459629395462586398"
NML_CH    = "1470525026347385114"
MOD_BOT_ID = "1474483702812643359"
MOD_CH_IDS = {"1458846146415034460", "1451275835649560646"}

SB_URL  = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY  = "***REMOVED_SERVICE_KEY***"

DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN", "")
if not DISCORD_TOKEN:
    env_file = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("DISCORD_TOKEN="):
                DISCORD_TOKEN = line.split("=", 1)[1].strip('"').strip("'")

SKIP_CH = ["mod","log","wick","admin","verification","sticker","join-server","the-rules","welcome","faqs","announcements","resources","assets","calendar","studio","top-100","member-tracking","bot-tests","operation","map-admin","team-general","x-queue","new-members","mods","cmods","ops-general"]
PRIORITY_CH = ["chat","67coin-chat","memes","giveaways","off-topic","general","trading","introductions","nfts","gaming"]

def is_community(name):
    n = name.lower()
    return not any(p in n for p in SKIP_CH)

def discord_get(endpoint):
    url = f"https://discord.com/api/v10/{endpoint}"
    req = urllib.request.Request(url, headers={"Authorization": DISCORD_TOKEN, "User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def time_ago(iso_str):
    secs = int((datetime.now(timezone.utc) - datetime.fromisoformat(iso_str.replace("Z","+00:00"))).total_seconds())
    if secs < 60: return f"{secs}s ago"
    if secs < 3600: return f"{secs//60}m ago"
    if secs < 86400: return f"{secs//3600}h ago"
    return f"{secs//86400}d ago"

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

    now = datetime.now(timezone.utc)
    cutoff_24h = (now - timedelta(hours=24)).isoformat()
    cutoff_1h  = (now - timedelta(hours=1)).isoformat()
    cutoff_6h  = (now - timedelta(hours=6)).isoformat()

    print("Fetching Discord activity...")

    try:
        guild = discord_get(f"guilds/{GUILD_ID}?with_counts=true")
    except Exception as e:
        print(f"❌ Guild fetch: {e}"); return

    boost_level = guild.get("premium_tier", 0)
    boost_count = guild.get("premium_subscription_count", 0)

    try: all_channels = discord_get(f"guilds/{GUILD_ID}/channels")
    except: all_channels = []

    try: events_raw = discord_get(f"guilds/{GUILD_ID}/scheduled-events?with_user_count=true")
    except: events_raw = []

    scheduled_events = [
        {"name": e.get("name","Event"), "start": e.get("scheduled_start_time",""),
         "description": (e.get("description") or "")[:100], "user_count": e.get("user_count",0)}
        for e in (events_raw if isinstance(events_raw, list) else [])[:5]
    ]

    text_chs = [c for c in all_channels if c.get("type") == 0 and is_community(c.get("name",""))]
    text_chs.sort(key=lambda c: next((i for i,p in enumerate(PRIORITY_CH) if p in c.get("name","").lower()), 99))
    text_chs = text_chs[:12]

    # Recent joins from #introductions
    recent_joins = []
    try:
        intro_msgs = discord_get(f"channels/{INTRO_CH}/messages?limit=100")
        seen = set()
        for msg in (intro_msgs if isinstance(intro_msgs, list) else []):
            if msg.get("author",{}).get("bot"): continue
            ts = msg.get("timestamp","")
            if ts < cutoff_24h: continue
            uid = msg["author"]["id"]
            if uid in seen: continue
            seen.add(uid)
            av_hash = msg["author"].get("avatar")
            avatar = (f"https://cdn.discordapp.com/avatars/{uid}/{av_hash}.png" if av_hash
                      else f"https://cdn.discordapp.com/embed/avatars/{int(uid[-2:],16)%5}.png")
            content = re.sub(r"<[^>]+>", "", (msg.get("content") or ""))[:80]
            recent_joins.append({"user": msg["author"]["username"], "user_id": uid, "avatar": avatar,
                                 "message": content, "time_ago": time_ago(ts)})
            if len(recent_joins) >= 8: break
    except Exception as e:
        print(f"  ⚠ Intro: {e}")

    # New joins from #new-members-log
    new_joins_24h = 0
    try:
        nml = discord_get(f"channels/{NML_CH}/messages?limit=100")
        nml = nml if isinstance(nml, list) else []
        if len(nml) == 100:
            oldest = nml[-1].get("id","")
            if oldest:
                nml2 = discord_get(f"channels/{NML_CH}/messages?limit=100&before={oldest}")
                nml += (nml2 if isinstance(nml2, list) else [])
        new_joins_24h = sum(1 for m in nml if m.get("timestamp","") > cutoff_24h and m.get("type") == 7)
    except Exception as e:
        print(f"  ⚠ NML: {e}")

    # Channel messages scan
    active_set = set()
    channel_counts = []
    user_msg_map = {}
    mod_events = []

    for i in range(0, len(text_chs), 4):
        batch = text_chs[i:i+4]
        for ch in batch:
            try:
                msgs = discord_get(f"channels/{ch['id']}/messages?limit=100")
                msgs = msgs if isinstance(msgs, list) else []
            except: msgs = []

            msgs_1h = msgs_24h = 0
            for msg in msgs:
                uid = msg.get("author",{}).get("id","")
                is_bot = msg.get("author",{}).get("bot", False)
                ts = msg.get("timestamp","")

                if ch["id"] in MOD_CH_IDS and uid == MOD_BOT_ID and msg.get("embeds"):
                    all_text = " ".join(
                        f"{e.get('title','')} {e.get('description','')} {' '.join(f.get('value','') for f in e.get('fields',[]))}"
                        for e in msg["embeds"]).lower()
                    targets = msg.get("mentions",[])
                    if targets and ts > cutoff_6h:
                        t = targets[0]
                        tav = (f"https://cdn.discordapp.com/avatars/{t['id']}/{t['avatar']}.png"
                               if t.get("avatar") else "https://cdn.discordapp.com/embed/avatars/0.png")
                        ev_type = ("ban" if "ban" in all_text else "spam" if "spam" in all_text or "scam" in all_text
                                   else "kick" if "kick" in all_text else "warn")
                        badge = {"ban":"Banned","spam":"Spam","kick":"Kicked","warn":"Warned"}[ev_type]
                        mod_events.append({"type": ev_type, "user": t.get("username","user"),
                            "user_id": t["id"], "avatar": tav, "detail": badge, "time_ago": time_ago(ts)})

                if is_bot or not uid: continue
                if ts > cutoff_24h:
                    active_set.add(uid)
                    msgs_24h += 1
                    av_hash = msg["author"].get("avatar")
                    av = (f"https://cdn.discordapp.com/avatars/{uid}/{av_hash}.png" if av_hash
                          else "https://cdn.discordapp.com/embed/avatars/0.png")
                    if uid in user_msg_map: user_msg_map[uid]["count"] += 1
                    else: user_msg_map[uid] = {"user": msg["author"].get("username","?"), "avatar": av, "count": 1}
                if ts > cutoff_1h: msgs_1h += 1

            if msgs_24h > 0 or msgs_1h > 0:
                channel_counts.append({"name": ch["name"], "msgs_1h": msgs_1h, "msgs_24h": msgs_24h})

        if i + 4 < len(text_chs): time.sleep(0.5)

    top_channels = sorted(channel_counts, key=lambda c: c["msgs_24h"], reverse=True)[:8]
    top_contributors = sorted(
        [{"user": v["user"], "user_id": uid, "avatar": v["avatar"], "msg_count": v["count"]}
         for uid, v in user_msg_map.items()], key=lambda x: x["msg_count"], reverse=True)[:8]

    result = {
        "recent_joins": recent_joins, "active_users_today": len(active_set),
        "new_joins_24h": new_joins_24h, "top_channels": top_channels,
        "voice_channels": [], "scheduled_events": scheduled_events,
        "boost_level": boost_level, "boost_count": boost_count,
        "mod_events": mod_events[:8], "top_contributors": top_contributors,
        "updated_at": now.isoformat(),
    }

    sb_upsert("discord_activity", result)
    print(f"✅ Supabase: discord_activity")
    print(f"   Joins 24h: {new_joins_24h}, Active: {len(active_set)}, Channels: {len(top_channels)}, Boost L{boost_level}")

if __name__ == "__main__":
    main()
