"use client"

import { useState, useEffect, useCallback } from "react"

// ── Types matching data.json ─────────────────────────────────────────────────

export interface ExchangeVolume {
  exchange: string
  pair: string
  volume_usd: number
  is_dex: boolean
  logo?: string
}

export interface BiggestTrades {
  biggest_buy_usd: number
  biggest_buy_tx: string
  biggest_sell_usd: number
  biggest_sell_tx: string
}

export interface TokenHealthData {
  price: number
  price_change_24h: number
  price_change_1h: number
  price_change_7d: number
  market_cap: number
  liquidity: number
  volume_24h: number
  volume_1h: number
  buys_24h: number
  sells_24h: number
  holders: number
  holder_trend: number
  coingecko_rank: number
  cmc_rank: number
  ath: number
  ath_date: string
  ath_change_pct: number
  exchange_volumes: ExchangeVolume[]
  total_volume_24h: number
  biggest_trades: BiggestTrades
}

export interface BestTweet {
  tweet_id: string
  tweet_url: string
  text: string
  likes: number
  replies: number
  img_url?: string
  date: string
  embed_html?: string
}

export interface ContentTypeStats {
  [key: string]: { count: number; total_eng: number; avg_eng: number }
}

export interface SocialPulseData {
  twitter_followers: number
  follower_change_24h: number
  posting_streak_days: number
  engagement_rate: number
  best_tweet_week?: BestTweet
  best_tweet_2d?: BestTweet
  avg_engagement: number
  total_engagement_7d: number
  best_content_type: string
  content_type_stats: ContentTypeStats
}

export interface CommunityData {
  discord_members: number
  active_7d: number
  new_joins_24h: number
  open_tickets: number
  unanswered_posts: number
  telegram_members: number
  watchlist_count: number
}

export interface AgentData {
  name: string
  status: "green" | "red"
  last_run: string
  errors_24h: number
  schedule: string
}

export interface MilestoneData {
  label: string
  current: number
  target: number
}

export interface AlertData {
  type: "danger" | "warning" | "info"
  message: string
  timestamp: string
}

export interface RecentWin {
  label: string
  date: string
}

export interface DashboardData {
  last_updated: string
  token_health: TokenHealthData
  social_pulse: SocialPulseData
  community: CommunityData
  agents: AgentData[]
  milestones: MilestoneData[]
  alerts: AlertData[]
  recent_wins: RecentWin[]
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useData(refreshIntervalMs = 120_000) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      // Try API route first (reads live file on Mac mini dev)
      // Falls back to /data.json (Vercel static public/ file)
      let res = await fetch("/api/data", { cache: "no-store" })
      if (!res.ok) {
        res = await fetch("/data.json", { cache: "no-store" })
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: DashboardData = await res.json()
      setData(json)
      setLastFetched(new Date())
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    const interval = setInterval(fetch_, refreshIntervalMs)
    return () => clearInterval(interval)
  }, [fetch_, refreshIntervalMs])

  return { data, loading, error, lastFetched, refresh: fetch_ }
}

// ── Live DexScreener hook (2 min polling) ────────────────────────────────────

const PAIR = "DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6"

export function useLivePrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [change24h, setChange24h] = useState<number | null>(null)
  const [mcap, setMcap] = useState<number | null>(null)

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${PAIR}`)
      const json = await res.json()
      const pair = json?.pair
      if (pair) {
        setPrice(parseFloat(pair.priceUsd))
        setChange24h(pair.priceChange?.h24 ?? null)
        setMcap(pair.marketCap ?? null)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, 120_000)
    return () => clearInterval(interval)
  }, [fetchPrice])

  return { price, change24h, mcap }
}
