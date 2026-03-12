#!/usr/bin/env python3
import os
from pathlib import Path; from dotenv import load_dotenv; load_dotenv(Path(__file__).resolve().parent.parent / '.env')
"""Holders — Solana RPC → Supabase. Every 10 min."""
import json, urllib.request, base64
from datetime import datetime, timezone

SB_URL = os.environ["SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]
TOKEN = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

def main():
    body = json.dumps({
        "jsonrpc":"2.0","id":1,
        "method":"getProgramAccounts",
        "params":["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",{
            "encoding":"base64",
            "dataSlice":{"offset":64,"length":8},
            "filters":[{"dataSize":165},{"memcmp":{"offset":0,"bytes":TOKEN}}]
        }]
    }).encode()
    req = urllib.request.Request("https://api.mainnet-beta.solana.com",
        data=body, headers={"Content-Type":"application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    accounts = data.get("result", [])
    count = 0
    for a in accounts:
        try:
            raw = base64.b64decode(a["account"]["data"][0])
            lo = int.from_bytes(raw[0:4], "little")
            hi = int.from_bytes(raw[4:8], "little")
            if lo != 0 or hi != 0:
                count += 1
        except: pass
    print(f"✅ Holders: {count}")
    sb_upsert("holders", {"count": count, "updated_at": datetime.now(timezone.utc).isoformat()})

main()
