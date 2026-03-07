#!/usr/bin/env python3
"""YouTube videos → Supabase. Every 1 hour."""
import json, urllib.request, urllib.parse
from datetime import datetime, timezone

SB_URL  = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY  = "***REMOVED_SERVICE_KEY***"
YT_KEY  = "***REMOVED_YT_KEY***"
YT_BASE = "https://www.googleapis.com/youtube/v3"

QUERIES = ["67"]

TITLE_KW = ["67coin","67 coin","$67","official 67","mav67","maverick 67","the official 67","67kids","trevillian"]

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

def fmt_views(n):
    if n >= 1_000_000: return f"{n/1_000_000:.1f}M"
    if n >= 1_000:     return f"{n/1_000:.1f}K"
    return str(n)

def parse_dur(iso):
    import re
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m: return ""
    h,mi,s = int(m.group(1) or 0), int(m.group(2) or 0), int(m.group(3) or 0)
    if h: return f"{h}:{mi:02d}:{s:02d}"
    return f"{mi}:{s:02d}"

def is_relevant(title):
    t = title.lower()
    return any(kw in t for kw in TITLE_KW)

def yt_search(q, order, n=30):
    from datetime import datetime, timezone, timedelta
    published_after = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    params = urllib.parse.urlencode({"part":"snippet","q":q,"type":"video","order":order,"maxResults":n,"publishedAfter":published_after,"key":YT_KEY})
    return fetch(f"{YT_BASE}/search?{params}").get("items", [])

def main():
    seen_pop, seen_rec = set(), set()
    pop_items, rec_items = [], []

    for q in QUERIES:
        try:
            for v in yt_search(q, "date", 30):
                vid = v.get("id",{}).get("videoId","")
                if vid and vid not in seen_rec:
                    seen_rec.add(vid); rec_items.append({**v,"_type":"recent"})
            print(f"  ✅ '{q}'")
        except Exception as e:
            print(f"  ❌ '{q}': {e}")

    all_items = (rec_items + pop_items)[:30]
    if not all_items:
        print("⚠️ No results"); return

    # Fetch stats
    ids = ",".join(v.get("id",{}).get("videoId","") for v in all_items)
    try:
        stats_data = fetch(f"{YT_BASE}/videos?part=statistics,contentDetails&id={ids}&key={YT_KEY}")
        stats_map = {i["id"]: i for i in stats_data.get("items", [])}
    except: stats_map = {}

    results = []
    for v in all_items:
        vid   = v.get("id",{}).get("videoId","")
        snip  = v.get("snippet",{})
        stats = stats_map.get(vid, {})
        views   = int(stats.get("statistics",{}).get("viewCount",   0))
        likes   = int(stats.get("statistics",{}).get("likeCount",   0))
        comments= int(stats.get("statistics",{}).get("commentCount",0))
        dur     = parse_dur(stats.get("contentDetails",{}).get("duration",""))
        results.append({
            "video_id":      vid,
            "video_url":     f"https://www.youtube.com/watch?v={vid}",
            "title":         snip.get("title",""),
            "channel":       snip.get("channelTitle",""),
            "thumbnail_url": snip.get("thumbnails",{}).get("high",{}).get("url",""),
            "views":         views, "views_text": fmt_views(views),
            "likes":         likes, "comments": comments,
            "published_at":  snip.get("publishedAt",""),
            "duration":      dur,
            "video_type":    v["_type"],
        })

    sb_upsert("youtube_videos", results)
    print(f"✅ youtube_videos synced ({len(results)} videos)")

main()
