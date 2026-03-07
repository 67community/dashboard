#!/usr/bin/env python3
"""Token Health — DexScreener + CoinGecko + CMC → Supabase. Every 2 min."""
import json, urllib.request
from datetime import datetime, timezone

SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "***REMOVED_SERVICE_KEY***"
PAIR    = "DMAFL613XTipuA3jFNYczavWT7XsiYf9cR3qmRMZQhB6"
TOKEN   = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
CMC_KEY = "***REMOVED_CMC_KEY***"
CG_ID   = "the-official-67-coin"

def fetch(url, headers={}):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0",**headers})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def sb_upsert(key, value):
    body = json.dumps({"key": key, "value": value}).encode()
    req = urllib.request.Request(f"{SB_URL}/rest/v1/kv_store", data=body, headers={
        "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"
    }, method="POST")
    with urllib.request.urlopen(req, timeout=10): pass

def main():
    result = {}
    try:
        dex = fetch(f"https://api.dexscreener.com/latest/dex/pairs/solana/{PAIR}")
        pair = dex.get("pair", {})
        result.update({
            "price":            float(pair.get("priceUsd", 0)),
            "price_change_24h": pair.get("priceChange", {}).get("h24", 0),
            "price_change_1h":  pair.get("priceChange", {}).get("h1", 0),
            "price_change_6h":  pair.get("priceChange", {}).get("h6", 0),
            "market_cap":       pair.get("marketCap", 0),
            "liquidity":        pair.get("liquidity", {}).get("usd", 0),
            "volume_24h":       pair.get("volume", {}).get("h24", 0),
            "volume_1h":        pair.get("volume", {}).get("h1", 0),
            "buys_24h":         pair.get("txns", {}).get("h24", {}).get("buys", 0),
            "sells_24h":        pair.get("txns", {}).get("h24", {}).get("sells", 0),
            "buys_1h":          pair.get("txns", {}).get("h1", {}).get("buys", 0),
            "sells_1h":         pair.get("txns", {}).get("h1", {}).get("sells", 0),
        })
        print(f"  DexScreener: ${result['price']:.6f}")
    except Exception as e:
        print(f"  ❌ DexScreener: {e}")

    try:
        cg = fetch(f"https://api.coingecko.com/api/v3/coins/{CG_ID}?localization=false&tickers=false&market_data=true")
        md = cg.get("market_data", {})
        result.update({
            "coingecko_rank": cg.get("market_cap_rank", 0),
            "price_change_7d": md.get("price_change_percentage_7d", 0),
            "ath":             md.get("ath", {}).get("usd", 0),
            "ath_date":        md.get("ath_date", {}).get("usd", ""),
            "ath_change_pct":  md.get("ath_change_percentage", {}).get("usd", 0),
        })
        print(f"  CoinGecko rank: #{result['coingecko_rank']}")
    except Exception as e:
        print(f"  ❌ CoinGecko: {e}")

    try:
        cmc = fetch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=38918",
                    {"X-CMC_PRO_API_KEY": CMC_KEY})
        result["cmc_rank"] = cmc.get("data", {}).get("38918", {}).get("cmc_rank", 0)
        print(f"  CMC rank: #{result['cmc_rank']}")
    except Exception as e:
        print(f"  ❌ CMC: {e}")

    result["updated_at"] = datetime.now(timezone.utc).isoformat()
    sb_upsert("token_health", result)
    print(f"✅ token_health synced to Supabase")

main()
