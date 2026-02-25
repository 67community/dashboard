import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const PAIR   = "DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6"
const TOKEN  = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
const CMC_KEY = process.env.CMC_API_KEY ?? "09873ed23c74499eb07885cb070f64e6"

// ── helpers ──────────────────────────────────────────────────────────────────
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn() } catch { return null }
}

// ── DexScreener ───────────────────────────────────────────────────────────────
async function fetchDex() {
  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/pairs/solana/${PAIR}`,
    { next: { revalidate: 60 } }
  )
  const j = await res.json()
  return j?.pair ?? null
}

// ── CoinGecko (free) ──────────────────────────────────────────────────────────
async function fetchCG() {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/the-official-67-coin?localization=false&tickers=false&community_data=false&developer_data=false`,
    { next: { revalidate: 120 } }
  )
  return res.ok ? await res.json() : null
}

// ── CMC ───────────────────────────────────────────────────────────────────────
async function fetchCMC() {
  const res = await fetch(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=38918`,
    { headers: { "X-CMC_PRO_API_KEY": CMC_KEY }, next: { revalidate: 120 } }
  )
  return res.ok ? await res.json() : null
}

// ── Holders — Solana RPC (getProgramAccounts) ─────────────────────────────────
async function fetchHolders(): Promise<number> {
  const body = {
    jsonrpc: "2.0", id: 1,
    method: "getProgramAccounts",
    params: [
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      {
        encoding: "base64",
        dataSlice: { offset: 64, length: 8 },
        filters: [
          { dataSize: 165 },
          { memcmp: { offset: 0, bytes: TOKEN } },
        ],
      },
    ],
  }
  const res = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 600 },   // cache 10 min — expensive call
  })
  if (!res.ok) return 0
  const j = await res.json()
  const accounts: { account: { data: string[] } }[] = j?.result ?? []
  // count accounts with non-zero balance
  let count = 0
  for (const a of accounts) {
    try {
      const raw = Buffer.from(a.account.data[0], "base64")
      const lo = raw.readUInt32LE(0)
      const hi = raw.readUInt32LE(4)
      if (lo !== 0 || hi !== 0) count++
    } catch {}
  }
  return count
}

// ── public/data.json fallback ─────────────────────────────────────────────────
function readStaticJson() {
  const LOCAL = "/Users/oscarbrendon/.openclaw/workspace/mission-control/data.json"
  const BUNDLED = path.join(process.cwd(), "public", "data.json")
  for (const p of [LOCAL, BUNDLED]) {
    try {
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"))
    } catch {}
  }
  return null
}

// ── main ──────────────────────────────────────────────────────────────────────
export async function GET() {
  const [pair, cg, cmc, holders] = await Promise.all([
    safe(fetchDex),
    safe(fetchCG),
    safe(fetchCMC),
    safe(fetchHolders),
  ])

  // If all APIs fail, fall back to static file
  if (!pair && !cg) {
    const static_ = readStaticJson()
    if (static_) return NextResponse.json(static_, { headers: { "Cache-Control": "no-store" } })
    return NextResponse.json({ error: "no data" }, { status: 500 })
  }

  const cmcData = cmc?.data?.["38918"]?.quote?.USD

  const token_health = {
    price:            parseFloat(pair?.priceUsd ?? "0"),
    price_change_24h: pair?.priceChange?.h24 ?? 0,
    price_change_1h:  pair?.priceChange?.h1  ?? 0,
    price_change_6h:  pair?.priceChange?.h6  ?? 0,
    price_change_7d:  cg?.market_data?.price_change_percentage_7d ?? 0,
    market_cap:       pair?.marketCap ?? cg?.market_data?.market_cap?.usd ?? 0,
    liquidity:        pair?.liquidity?.usd ?? 0,
    volume_24h:       pair?.volume?.h24 ?? 0,
    volume_1h:        pair?.volume?.h1  ?? 0,
    buys_24h:         pair?.txns?.h24?.buys  ?? 0,
    sells_24h:        pair?.txns?.h24?.sells ?? 0,
    buys_1h:          pair?.txns?.h1?.buys   ?? 0,
    sells_1h:         pair?.txns?.h1?.sells  ?? 0,
    holders:          holders ?? cg?.market_data?.holders ?? 0,
    holder_trend:     0,
    coingecko_rank:   cg?.market_cap_rank ?? 0,
    cmc_rank:         cmcData?.cmc_rank ?? 0,
    ath:              cg?.market_data?.ath?.usd ?? 0.04363,
    ath_date:         cg?.market_data?.ath_date?.usd ?? "2025-11-19",
    ath_change_pct:   cg?.market_data?.ath_change_percentage?.usd ?? 0,
    total_volume_24h: pair?.volume?.h24 ?? 0,
    exchange_volumes: [],
    biggest_trades:   { biggest_buy_usd: 0, biggest_buy_tx: "", biggest_sell_usd: 0, biggest_sell_tx: "" },
    sentiment:        "Neutral",
  }

  const social_pulse = {
    twitter_followers:   0,
    follower_change_24h: 0,
    posting_streak_days: 0,
    engagement_rate:     0,
    avg_engagement:      0,
    total_engagement_7d: 0,
    best_content_type:   "tweet",
    content_type_stats:  {},
  }

  const community = {
    discord_members:  0,
    active_7d:        0,
    new_joins_24h:    0,
    open_tickets:     0,
    unanswered_posts: 0,
    telegram_members: 0,
    watchlist_count:  cg?.watchlist_portfolio_users ?? 0,
  }

  // Enrich with static file data for social/community/agents fields
  const static_ = readStaticJson()
  const out = {
    last_updated:    new Date().toISOString(),
    token_health,
    social_pulse:    static_?.social_pulse    ?? social_pulse,
    community:       static_?.community       ?? community,
    content_pipeline:static_?.content_pipeline ?? [],
    agents:          static_?.agents          ?? [],
    milestones:      static_?.milestones      ?? [],
    alerts:          static_?.alerts          ?? [],
    recent_wins:     static_?.recent_wins     ?? [],
    next_target:     static_?.next_target     ?? null,
  }

  return NextResponse.json(out, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  })
}
