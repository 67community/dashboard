#!/usr/bin/env python3
"""X News Popular — runs every 1 hour. Last 24h, most liked first."""
import json, urllib.request, urllib.parse
from pathlib import Path
from datetime import datetime, timezone

RAPIDAPI_KEY = "4b393aa0cemsh6895fd899d6eedcp1a441djsnfe89097510cd"
DATA_JSON    = Path(__file__).parent.parent / "public/data.json"

# ── Supabase sync ──────────────────────────────────────────────
import urllib.request as _ur
_SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
_SB_KEY = "***REMOVED_SERVICE_KEY***"
def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = _ur.Request(f"{_SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": _SB_KEY, "Authorization": f"Bearer {_SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    try:
        with _ur.urlopen(req, timeout=10): pass
        print("  ✅ Supabase synced")
    except Exception as e:
        print(f"  ⚠️ Supabase error: {e}")

TAGS = ["67","Six Seven","Six and Seven","6/7","$67","67to67billion"]
CUTOFF = 86400  # 24h

def search(query, count=20):
    params = urllib.parse.urlencode({"query": query, "type": "Top", "count": count})
    req = urllib.request.Request(
        f"https://twitter241.p.rapidapi.com/search?{params}",
        headers={"x-rapidapi-host":"twitter241.p.rapidapi.com","x-rapidapi-key":RAPIDAPI_KEY}
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def parse(data, tag):
    out = []
    for inst in data.get("result",{}).get("timeline",{}).get("instructions",[]):
        for entry in inst.get("entries",[]):
            tw  = entry.get("content",{}).get("itemContent",{}).get("tweet_results",{}).get("result",{})
            leg = tw.get("legacy",{})
            text = leg.get("full_text","")
            if not text: continue
            sn  = tw.get("core",{}).get("user_results",{}).get("result",{}).get("core",{}).get("screen_name","")
            tid = leg.get("id_str","")
            out.append({"id":tid,"user":sn,"text":text[:280],
                "likes":int(leg.get("favorite_count",0)),
                "reposts":int(leg.get("retweet_count",0)),
                "replies":int(leg.get("reply_count",0)),
                "time":leg.get("created_at",""),
                "link":f"https://x.com/{sn}/status/{tid}","tag":tag})
    return out

def ts(t):
    try: return datetime.strptime(t["time"],"%a %b %d %H:%M:%S +0000 %Y").replace(tzinfo=timezone.utc).timestamp()
    except: return 0

def main():
    cutoff = datetime.now(timezone.utc).timestamp() - CUTOFF
    seen, results = set(), []
    for tag in TAGS:
        try:
            for t in parse(search(tag), tag):
                if t["id"] not in seen:
                    seen.add(t["id"]); results.append(t)
        except Exception as e:
            print(f"  ❌ '{tag}': {e}")

    results = [t for t in results if ts(t) >= cutoff]
    results.sort(key=lambda t: t["likes"], reverse=True)
    print(f"✅ Popular: {len(results)} tweets (last 24h)")

    sb_upsert("x_popular", results)
    with open(DATA_JSON) as f: d = json.load(f)
    d["x_popular"] = results
    d["x_popular_updated"] = datetime.now(timezone.utc).isoformat()
    with open(DATA_JSON,"w") as f: json.dump(d,f,indent=2)

main()


