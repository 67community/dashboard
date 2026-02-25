import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const PAIR    = "DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6"
const TOKEN   = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
const CMC_KEY = process.env.CMC_API_KEY ?? "09873ed23c74499eb07885cb070f64e6"
const CG_ID   = "the-official-67-coin"

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

// ── DexScreener recent txns (biggest trade) ───────────────────────────────────
async function fetchBiggestTrades() {
  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${TOKEN}`,
    { next: { revalidate: 120 } }
  )
  if (!res.ok) return null
  const j = await res.json()
  return j?.pairs ?? null
}

// ── CoinGecko coin data ────────────────────────────────────────────────────────
async function fetchCG() {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${CG_ID}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false`,
    { next: { revalidate: 300 } }
  )
  return res.ok ? await res.json() : null
}

// ── CoinGecko tickers (exchange volumes) ──────────────────────────────────────
async function fetchCGTickers() {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${CG_ID}/tickers?include_exchange_logo=true&page=1&depth=false&order=volume_desc`,
    { next: { revalidate: 300 } }
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

// ── Holders — Solana RPC ──────────────────────────────────────────────────────
async function fetchHolders(): Promise<number> {
  const body = {
    jsonrpc: "2.0", id: 1,
    method: "getProgramAccounts",
    params: [
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      {
        encoding: "base64",
        dataSlice: { offset: 64, length: 8 },
        filters: [{ dataSize: 165 }, { memcmp: { offset: 0, bytes: TOKEN } }],
      },
    ],
  }
  const res = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 600 },
  })
  if (!res.ok) return 0
  const j = await res.json()
  const accounts: { account: { data: string[] } }[] = j?.result ?? []
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

// ── Discord — live member & online count ──────────────────────────────────────
const DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? ""
const DISCORD_GUILD = "1440077830456082545"

async function fetchDiscord(): Promise<{ members: number; online: number } | null> {
  if (!DISCORD_TOKEN) return null
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD}?with_counts=true`,
      {
        headers: { Authorization: DISCORD_TOKEN, "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 300 }, // cache 5 min
      }
    )
    if (!res.ok) return null
    const g = await res.json()
    return {
      members: g.approximate_member_count ?? 0,
      online:  g.approximate_presence_count ?? 0,
    }
  } catch {
    return null
  }
}

// ── static fallback ───────────────────────────────────────────────────────────
function readStaticJson() {
  const LOCAL   = "/Users/oscarbrendon/.openclaw/workspace/mission-control/data.json"
  const BUNDLED = path.join(process.cwd(), "public", "data.json")
  for (const p of [LOCAL, BUNDLED]) {
    try { if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8")) } catch {}
  }
  return null
}

// ── main ──────────────────────────────────────────────────────────────────────
export async function GET() {
  const [pair, cg, cgTickers, cmc, holders, discord] = await Promise.all([
    safe(fetchDex),
    safe(fetchCG),
    safe(fetchCGTickers),
    safe(fetchCMC),
    safe(fetchHolders),
    safe(fetchDiscord),
  ])

  if (!pair && !cg) {
    const static_ = readStaticJson()
    if (static_) return NextResponse.json(static_, { headers: { "Cache-Control": "no-store" } })
    return NextResponse.json({ error: "no data" }, { status: 500 })
  }

  // CMC
  const cmcCoin = cmc?.data?.["38918"]
  const cmcUSD  = cmcCoin?.quote?.USD
  const cmcRank = cmcCoin?.cmc_rank ?? 0

  // Exchange volumes from CoinGecko tickers
  const rawTickers: Record<string, unknown>[] = cgTickers?.tickers ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exchange_volumes = rawTickers.slice(0, 12).map((t: any) => ({
    exchange:   t.market?.name ?? "Unknown",
    pair:       `${t.base ?? "67"}/${t.target ?? "USDT"}`,
    volume_usd: t.converted_volume?.usd ?? 0,
    is_dex:     (t.market?.identifier ?? "").toLowerCase().includes("swap") ||
                (t.market?.identifier ?? "").toLowerCase().includes("dex") ||
                (t.market?.identifier ?? "").toLowerCase().includes("pumpswap") ||
                (t.market?.identifier ?? "").toLowerCase().includes("raydium") ||
                (t.market?.identifier ?? "").toLowerCase().includes("orca") ||
                (t.market?.identifier ?? "").toLowerCase().includes("meteora"),
    logo:       t.market?.logo ?? undefined,
  }))

  // Total volume = sum of all exchange volumes
  const total_volume_24h = exchange_volumes.length > 0
    ? exchange_volumes.reduce((s, e) => s + e.volume_usd, 0)
    : (pair?.volume?.h24 ?? 0)

  // Biggest trades from static fallback (DexScreener doesn't expose individual txns)
  const static_      = readStaticJson()
  const static_th    = static_?.token_health ?? {}
  const biggest_trades = static_th.biggest_trades ?? {
    biggest_buy_usd: 0, biggest_buy_tx: "",
    biggest_sell_usd: 0, biggest_sell_tx: "",
  }

  const token_health = {
    price:             parseFloat(pair?.priceUsd ?? "0"),
    price_change_24h:  pair?.priceChange?.h24 ?? 0,
    price_change_1h:   pair?.priceChange?.h1  ?? 0,
    price_change_6h:   pair?.priceChange?.h6  ?? 0,
    price_change_7d:   cg?.market_data?.price_change_percentage_7d ?? 0,
    market_cap:        pair?.marketCap ?? cg?.market_data?.market_cap?.usd ?? 0,
    liquidity:         pair?.liquidity?.usd ?? 0,
    volume_24h:        pair?.volume?.h24 ?? 0,
    volume_1h:         pair?.volume?.h1  ?? 0,
    buys_24h:          pair?.txns?.h24?.buys  ?? 0,
    sells_24h:         pair?.txns?.h24?.sells ?? 0,
    buys_1h:           pair?.txns?.h1?.buys   ?? 0,
    sells_1h:          pair?.txns?.h1?.sells  ?? 0,
    holders:           holders ?? 0,
    holder_trend:      static_th.holder_trend ?? 0,
    coingecko_rank:    cg?.market_cap_rank ?? 0,
    cmc_rank:          cmcRank,
    ath:               cg?.market_data?.ath?.usd ?? 0.04363,
    ath_date:          cg?.market_data?.ath_date?.usd ?? "2025-11-19",
    ath_change_pct:    cg?.market_data?.ath_change_percentage?.usd ?? 0,
    total_volume_24h,
    exchange_volumes,
    biggest_trades,
    sentiment:         "Neutral",
    // 24h snapshot deltas from static file
    volume_change_pct:    static_th.volume_change_pct    ?? null,
    mcap_change_pct:      static_th.mcap_change_pct      ?? null,
    liquidity_change_pct: static_th.liquidity_change_pct ?? null,
  }

  const out = {
    last_updated:     new Date().toISOString(),
    token_health,
    social_pulse:     static_?.social_pulse     ?? { twitter_followers: 0, follower_change_24h: 0, posting_streak_days: 0, engagement_rate: 0, avg_engagement: 0, total_engagement_7d: 0, best_content_type: "tweet", content_type_stats: {} },
    community: {
      ...(static_?.community ?? { discord_members: 0, active_7d: 0, new_joins_24h: 0, open_tickets: 0, unanswered_posts: 0, telegram_members: 0, watchlist_count: 0 }),
      // Live Discord data (overrides static when DISCORD_TOKEN env var is set)
      ...(discord ? { discord_members: discord.members, online_now: discord.online } : {}),
      // Live CoinGecko: telegram members + watchlist (no auth needed)
      ...(cg ? {
        telegram_members: cg.community_data?.telegram_channel_user_count ?? static_?.community?.telegram_members ?? 0,
        watchlist_count:  cg.watchlist_portfolio_users ?? static_?.community?.watchlist_count ?? 0,
      } : {}),
    },
    content_pipeline: static_?.content_pipeline ?? [],
    agents:           static_?.agents           ?? [],
    milestones:       static_?.milestones       ?? [],
    alerts:           static_?.alerts           ?? [],
    recent_wins:      static_?.recent_wins      ?? [],
    next_target:      static_?.next_target      ?? null,
  }

  return NextResponse.json(out, { headers: { "Cache-Control": "no-store, max-age=0" } })
}
