#!/usr/bin/env python3
import os
from pathlib import Path; from dotenv import load_dotenv; load_dotenv(Path(__file__).resolve().parent.parent / '.env')
"""Fetch 67coin-related news from RSS → Supabase. Every 24 hours."""
import json, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]

RSS_FEEDS = [
    "https://news.google.com/rss/search?q=67&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=67coin&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=%2267+coin%22&hl=en-US&gl=US&ceid=US:en",
    "https://feeds.feedburner.com/CoinDesk",
    "https://cointelegraph.com/rss",
    "https://decrypt.co/feed",
    "https://cryptonews.com/news/feed/",
    "https://bitcoinmagazine.com/.rss/full/",
]

KEYWORDS = ["67"]

def fetch_rss(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.read()
    except Exception as e:
        print(f"  ⚠️ {url[:50]}: {e}")
        return None

def is_relevant(title):
    t = title.lower()
    return any(kw in t for kw in KEYWORDS)

def is_recent(pub_str):
    try:
        dt = parsedate_to_datetime(pub_str)
        return dt >= datetime.now(timezone.utc) - timedelta(hours=24)
    except:
        return True  # keep if can't parse

def parse_rss(data):
    items = []
    try:
        root = ET.fromstring(data)
        for item in root.findall(".//item"):
            title  = item.findtext("title", "").strip()
            link   = item.findtext("link", "").strip()
            pub    = item.findtext("pubDate", "")
            source = item.findtext("source", "") or ""
            if title and link and is_relevant(title) and is_recent(pub):
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

sb_upsert("news_feed", results)
print(f"✅ news_feed synced ({len(results)} articles, 24h + 67-related only)")
