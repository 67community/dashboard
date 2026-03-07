#!/usr/bin/env python3
"""Fetch crypto + 67coin news from RSS → Supabase. Every 2 hours."""
import json, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXd3Y2NlcmN4aXd0eWVkd3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMjgyOSwiZXhwIjoyMDg3Nzk4ODI5fQ.Gox3T828yW7HEP51ijpN8SkImMIzFXFw8o5_FEXt3FU"

RSS_FEEDS = [
    "https://news.google.com/rss/search?q=67coin+solana&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=memecoin+solana&hl=en-US&gl=US&ceid=US:en",
    "https://feeds.feedburner.com/CoinDesk",
    "https://cointelegraph.com/rss",
    "https://decrypt.co/feed",
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://cryptonews.com/news/feed/",
    "https://bitcoinmagazine.com/.rss/full/",
]

def fetch_rss(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.read()
    except Exception as e:
        print(f"  ⚠️ {url[:50]}: {e}")
        return None

def parse_rss(data):
    items = []
    try:
        root = ET.fromstring(data)
        for item in root.findall(".//item"):
            title   = item.findtext("title", "").strip()
            link    = item.findtext("link", "").strip()
            pub     = item.findtext("pubDate", "")
            source  = item.findtext("source", "") or ""
            if not title or not link: continue
            items.append({"title": title, "link": link, "pub": pub, "source": source})
    except: pass
    return items

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

seen, results = set(), []
for feed_url in RSS_FEEDS:
    data = fetch_rss(feed_url)
    if not data: continue
    for item in parse_rss(data):
        if item["link"] not in seen:
            seen.add(item["link"])
            results.append(item)

results = results[:60]
sb_upsert("news_feed", results)
print(f"✅ news_feed synced ({len(results)} articles)")
