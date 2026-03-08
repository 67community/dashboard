#!/usr/bin/env python3
"""Token Health — DexScreener + CoinGecko + CMC → Supabase. Every 2 min."""
import json, urllib.request
from datetime import datetime, timezone

SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXd3Y2NlcmN4aXd0eWVkd3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMjgyOSwiZXhwIjoyMDg3Nzk4ODI5fQ.Gox3T828yW7HEP51ijpN8SkImMIzFXFw8o5_FEXt3FU"
PAIR    = "DMAFL613XTipuA3jFNYczavWT7XsiYf9cR3qmRMZQhB6"
TOKEN   = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
CMC_KEY = "78022712d1174390a47b1ee92bc89939"
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

GT_POOL = "DMAFL613XTipuA3jFNYczavWT7XsiYf9cR3qmRMZQhB6"

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

    # CoinGecko — rank + ATH + watchlist
    try:
        cg = fetch(f"https://api.coingecko.com/api/v3/coins/{CG_ID}?localization=false&tickers=false&market_data=true&community_data=true")
        md = cg.get("market_data", {})
        result.update({
            "coingecko_rank":  cg.get("market_cap_rank", 0),
            "price_change_7d": md.get("price_change_percentage_7d", 0),
            "ath":             md.get("ath", {}).get("usd", 0),
            "ath_date":        md.get("ath_date", {}).get("usd", ""),
            "ath_change_pct":  md.get("ath_change_percentage", {}).get("usd", 0),
            "watchlist_count": cg.get("watchlist_portfolio_users", 0),
        })
        print(f"  CoinGecko rank: #{result['coingecko_rank']}, watchlist: {result['watchlist_count']}")
    except Exception as e:
        print(f"  ❌ CoinGecko: {e}")

    # CoinGecko tickers — exchange volumes
    try:
        tickers = fetch(f"https://api.coingecko.com/api/v3/coins/{CG_ID}/tickers?include_exchange_logo=true&page=1&depth=false&order=volume_desc")
        raw = tickers.get("tickers", [])[:12]
        dex_keywords = ["swap", "dex", "pumpswap", "raydium", "orca", "meteora"]
        exchange_volumes = []
        for t in raw:
            mid = (t.get("market", {}).get("identifier") or "").lower()
            exchange_volumes.append({
                "exchange":   t.get("market", {}).get("name", "Unknown"),
                "pair":       f"{t.get('base', '67')}/{t.get('target', 'USDT')}",
                "volume_usd": t.get("converted_volume", {}).get("usd", 0),
                "is_dex":     any(k in mid for k in dex_keywords),
                "logo":       t.get("market", {}).get("logo"),
            })
        result["exchange_volumes"] = exchange_volumes
        total = sum(e["volume_usd"] for e in exchange_volumes)
        result["total_volume_24h"] = total if total > 0 else result.get("volume_24h", 0)
        print(f"  Exchange volumes: {len(exchange_volumes)} exchanges, ${total:,.0f}")
    except Exception as e:
        print(f"  ❌ CG Tickers: {e}")

    # CMC rank
    try:
        cmc = fetch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=38918",
                    {"X-CMC_PRO_API_KEY": CMC_KEY})
        result["cmc_rank"] = cmc.get("data", {}).get("38918", {}).get("cmc_rank", 0)
        print(f"  CMC rank: #{result['cmc_rank']}")
    except Exception as e:
        print(f"  ❌ CMC: {e}")

    # GeckoTerminal — biggest trades 24h
    try:
        gt = fetch(f"https://api.geckoterminal.com/api/v2/networks/solana/pools/{GT_POOL}/trades?trade_volume_in_usd_greater_than=0",
                   {"Accept": "application/json"})
        trades = gt.get("data", [])
        cutoff = datetime.now(timezone.utc).timestamp() - 86400
        in24h = []
        for t in trades:
            a = t.get("attributes", {})
            try:
                ts = datetime.fromisoformat(a["block_timestamp"].replace("Z", "+00:00")).timestamp()
            except: continue
            if ts > cutoff:
                in24h.append(a)
        buys  = [a for a in in24h if a.get("kind") == "buy"]
        sells = [a for a in in24h if a.get("kind") == "sell"]
        best_buy  = max(buys,  key=lambda a: float(a.get("volume_in_usd", 0)), default=None) if buys else None
        best_sell = max(sells, key=lambda a: float(a.get("volume_in_usd", 0)), default=None) if sells else None
        result["biggest_trades"] = {
            "biggest_buy_usd":   float(best_buy["volume_in_usd"]) if best_buy else 0,
            "biggest_buy_tx":    best_buy.get("tx_hash", "") if best_buy else "",
            "biggest_buy_time":  best_buy.get("block_timestamp", "") if best_buy else "",
            "biggest_sell_usd":  float(best_sell["volume_in_usd"]) if best_sell else 0,
            "biggest_sell_tx":   best_sell.get("tx_hash", "") if best_sell else "",
            "biggest_sell_time": best_sell.get("block_timestamp", "") if best_sell else "",
            "_trades_in_window": len(in24h),
        }
        print(f"  Biggest trades: buy ${result['biggest_trades']['biggest_buy_usd']:.2f}, sell ${result['biggest_trades']['biggest_sell_usd']:.2f}")
    except Exception as e:
        print(f"  ❌ GeckoTerminal: {e}")

    result["updated_at"] = datetime.now(timezone.utc).isoformat()
    sb_upsert("token_health", result)
    print(f"✅ token_health synced to Supabase")

main()
