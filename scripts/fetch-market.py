#!/usr/bin/env python3
import os
from pathlib import Path; from dotenv import load_dotenv; load_dotenv(Path(__file__).resolve().parent.parent / '.env')
"""Market data — Yahoo Finance → Supabase. Every 5 min."""
import json, urllib.request
from datetime import datetime, timezone

SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]

SYMBOLS = [
    ("BTC-USD","Bitcoin","crypto","₿"),
    ("ETH-USD","Ethereum","crypto","Ξ"),
    ("SOL-USD","Solana","crypto","◎"),
]

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

def main():
    results = []
    for symbol, name, kind, emoji in SYMBOLS:
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d"
            req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0","Accept":"application/json"})
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.load(r)
            meta  = data["chart"]["result"][0]["meta"]
            price = meta.get("regularMarketPrice", 0)
            prev  = meta.get("chartPreviousClose", price)
            change = price - prev
            pct    = (change / prev * 100) if prev else 0
            results.append({"symbol":symbol,"name":name,"price":price,"change":round(change,4),
                "change_pct":round(pct,2),"currency":"USD","kind":kind,"emoji":emoji})
            print(f"  {symbol}: ${price:,.2f} ({pct:+.2f}%)")
        except Exception as e:
            print(f"  ❌ {symbol}: {e}")
    sb_upsert("market_data", results)
    print("✅ market_data synced to Supabase")

main()
