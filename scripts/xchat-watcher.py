#!/usr/bin/env python3
"""Poll Supabase xchat_queue every 5s, forward to xchat-server on localhost:9867."""
import json, time, urllib.request

SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXd3Y2NlcmN4aXd0eWVkd3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMjgyOSwiZXhwIjoyMDg3Nzk4ODI5fQ.Gox3T828yW7HEP51ijpN8SkImMIzFXFw8o5_FEXt3FU"

def sb_get(key):
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?key=eq.{key}&select=value",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
    with urllib.request.urlopen(req, timeout=10) as r:
        rows = json.load(r)
    if not rows: return None
    v = rows[0]["value"]
    return json.loads(v) if isinstance(v, str) else v

def sb_upsert(key, value):
    data = json.dumps({"key": key, "value": json.dumps(value)}).encode()
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/kv_store?on_conflict=key", data=data, method="POST",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                 "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    urllib.request.urlopen(req, timeout=10)

def send_to_xchat(text):
    data = json.dumps({"text": text}).encode()
    req = urllib.request.Request("http://localhost:9867/send", data=data,
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

last_ts = None
print("👀 Watching xchat_queue...")

while True:
    try:
        q = sb_get("xchat_queue")
        if q and q.get("status") == "pending":
            ts = q.get("ts", "")
            text = q.get("text", "").strip()
            if ts != last_ts and text:
                print(f"📨 Sending: {text[:50]}...")
                result = send_to_xchat(text)
                print(f"   → {result}")
                last_ts = ts
                # Mark as sent
                sb_upsert("xchat_queue", {"text": text, "ts": ts, "status": "sent"})
    except Exception as e:
        print(f"⚠ {e}")
    time.sleep(5)
