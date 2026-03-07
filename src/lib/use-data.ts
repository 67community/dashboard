"use client"

import { useState, useEffect, useCallback } from "react"

// ── Types matching data.json ─────────────────────────────────────────────────

export interface ExchangeVolume {
  volume_delta?: number
  exchange: string
  pair: string
  volume_usd: number
  is_dex: boolean
  logo?: string
}

export interface BiggestTrades {
  biggest_buy_usd: number
  biggest_buy_tx: string
  biggest_buy_wallet?: string
  biggest_buy_time?: string
  biggest_sell_usd: number
  biggest_sell_tx: string
  biggest_sell_wallet?: string
  biggest_sell_time?: string
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
  // 24h snapshot deltas
  volume_change_pct?: number
  volume_change_usd?: number
  mcap_change_pct?: number
  mcap_change_usd?: number
  liquidity_change_pct?: number
  liquidity_change_usd?: number
}

export interface BestTweet {
  screen_name?: string
  name?: string
  avatar?: string
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

export interface Mention {
  tweet_id: string
  tweet_url: string
  text: string
  author: string
  author_handle: string
  likes: number
  replies: number
  date: string
}

export interface SocialPulseData {
  twitter_followers: number
  follower_change_24h: number
  follower_history?: { date: string; count: number }[]
  follower_growth_7d?: number
  posting_streak_days: number
  engagement_rate: number
  best_tweet_week?: BestTweet
  best_tweet_2d?: BestTweet
  avg_engagement: number
  total_engagement_7d: number
  best_content_type: string
  content_type_stats: ContentTypeStats
  x_community_members?: number
  x_community_delta_24h?: number
  mentions?: Mention[]
  community_tweets?: BestTweet[]
  total_views_recent?: number
  total_likes_recent?: number
}

export interface ActivityItem {
  type:     "join" | "active" | "ban" | "kick" | "spam"
  user:     string
  user_id?: string
  avatar?:  string
  time_ago?: string
  reason?:  string
  detail?:  string
  source?:  "discord" | "telegram"
}

export interface RecentJoin {
  user:     string
  user_id:  string
  avatar:   string
  message:  string
  time_ago: string
}

export interface TopChannel {
  name:      string
  msgs_1h:   number
  msgs_24h?: number
}

export interface VoiceChannel {
  name: string
  member_count: number
  members: string[]    // usernames in voice
}

export interface ScheduledEvent {
  name: string
  start: string        // ISO
  description?: string
  user_count?: number  // interested members
}

export interface ModEvent {
  type: string         // "ban" | "kick" | "spam" | "warn"
  user: string
  user_id?: string
  avatar?: string
  detail: string
  time_ago: string
}

export interface TopContributor {
  user: string
  user_id: string
  avatar: string
  msg_count: number
}

export interface CommunityData {
  discord_members: number
  active_7d: number
  new_joins_24h: number
  open_tickets: number
  unanswered_posts: number
  telegram_members: number
  watchlist_count: number
  online_now?: number
  discord_delta_24h?: number
  telegram_delta_24h?: number
  watchlist_delta_24h?: number
  recent_discord_activity?: ActivityItem[]
  // Live Discord activity feed
  recent_joins?: RecentJoin[]
  active_users_today?: number
  top_channels?: TopChannel[]
  // New enriched Discord data (all live from API)
  voice_channels?: VoiceChannel[]
  scheduled_events?: ScheduledEvent[]
  boost_level?: number
  boost_count?: number
  mod_events?: ModEvent[]
  top_contributors?: TopContributor[]
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

export interface YoutubeVideo {
  video_id:            string
  video_url:           string
  title:               string
  channel:             string
  channel_id:          string
  channel_url:         string
  thumbnail_url:       string
  views:               number
  views_text:          string
  likes?:              number
  comments?:           number
  channel_subscribers?: number
  channel_subs_text?:  string
  engagement_rate?:    number   // (likes+comments)/views*100
  published_at:        string
  duration?:           string
  video_type:          string   // "popular" | "recent"
}

export interface YTDailyViews {
  date:  string  // YYYY-MM-DD
  views: number
}

export interface YTTrafficSource {
  source: string
  views:  number
  pct:    number
}

export interface YTCountry {
  country:  string
  code:     string
  views:    number
  pct:      number
}

export interface YoutubeAnalytics {
  channel_id:           string
  channel_name:         string
  subscribers:          number
  total_views_30d:      number
  watch_time_hours_30d: number
  avg_view_duration_s:  number
  subscriber_gains_30d: number
  daily_views:          YTDailyViews[]
  traffic_sources:      YTTrafficSource[]
  top_countries:        YTCountry[]
  has_data:             boolean
  error?:               string
}

export interface TikTokVideo {
  video_url:     string
  thumbnail_url: string
  creator:       string
  creator_url:   string
  description:   string
  views_text:    string
  scraped_at:    string
  hashtag?:      string       // "67coin" | "67"
  plays?:        number
  likes?:        number
  video_type?:   string       // "popular" | "recent"
  created_at?:   string       // ISO timestamp of TikTok post
}

export interface InstagramPost {
  post_url:      string
  thumbnail_url: string
  creator:       string
  creator_url:   string
  caption:       string
  likes:         number
  comments:      number
  views?:        number          // video/reel only
  views_text?:   string
  likes_text:    string
  is_video:      boolean
  hashtag?:      string          // "67coin" | "67"
  post_type?:    string          // "popular" | "recent"
  created_at?:   string          // ISO timestamp
  scraped_at:    string
}

export interface MarketItem {
  symbol:    string   // "BTC-USD", "^IXIC" etc.
  name:      string   // "Bitcoin", "NASDAQ"
  price:     number
  change:    number   // absolute change
  change_pct: number  // % change
  currency:  string   // "USD"
  kind:      string   // "crypto" | "index"
  emoji:     string
}

export interface NewsItem {
  id:         string      // unique hash
  title:      string
  url:        string
  source:     string
  published:  string      // ISO date
  time_ago?:  string
  sentiment?: string      // "positive" | "negative" | "neutral" (CryptoPanic)
  kind?:      string      // "google" | "cryptopanic"
  image?:     string
}

export interface RaidFeedItem {
  message_id: number
  text:       string
  tweet_url:  string
  photo?:     string
  date:       string
  chat_id?:   number
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
  tiktok_spotlight?:    TikTokVideo[]
  youtube_spotlight?:   YoutubeVideo[]
  youtube_analytics?:   YoutubeAnalytics
  instagram_spotlight?: InstagramPost[]
  raid_feed?:           RaidFeedItem[]
  x_recent?:            any[]
  x_popular?:           any[]
  news_feed?:           NewsItem[]
  market_data?:         MarketItem[]
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
