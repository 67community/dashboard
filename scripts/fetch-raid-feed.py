#!/usr/bin/env python3
"""Poll Telegram '67 Raider' group for raid links → Supabase. Runs as daemon."""
import json, re, time, urllib.request
from datetime import datetime, timezone

TG_RAID_BOT = "8671419325:AAFFdKDuZp97NSITwClyw6MYI9WVhIO7nSo"
TG_RAID_GROUP = "-1003708062172"
POLL_INTERVAL = 10  # seconds

SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXd3Y2NlcmN4aXd0eWVkd3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMjgyOSwiZXhwIjoyMDg3Nzk4ODI5fQ.Gox3T828yW7HEP51ijpN8SkImMIzFXFw8o5_FEXt3FU"

offset = 0

def tg_get_updates():
    global offset
    url = f"https://api.telegram.org/bot{TG_RAID_BOT}/getUpdates?limit=100&timeout=30"
    if offset:
        url += f"&offset={offset}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)

def sb_get(key):
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?key=eq.{key}&select=value",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
    with urllib.request.urlopen(req, timeout=10) as r:
        rows = json.load(r)
    if not rows: return []
    v = rows[0]["value"]
    return json.loads(v) if isinstance(v, str) else v

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?on_conflict=key", data=data, method="POST",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                 "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    urllib.request.urlopen(req, timeout=10)

def main():
    global offset
    print(f"👂 Polling '67 Raider' group (every {POLL_INTERVAL}s)...")

    while True:
        try:
            data = tg_get_updates()
            if not data.get("ok"):
                time.sleep(POLL_INTERVAL); continue

            results = data.get("result", [])
            new_items = []

            for upd in results:
                # Move offset forward
                offset = max(offset, upd["update_id"] + 1)

                msg = upd.get("message")
                if not msg: continue
                if str(msg.get("chat", {}).get("id")) != TG_RAID_GROUP: continue

                text = msg.get("text") or msg.get("caption") or ""
                if not text: continue

                tweet_match = re.search(r'https?://(twitter|x)\.com/[^\s]+', text, re.I)
                tweet_url = tweet_match.group(0).rstrip(')].!?,') if tweet_match else None
                handle_match = re.search(r'@(\w+)', text)

                new_items.append({
                    "id": str(upd["update_id"]),
                    "text": text[:280],
                    "date": datetime.fromtimestamp(msg.get("date", 0), tz=timezone.utc).isoformat(),
                    "tweet_url": tweet_url,
                    "handle": handle_match.group(0) if handle_match else None,
                })

            if new_items:
                existing = sb_get("raid_feed") or []
                feed = new_items + existing
                feed = feed[:200]
                sb_upsert("raid_feed", feed)
                print(f"📨 +{len(new_items)} raid items → Supabase ({len(feed)} total)")

        except KeyboardInterrupt:
            print("🛑 Stopped"); break
        except Exception as e:
            print(f"⚠ {e}")

        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
