#!/usr/bin/env python3
import os
from pathlib import Path; from dotenv import load_dotenv; load_dotenv(Path(__file__).resolve().parent.parent / ".env")
"""
X Notifications Daemon — lightweight polling, no Playwright, no proxy.
Runs forever, checks every 60s, writes new notifs to data.json.
"""
import json, time, requests, signal, sys
from pathlib import Path
from datetime import datetime, timezone

SESSION_FILE = Path("/Users/oscarbrendon/.openclaw/workspace/mission-control/scripts/67coinx_session.json")
DATA_FILE    = Path("/Users/oscarbrendon/67agent-mission-control/public/data.json")
POLL_SECS    = 60

def load_cookies():
    s = json.loads(SESSION_FILE.read_text())
    return {c["name"]: c["value"] for c in s.get("cookies", [])}

def fetch_notifs(cookies):
    ct0        = cookies.get("ct0", "")
    auth_token = cookies.get("auth_token", "")
    if not auth_token or not ct0:
        return []

    headers = {
        "authorization":  f"Bearer {os.environ.get('X_GUEST_TOKEN', 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LW81O0q0LfVoSTPITPVBFtWPUk7p4lIgEOVgWlUoE')}",
        "x-csrf-token":   ct0,
        "cookie":         "; ".join(f"{k}={v}" for k, v in cookies.items()),
        "user-agent":     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122 Safari/537.36",
        "x-twitter-active-user": "yes",
        "x-twitter-client-language": "en",
        "referer":        "https://x.com/notifications",
    }

    try:
        r = requests.get("https://x.com/i/api/2/notifications/all.json",
                         headers=headers, params={"count": 40}, timeout=15)
        if r.status_code != 200:
            print(f"  ⚠️  HTTP {r.status_code}: {r.text[:100]}")
            return []

        data      = r.json()
        timeline  = data.get("timeline", {})
        users_db  = data.get("users", {})
        tweets_db = data.get("tweets", {})
        notifs    = []

        entries = []
        for inst in timeline.get("instructions", []):
            entries += inst.get("addEntries", {}).get("entries", [])

        for entry in entries:
            content = entry.get("content", {})
            items   = content.get("timelineModule", {}).get("items", [])
            if not items:
                items = [{"item": content}]

            for item in items:
                notif = item.get("item", {}).get("content", {}).get("notification", {})
                if not notif:
                    continue
                agg    = notif.get("template", {}).get("aggregateUserActionsV1", {})
                icon   = notif.get("icon", {}).get("id", "")

                tweet_id = (agg.get("targetObjects") or [{}])[0].get("tweet", {}).get("id", "")
                tweet    = tweets_db.get(tweet_id, {})
                text     = tweet.get("full_text", "")
                created  = tweet.get("created_at", "")

                actors = agg.get("fromUsers") or [{}]
                uid    = actors[0].get("user", {}).get("id", "")
                user   = users_db.get(uid, {})
                handle = user.get("screen_name", "")
                name   = user.get("name", "")
                extra  = f"+{len(actors)-1} more" if len(actors) > 1 else ""

                if not handle and not text:
                    continue

                try:
                    dt       = datetime.strptime(created, "%a %b %d %H:%M:%S +0000 %Y").replace(tzinfo=timezone.utc)
                    time_iso = dt.isoformat()
                except:
                    time_iso = datetime.now(timezone.utc).isoformat()

                notifs.append({
                    "type":   icon or "notification",
                    "user":   name,
                    "handle": handle,
                    "extra":  extra,
                    "text":   text[:200],
                    "time":   time_iso,
                    "link":   f"https://x.com/{handle}/status/{tweet_id}" if tweet_id else f"https://x.com/{handle}",
                })

        return notifs[:40]

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return []

def save(notifs):
    data = json.loads(DATA_FILE.read_text())
    data["x_notifications"] = notifs
    DATA_FILE.write_text(json.dumps(data, indent=2))

def main():
    print(f"🚀 X Notifications Daemon started (poll every {POLL_SECS}s)")
    signal.signal(signal.SIGINT,  lambda *_: (print("\n👋 Stopped"), sys.exit(0)))
    signal.signal(signal.SIGTERM, lambda *_: (print("\n👋 Stopped"), sys.exit(0)))

    while True:
        try:
            cookies = load_cookies()
            notifs  = fetch_notifs(cookies)
            if notifs:
                save(notifs)
                print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ {len(notifs)} notifs")
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚠️  0 notifs (session expired?)")
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ {e}")
        time.sleep(POLL_SECS)

main()
