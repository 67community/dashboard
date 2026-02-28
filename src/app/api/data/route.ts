import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const PAIR    = "DMAFL613XTipuA3jFNYczavWT7XsiYf9cR3qmRMZQhB6"
const TOKEN   = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
const CMC_KEY = process.env.CMC_API_KEY ?? "***REMOVED_CMC_KEY***"
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

// ── GeckoTerminal biggest trades (live, 24h window) ──────────────────────────
const GT_POOL = "DMAFL613XTipuA3jFNYczavWT7XsiYf9cR3qmRMZQhB6"
async function fetchBiggestTradesLive() {
  try {
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/pools/${GT_POOL}/trades?trade_volume_in_usd_greater_than=0`,
      { next: { revalidate: 300 }, headers: { Accept: "application/json" } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const trades: any[] = data?.data ?? []
    const cutoff = Date.now() - 86_400_000
    const in24h = trades
      .map((t: any) => t.attributes)
      .filter((a: any) => new Date(a.block_timestamp).getTime() > cutoff)
    const buys  = in24h.filter((a: any) => a.kind === "buy")
    const sells = in24h.filter((a: any) => a.kind === "sell")
    const best  = (arr: any[]) => arr.length ? arr.reduce((m: any, t: any) => parseFloat(t.volume_in_usd) > parseFloat(m.volume_in_usd) ? t : m) : null
    const bb = best(buys)
    const bs = best(sells)
    return {
      biggest_buy_usd:    bb ? parseFloat(bb.volume_in_usd) : 0,
      biggest_buy_tx:     bb?.tx_hash ?? "",
      biggest_buy_time:   bb?.block_timestamp ?? "",
      biggest_sell_usd:   bs ? parseFloat(bs.volume_in_usd) : 0,
      biggest_sell_tx:    bs?.tx_hash ?? "",
      biggest_sell_time:  bs?.block_timestamp ?? "",
    }
  } catch { return null }
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

// ── News Feed: Google News RSS + CryptoPanic ─────────────────────────────────

// CryptoPanic removed — using free crypto RSS feeds instead

// ── Market Ticker: Yahoo Finance (free, no key) ───────────────────────────────

const MARKET_SYMBOLS = [
  { symbol: "BTC-USD",  name: "Bitcoin",  kind: "crypto", emoji: "₿"  },
  { symbol: "ETH-USD",  name: "Ethereum", kind: "crypto", emoji: "Ξ"  },
  { symbol: "SOL-USD",  name: "Solana",   kind: "crypto", emoji: "◎"  },
  { symbol: "^IXIC",    name: "NASDAQ",   kind: "index",  emoji: "📈" },
  { symbol: "^GSPC",    name: "S&P 500",  kind: "index",  emoji: "🇺🇸" },
  { symbol: "^DJI",     name: "Dow Jones",kind: "index",  emoji: "🏦" },
]

async function fetchMarketData() {
  const results = await Promise.allSettled(
    MARKET_SYMBOLS.map(async ({ symbol, name, kind, emoji }) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
        next: { revalidate: 300 },   // 5 min cache
      })
      if (!res.ok) return null
      const data = await res.json()
      const meta = data?.chart?.result?.[0]?.meta
      if (!meta) return null
      const price   = meta.regularMarketPrice  ?? 0
      const prev    = meta.chartPreviousClose  ?? price
      const change  = price - prev
      const pct     = prev ? (change / prev) * 100 : 0
      return { symbol, name, price, change, change_pct: Math.round(pct * 100) / 100, currency: "USD", kind, emoji }
    })
  )
  return results
    .filter(r => r.status === "fulfilled" && r.value)
    .map(r => (r as PromiseFulfilledResult<typeof MARKET_SYMBOLS[0] & { price: number; change: number; change_pct: number; currency: string }>).value!)
}

function simpleHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}

function timeAgoStr(iso: string): string {
  try {
    const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (d < 60)  return `${d}m ago`
    if (d < 1440) return `${Math.floor(d/60)}h ago`
    return `${Math.floor(d/1440)}d ago`
  } catch { return "" }
}

// Keywords to match in crypto RSS feeds
const NEWS_KEYWORDS = ["67coin", "67 coin", "$67", "maverick 67", "official 67"]

function matchesKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return NEWS_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()))
}

// Free crypto news RSS feeds — no API key needed
const CRYPTO_RSS_FEEDS = [
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml", source: "CoinDesk" },
  { url: "https://cointelegraph.com/rss",                            source: "CoinTelegraph"  },
  { url: "https://decrypt.co/feed",                                  source: "Decrypt"        },
  { url: "https://cryptoslate.com/feed/",                            source: "CryptoSlate"    },
  { url: "https://beincrypto.com/feed/",                             source: "BeInCrypto"     },
  { url: "https://bitcoinist.com/feed/",                             source: "Bitcoinist"     },
  { url: "https://cryptopotato.com/feed/",                           source: "CryptoPotato"   },
  { url: "https://u.today/rss",                                      source: "U.Today"        },
]

function parseRSSItems(xml: string, sourceName: string) {
  const results: { title: string; url: string; source: string; published: string }[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1]
    const titleM = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || block.match(/<title>([\s\S]*?)<\/title>/)
    const linkM  = block.match(/<link>([\s\S]*?)<\/link>/) || block.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)
    const dateM  = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
    const descM  = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || block.match(/<description>([\s\S]*?)<\/description>/)

    const title = (titleM?.[1] ?? "").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').trim()
    const url   = (linkM?.[1] ?? "").trim()
    const rawDate = (dateM?.[1] ?? "").trim()
    const desc  = (descM?.[1] ?? "").replace(/<[^>]+>/g,"").trim()

    if (!title || !url) continue

    // Only include if it mentions 67coin keywords
    if (!matchesKeyword(title) && !matchesKeyword(desc)) continue

    let published = ""
    try { published = new Date(rawDate).toISOString() } catch { published = new Date().toISOString() }

    results.push({ title, url, source: sourceName, published })
  }
  return results
}

async function fetchNewsFeed() {
  const items: {
    id: string; title: string; url: string; source: string;
    published: string; time_ago: string; kind: string
  }[] = []

  // ── Google News RSS (searches directly for 67coin) ─────────────────────────
  const GN_QUERIES = ["67coin", '"67 coin" crypto', '"67 coin" solana', 'maverick "67 coin"', '$67 memecoin']
  try {
    const rssResults = await Promise.allSettled(
      GN_QUERIES.map(q =>
        fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`,
          { next: { revalidate: 10800 } }).then(r => r.ok ? r.text() : "")
      )
    )
    const seenGN = new Set<string>()
    for (const result of rssResults) {
      if (result.status !== "fulfilled" || !result.value) continue
      for (const it of parseRSSItems(result.value, "Google News")) {
        if (seenGN.has(it.url)) continue
        seenGN.add(it.url)
        items.push({ id: simpleHash(it.url), ...it, time_ago: timeAgoStr(it.published), kind: "google" })
      }
    }
  } catch (e) { console.error("[News] Google RSS:", e) }

  // ── Major Crypto RSS feeds — filter for 67coin mentions ───────────────────
  try {
    const feedResults = await Promise.allSettled(
      CRYPTO_RSS_FEEDS.map(f =>
        fetch(f.url, { next: { revalidate: 10800 } })
          .then(r => r.ok ? r.text().then(xml => ({ xml, source: f.source })) : null)
      )
    )
    const seenRSS = new Set<string>()
    for (const result of feedResults) {
      if (result.status !== "fulfilled" || !result.value) continue
      const { xml, source } = result.value as { xml: string; source: string }
      for (const it of parseRSSItems(xml, source)) {
        if (seenRSS.has(it.url)) continue
        seenRSS.add(it.url)
        items.push({ id: simpleHash(it.url), ...it, time_ago: timeAgoStr(it.published), kind: "crypto_rss" })
      }
    }
  } catch (e) { console.error("[News] Crypto RSS:", e) }

  // Sort newest first, deduplicate by id
  items.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
  const seen = new Set<string>()
  return items.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true }).slice(0, 40)
}

// ── YouTube Data API v3 ───────────────────────────────────────────────────────
const YT_API_KEY = process.env.YOUTUBE_API_KEY ?? ""
const YT_BASE    = "https://www.googleapis.com/youtube/v3"

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function parseDuration(iso: string): string {
  // PT4M13S → 4:13
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return ""
  const h = parseInt(m[1] ?? "0"), min = parseInt(m[2] ?? "0"), s = parseInt(m[3] ?? "0")
  if (h > 0) return `${h}:${String(min).padStart(2,"0")}:${String(s).padStart(2,"0")}`
  return `${min}:${String(s).padStart(2,"0")}`
}

async function fetchYouTube() {
  if (!YT_API_KEY) return []
  try {
    // Search popular + recent for each query
    const QUERIES = ['"67 coin" solana memecoin', '"$67" solana token', '"official 67 coin"']

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function ytSearch(q: string, order: "viewCount" | "date", n = 5): Promise<any[]> {
      const url = `${YT_BASE}/search?part=snippet&q=${encodeURIComponent(q)}&type=video&order=${order}&maxResults=${n}&key=${YT_API_KEY}`
      const r = await fetch(url, { next: { revalidate: 3600 } })
      if (!r.ok) return []
      const j = await r.json()
      return j?.items ?? []
    }

    // Fetch popular (by view count) and recent (by date) in parallel
    const [popResults, recResults] = await Promise.all([
      Promise.all(QUERIES.map(q => ytSearch(q, "viewCount", 4))).then(rs => rs.flat()),
      Promise.all(QUERIES.map(q => ytSearch(q, "date", 3))).then(rs => rs.flat()),
    ])

    // Relevance filter — title MUST contain a specific $67coin keyword
    const TITLE_KW = ["67coin", "67 coin", "$67coin", "$67 coin", "official 67", "mav67", "maverick 67"]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function isRelevant(v: any): boolean {
      const title = (v?.snippet?.title ?? "").toLowerCase()
      return TITLE_KW.some(kw => title.includes(kw))
    }

    // Deduplicate by video ID, keep top
    const seenPop = new Set<string>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const popUniq = popResults.filter((v: any) => {
      const id = v?.id?.videoId
      if (!id || seenPop.has(id) || !isRelevant(v)) return false
      seenPop.add(id); return true
    }).slice(0, 4)

    const seenRec = new Set<string>([...seenPop])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recUniq = recResults.filter((v: any) => {
      const id = v?.id?.videoId
      if (!id || seenRec.has(id) || !isRelevant(v)) return false
      seenRec.add(id); return true
    }).slice(0, 4)

    const allItems = [...popUniq.map(v => ({ ...v, _type: "popular" })), ...recUniq.map(v => ({ ...v, _type: "recent" }))]
    if (allItems.length === 0) return []

    // Fetch statistics + duration for all videos in one call
    const ids = allItems.map(v => v?.id?.videoId).filter(Boolean).join(",")
    const statsUrl = `${YT_BASE}/videos?part=statistics,contentDetails&id=${ids}&key=${YT_API_KEY}`
    const statsRes = await fetch(statsUrl, { next: { revalidate: 3600 } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statsMap = new Map<string, any>()
    if (statsRes.ok) {
      const sj = await statsRes.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of (sj?.items ?? [])) statsMap.set(item.id, item)
    }

    // Collect unique channel IDs for subscriber count batch call
    const channelIds = [...new Set(allItems.map((v: { snippet?: { channelId?: string } }) => v?.snippet?.channelId).filter(Boolean))].join(",")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelMap = new Map<string, any>()
    if (channelIds) {
      const chUrl = `${YT_BASE}/channels?part=statistics,snippet&id=${channelIds}&key=${YT_API_KEY}`
      const chRes = await fetch(chUrl, { next: { revalidate: 3600 } })
      if (chRes.ok) {
        const cj = await chRes.json()
        for (const ch of (cj?.items ?? [])) channelMap.set(ch.id, ch)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allItems.map((v: any) => {
      const vid     = v?.id?.videoId ?? ""
      const snip    = v?.snippet ?? {}
      const stats   = statsMap.get(vid)
      const ch      = channelMap.get(snip.channelId ?? "")
      const views   = parseInt(stats?.statistics?.viewCount   ?? "0", 10)
      const likes   = parseInt(stats?.statistics?.likeCount   ?? "0", 10)
      const comments= parseInt(stats?.statistics?.commentCount ?? "0", 10)
      const subs    = parseInt(ch?.statistics?.subscriberCount ?? "0", 10)
      const dur     = parseDuration(stats?.contentDetails?.duration ?? "")
      const engRate = views > 0 ? parseFloat(((likes + comments) / views * 100).toFixed(2)) : 0
      return {
        video_id:            vid,
        video_url:           `https://www.youtube.com/watch?v=${vid}`,
        title:               snip.title ?? "",
        channel:             snip.channelTitle ?? "",
        channel_id:          snip.channelId ?? "",
        channel_url:         `https://www.youtube.com/channel/${snip.channelId ?? ""}`,
        thumbnail_url:       snip.thumbnails?.high?.url ?? snip.thumbnails?.medium?.url ?? "",
        views,
        views_text:          fmtViews(views),
        likes:               likes || undefined,
        comments:            comments || undefined,
        channel_subscribers: subs || undefined,
        channel_subs_text:   subs > 0 ? fmtViews(subs) : undefined,
        engagement_rate:     engRate || undefined,
        published_at:        snip.publishedAt ?? "",
        duration:            dur || undefined,
        video_type:          v._type,
      }
    })
  } catch (e) {
    console.error("YouTube fetch error:", e)
    return []
  }
}

// ── YouTube Analytics API (OAuth2) ────────────────────────────────────────────
const YT_CLIENT_ID     = process.env.YOUTUBE_CLIENT_ID     ?? ""
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET ?? ""
const YT_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN ?? ""
const YT_CHANNEL_ID    = process.env.YOUTUBE_CHANNEL_ID    ?? ""  // e.g. UCxxxxx

async function getYTAccessToken(): Promise<string | null> {
  if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) return null
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     YT_CLIENT_ID,
        client_secret: YT_CLIENT_SECRET,
        refresh_token: YT_REFRESH_TOKEN,
        grant_type:    "refresh_token",
      }),
      cache: "no-store",
    })
    const j = await r.json()
    return j?.access_token ?? null
  } catch { return null }
}

async function fetchYouTubeAnalytics() {
  const accessToken = await getYTAccessToken()
  if (!accessToken || !YT_CHANNEL_ID) {
    return {
      has_data: false,
      channel_id: YT_CHANNEL_ID || "",
      channel_name: "",
      subscribers: 0,
      total_views_30d: 0,
      watch_time_hours_30d: 0,
      avg_view_duration_s: 0,
      subscriber_gains_30d: 0,
      daily_views: [],
      traffic_sources: [],
      top_countries: [],
      error: !YT_CHANNEL_ID ? "YOUTUBE_CHANNEL_ID not set" : "OAuth not configured",
    }
  }

  const authHeaders = { Authorization: `Bearer ${accessToken}` }
  const endDate   = new Date().toISOString().split("T")[0]
  const startDate = new Date(Date.now() - 30 * 86400 * 1000).toISOString().split("T")[0]
  const base      = "https://youtubeanalytics.googleapis.com/v2/reports"
  const dims      = `channelId==${YT_CHANNEL_ID}`

  try {
    const [coreRes, trafficRes, geoRes, channelRes] = await Promise.all([
      // Core metrics: views, watchTime, avgDuration, subscribersGained
      fetch(`${base}?ids=${encodeURIComponent(dims)}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,subscribersGained&dimensions=day&sort=day`, { headers: authHeaders, next: { revalidate: 3600 } }),
      // Traffic sources
      fetch(`${base}?ids=${encodeURIComponent(dims)}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=insightTrafficSourceType&sort=-views&maxResults=6`, { headers: authHeaders, next: { revalidate: 3600 } }),
      // Top countries
      fetch(`${base}?ids=${encodeURIComponent(dims)}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=country&sort=-views&maxResults=8`, { headers: authHeaders, next: { revalidate: 3600 } }),
      // Channel info (subscribers)
      fetch(`${YT_BASE}/channels?part=statistics,snippet&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`, { next: { revalidate: 3600 } }),
    ])

    const [coreJ, trafficJ, geoJ, channelJ] = await Promise.all([
      coreRes.ok ? coreRes.json() : null,
      trafficRes.ok ? trafficRes.json() : null,
      geoRes.ok ? geoRes.json() : null,
      channelRes.ok ? channelRes.json() : null,
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coreRows: any[][] = coreJ?.rows ?? []
    const daily_views = coreRows.map(r => ({ date: r[0], views: r[1] }))
    const total_views_30d      = coreRows.reduce((s, r) => s + (r[1] ?? 0), 0)
    const watch_time_hours_30d = Math.round(coreRows.reduce((s, r) => s + (r[2] ?? 0), 0) / 60)
    const avg_view_duration_s  = Math.round(coreRows.reduce((s, r) => s + (r[3] ?? 0), 0) / (coreRows.length || 1))
    const subscriber_gains_30d = coreRows.reduce((s, r) => s + (r[4] ?? 0), 0)

    // Traffic sources
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trafficRows: any[][] = trafficJ?.rows ?? []
    const trafficTotal = trafficRows.reduce((s, r) => s + (r[1] ?? 0), 0)
    const SOURCE_LABELS: Record<string, string> = {
      YT_SEARCH: "YouTube Search", SUGGESTED: "Suggested Videos",
      BROWSE: "Browse Features", EXTERNAL: "External", PLAYLIST: "Playlist",
      NOTIFICATION: "Notifications", SUBSCRIBER: "Subscriber Feed",
    }
    const traffic_sources = trafficRows.map(r => ({
      source: SOURCE_LABELS[r[0]] ?? r[0],
      views:  r[1] ?? 0,
      pct:    trafficTotal > 0 ? Math.round(r[1] / trafficTotal * 100) : 0,
    }))

    // Top countries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geoRows: any[][] = geoJ?.rows ?? []
    const geoTotal = geoRows.reduce((s, r) => s + (r[1] ?? 0), 0)
    const COUNTRY_FLAGS: Record<string, string> = {
      US:"🇺🇸",GB:"🇬🇧",CA:"🇨🇦",AU:"🇦🇺",TR:"🇹🇷",DE:"🇩🇪",FR:"🇫🇷",BR:"🇧🇷",
      IN:"🇮🇳",NG:"🇳🇬",PH:"🇵🇭",MX:"🇲🇽",AR:"🇦🇷",VN:"🇻🇳",ID:"🇮🇩",KR:"🇰🇷",
    }
    const top_countries = geoRows.map(r => ({
      country: r[0],
      code:    r[0],
      flag:    COUNTRY_FLAGS[r[0]] ?? "🌐",
      views:   r[1] ?? 0,
      pct:     geoTotal > 0 ? Math.round(r[1] / geoTotal * 100) : 0,
    }))

    const chData = channelJ?.items?.[0]
    return {
      has_data:             true,
      channel_id:           YT_CHANNEL_ID,
      channel_name:         chData?.snippet?.title ?? "",
      subscribers:          parseInt(chData?.statistics?.subscriberCount ?? "0", 10),
      total_views_30d,
      watch_time_hours_30d,
      avg_view_duration_s,
      subscriber_gains_30d,
      daily_views,
      traffic_sources,
      top_countries,
    }
  } catch (e) {
    return { has_data: false, channel_id: YT_CHANNEL_ID, channel_name: "", subscribers: 0, total_views_30d: 0, watch_time_hours_30d: 0, avg_view_duration_s: 0, subscriber_gains_30d: 0, daily_views: [], traffic_sources: [], top_countries: [], error: String(e) }
  }
}

// ── Discord — live member & online count ──────────────────────────────────────
const DISCORD_TOKEN  = process.env.DISCORD_TOKEN ?? ""
const DISCORD_GUILD  = "1440077830456082545"
const TG_BOT_TOKEN   = process.env.OFFICIAL67_BOT_TOKEN ?? process.env.TG_RAID_BOT_TOKEN ?? ""
const TG_CHANNEL_ID  = "-1003158749697"
const TG_RAID_BOT    = process.env.TG_RAID_BOT_TOKEN ?? ""
const TG_RAID_GROUP  = "-1003708062172"

async function fetchTelegram(): Promise<number | null> {
  if (!TG_BOT_TOKEN) return null
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TG_BOT_TOKEN}/getChatMemberCount?chat_id=${TG_CHANNEL_ID}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    const j = await res.json()
    return j.ok ? (j.result as number) : null
  } catch {
    return null
  }
}

// ── Raid Feed — fetch latest tweets from Telegram "67 Raider" group ──────────
async function fetchRaidFeed(): Promise<unknown[] | null> {
  if (!TG_RAID_BOT) return null
  try {
    // getUpdates without offset — always returns pending messages (no consumption)
    const res = await fetch(
      `https://api.telegram.org/bot${TG_RAID_BOT}/getUpdates?limit=100`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    const j = await res.json()
    if (!j.ok || !j.result) return null

    // Filter messages from the raid group, parse tweet URLs
    const items: unknown[] = []
    for (const upd of j.result as any[]) {
      const msg = upd.message
      if (!msg) continue
      if (String(msg.chat?.id) !== TG_RAID_GROUP) continue

      const text = msg.text ?? msg.caption ?? ""
      if (!text) continue

      // Extract tweet URL from message (handles x.com/i/status/ and x.com/user/status/)
      const tweetMatch = text.match(/https?:\/\/(twitter|x)\.com\/[^\s]+/i)
      const tweetUrl   = tweetMatch?.[0]?.replace(/[)\].,!?]+$/, "") ?? null

      // Extract @handle
      const handleMatch = text.match(/@(\w+)/)

      items.push({
        id:        String(upd.update_id),
        text:      text.slice(0, 280),
        date:      new Date((msg.date ?? 0) * 1000).toISOString(),
        tweet_url: tweetUrl,
        handle:    handleMatch ? handleMatch[0] : null,
        photo:     msg.photo ? `https://t.me/c/${TG_RAID_GROUP.replace("-100","")}/${msg.message_id}` : null,
      })
    }

    // Sort newest first, deduplicate by tweet_url
    items.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const seen = new Set<string>()
    return items.filter((item: any) => {
      const key = item.tweet_url ?? item.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  } catch {
    return null
  }
}

async function fetchDiscord(): Promise<{ members: number; online: number } | null> {
  if (!DISCORD_TOKEN) return null
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD}?with_counts=true`,
      {
        headers: { Authorization: DISCORD_TOKEN, "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 60 },   // refresh every 60s for accurate online count
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

// ── Discord activity: recent joins + active users today ───────────────────────
const GUILD_ID  = "1440077830456082545"  // 67 Coin Discord
const INTRO_CH  = "1459629395462586398"  // #👋-introductions (for recent_joins)
const NML_CH    = "1470525026347385114"  // #new-members-log  (for new_joins_24h)

// Community channels to skip (internal/mod/log channels)
const SKIP_CH_PATTERNS = [
  "mod", "log", "wick", "admin", "verification", "sticker",
  "join-server", "the-rules", "welcome", "faqs", "announcements",
  "resources", "assets", "calendar", "studio", "top-100",
  "member-tracking", "bot-tests", "operation", "map-admin",
  "team-general", "x-queue", "new-members", "mods", "cmods", "ops-general",
]

function isCommunityChannel(name: string): boolean {
  const n = name.toLowerCase().replace(/^[\p{Emoji}\s]+/u, "")
  if (/^\d+-/.test(n)) return false   // numbered private DM channels
  if (SKIP_CH_PATTERNS.some(p => n.includes(p))) return false
  return true
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60)    return `${secs}s ago`
  if (secs < 3600)  return `${Math.floor(secs/60)}m ago`
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`
  return `${Math.floor(secs/86400)}d ago`
}

interface RecentJoin { user: string; user_id: string; avatar: string; message: string; time_ago: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DiscordMsg = { id: string; author: { id: string; username: string; avatar?: string; bot?: boolean }; content?: string; timestamp: string; embeds?: any[]; mentions?: any[] }

async function fetchDiscordActivity(): Promise<{
  recent_joins: RecentJoin[]
  active_users_today: number
  new_joins_24h: number
  top_channels: { name: string; msgs_1h: number }[]
  voice_channels: { name: string; member_count: number; members: string[] }[]
  scheduled_events: { name: string; start: string; description?: string; user_count?: number }[]
  boost_level: number
  boost_count: number
  mod_events: { type: string; user: string; user_id?: string; avatar?: string; detail: string; time_ago: string }[]
  top_contributors: { user: string; user_id: string; avatar: string; msg_count: number }[]
} | null> {
  if (!DISCORD_TOKEN) return null
  const headers = { Authorization: DISCORD_TOKEN, "User-Agent": "Mozilla/5.0" }

  try {
    // ── 0. Fetch all channels + guild info + scheduled events in parallel ─────
    const [allChannelsRaw, guildInfoRaw, scheduledEventsRaw] = await Promise.all([
      fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`,
        { headers, next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : []),
      fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`,
        { headers, next: { revalidate: 300 } }).then(r => r.ok ? r.json() : null),
      fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events?with_user_count=true`,
        { headers, next: { revalidate: 300 } }).then(r => r.ok ? r.json() : []),
    ])

    // Boost info from guild
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guildInfo = guildInfoRaw as any
    const boost_level: number = guildInfo?.premium_tier ?? 0
    const boost_count: number = guildInfo?.premium_subscription_count ?? 0

    // Scheduled events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scheduled_events = (Array.isArray(scheduledEventsRaw) ? scheduledEventsRaw : []).slice(0, 5).map((ev: any) => ({
      name:        ev.name ?? "Event",
      start:       ev.scheduled_start_time ?? "",
      description: (ev.description ?? "").slice(0, 100),
      user_count:  ev.user_count ?? 0,
    }))

    // Separate text channels, voice channels
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allChannels: { id: string; name: string; type: number; position?: number }[] = Array.isArray(allChannelsRaw) ? allChannelsRaw : []
    const communityChs = allChannels
      .filter(c => c.type === 0 && isCommunityChannel(c.name))
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))

    // Voice channels — fetch voice states per channel (type=2)
    const voiceChs = allChannels.filter(c => c.type === 2)
    const voiceResults = await Promise.allSettled(
      voiceChs.map(vc =>
        fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/voice-states?channel_id=${vc.id}`,
          { headers, next: { revalidate: 30 } }
        ).then(r => r.ok ? r.json().then(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (vs: any[]) => ({ vc, members: Array.isArray(vs) ? vs : [] })
        ) : { vc, members: [] })
      )
    )
    const voice_channels = voiceResults
      .filter(r => r.status === "fulfilled")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(r => (r as any).value)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((v: any) => v.members.length > 0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((v: any) => ({
        name:         v.vc.name,
        member_count: v.members.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        members: v.members.slice(0, 5).map((vs: any) => vs.member?.user?.username ?? vs.user_id ?? "?"),
      }))

    // ── 1. Recent joins from #introductions (24h only) ─────────────────────────
    const introMsgs: DiscordMsg[] = await fetch(
      `https://discord.com/api/v10/channels/${INTRO_CH}/messages?limit=100`,
      { headers, next: { revalidate: 180 } }
    ).then(r => r.ok ? r.json() : [])

    const cutoff24h = Date.now() - 86_400_000   // 24 hours ago
    const seenIntro = new Set<string>()
    const recent_joins: RecentJoin[] = []
    for (const msg of (Array.isArray(introMsgs) ? introMsgs : [])) {
      if (msg?.author?.bot) continue
      // only show introductions from the last 24 hours
      const msgTs = new Date(msg.timestamp).getTime()
      if (msgTs < cutoff24h) continue
      if (seenIntro.has(msg.author.id)) continue
      seenIntro.add(msg.author.id)
      const h = msg.author.avatar
      const avatar = h
        ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${h}.png`
        : `https://cdn.discordapp.com/embed/avatars/${(parseInt(msg.author.id.slice(-2), 16) || 0) % 5}.png`
      recent_joins.push({
        user:     msg.author.username,
        user_id:  msg.author.id,
        avatar,
        message:  (msg.content ?? "").replace(/<[^>]+>/g, "").slice(0, 80),
        time_ago: timeAgo(msg.timestamp),
      })
      if (recent_joins.length >= 8) break
    }

    // ── 2. New joins from #new-members-log (type=7 GUILD_MEMBER_JOIN only) ──────
    let new_joins_24h = 0
    const yesterday = new Date(Date.now() - 86400 * 1000).toISOString()
    try {
      // Fetch up to 200 messages (Discord max per request)
      const nmlMsgs = await fetch(
        `https://discord.com/api/v10/channels/${NML_CH}/messages?limit=100`,
        { headers, next: { revalidate: 60 } }
      ).then(r => r.ok ? r.json() : [])
      const nmlArr = Array.isArray(nmlMsgs) ? nmlMsgs : []

      // If we got a full 100, fetch another 100 older messages to cover full 24h window
      let nmlAll = [...nmlArr]
      if (nmlArr.length === 100) {
        const oldest = nmlArr[nmlArr.length - 1]?.id
        if (oldest) {
          const nmlMsgs2 = await fetch(
            `https://discord.com/api/v10/channels/${NML_CH}/messages?limit=100&before=${oldest}`,
            { headers, next: { revalidate: 60 } }
          ).then(r => r.ok ? r.json() : [])
          nmlAll = [...nmlArr, ...(Array.isArray(nmlMsgs2) ? nmlMsgs2 : [])]
        }
      }

      new_joins_24h = nmlAll
        .filter((m: { timestamp: string; type?: number }) =>
          m.timestamp > yesterday && m.type === 7   // type=7 = GUILD_MEMBER_JOIN only
        ).length
    } catch {}

    // ── 3. All community channels — messages, active users, top channels ──────
    const hour1Ago        = new Date(Date.now() - 3600 * 1000).toISOString()
    const activeSet       = new Set<string>()
    const channelCounts: { name: string; msgs_1h: number; msgs_24h: number }[] = []
    const userMsgMap      = new Map<string, { user: string; avatar: string; count: number }>()

    // Channels to scan for mod events
    const MOD_BOT_ID = "1474483702812643359"
    const MOD_CH_IDS = new Set(["1458846146415034460", "1451275835649560646"])  // #chat + #67coin-chat

    const mod_events: { type: string; user: string; user_id?: string; avatar?: string; detail: string; time_ago: string }[] = []

    // Fetch channels in small batches to avoid Discord rate limits
    // Prioritise highest-traffic channels first
    const PRIORITY_CH = ["chat","67coin-chat","memes","giveaways","off-topic","general","trading","introductions","nfts","gaming"]
    const sortedChs = [...communityChs].sort((a, b) => {
      const ai = PRIORITY_CH.findIndex(p => a.name.toLowerCase().includes(p))
      const bi = PRIORITY_CH.findIndex(p => b.name.toLowerCase().includes(p))
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    }).slice(0, 12)  // max 12 channels to stay within rate limits

    const BATCH_SIZE = 4
    const allChResults: { ch: { id: string; name: string }; msgs: DiscordMsg[] }[] = []
    for (let i = 0; i < sortedChs.length; i += BATCH_SIZE) {
      const batch = sortedChs.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.allSettled(
        batch.map(ch =>
          fetch(
            `https://discord.com/api/v10/channels/${ch.id}/messages?limit=100`,
            { headers, next: { revalidate: 120 } }
          ).then(r => r.ok
            ? r.json().then((msgs: DiscordMsg[]) => ({ ch, msgs }))
            : Promise.resolve({ ch, msgs: [] })
          )
        )
      )
      for (const r of batchResults) {
        if (r.status === "fulfilled") allChResults.push(r.value)
      }
      if (i + BATCH_SIZE < sortedChs.length) await new Promise(res => setTimeout(res, 300))
    }
    const channelResults: PromiseSettledResult<{ ch: { id: string; name: string }; msgs: DiscordMsg[] }>[] =
      allChResults.map(v => ({ status: "fulfilled" as const, value: v }))

    for (const result of channelResults) {
      if (result.status !== "fulfilled") continue
      const { ch, msgs } = (result as PromiseFulfilledResult<{ ch: { id: string; name: string }; msgs: DiscordMsg[] }>).value
      if (!Array.isArray(msgs)) continue

      let msgs1h = 0
      let msgs24h = 0

      for (const msg of msgs) {
        const uid   = msg?.author?.id
        const isBot = msg?.author?.bot ?? false

        // ── Mod events: scan 67Bot messages in mod channels ──────────────────
        if (MOD_CH_IDS.has(ch.id) && uid === MOD_BOT_ID && msg.embeds?.length) {
          const allText = (msg.embeds ?? []).map((e) =>
            `${e.title ?? ""} ${e.description ?? ""} ${(e.fields ?? []).map((f: { value: string }) => f.value).join(" ")}`
          ).join(" ").toLowerCase()

          const targets = msg.mentions ?? []
          if (targets.length > 0) {
            const target = targets[0]
            const tuid   = target.id ?? ""
            const tname  = target.username ?? "user"
            const tav    = target.avatar
              ? `https://cdn.discordapp.com/avatars/${tuid}/${target.avatar}.png`
              : `https://cdn.discordapp.com/embed/avatars/0.png`
            const evType = allText.includes("ban") ? "ban"
              : allText.includes("spam") || allText.includes("scam") ? "spam"
              : allText.includes("kick") ? "kick"
              : "warn"
            const badge  = evType === "ban" ? "Banned" : evType === "spam" ? "Spam" : evType === "kick" ? "Kicked" : "Warned"
            // Only include mod events from last 6h (real-time feed)
            const sixHAgo = new Date(Date.now() - 6 * 3600 * 1000).toISOString()
            if (msg.timestamp > sixHAgo) {
              mod_events.push({ type: evType, user: tname, user_id: tuid, avatar: tav, detail: badge, time_ago: timeAgo(msg.timestamp) })
            }
          }
        }

        if (isBot || !uid) continue

        // Active users + top contributors
        if (msg.timestamp > yesterday) {
          activeSet.add(uid)
          const existing = userMsgMap.get(uid)
          const av = msg.author.avatar
            ? `https://cdn.discordapp.com/avatars/${uid}/${msg.author.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/0.png`
          if (existing) {
            existing.count++
          } else {
            userMsgMap.set(uid, { user: msg.author.username, avatar: av, count: 1 })
          }
          msgs24h++
        }
        if (msg.timestamp > hour1Ago) msgs1h++
      }
      if (msgs24h > 0 || msgs1h > 0) channelCounts.push({ name: ch.name, msgs_1h: msgs1h, msgs_24h: msgs24h })
    }

    const top_channels = channelCounts
      .sort((a, b) => b.msgs_24h - a.msgs_24h)
      .slice(0, 8)

    const top_contributors = [...userMsgMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([uid, v]) => ({ user: v.user, user_id: uid, avatar: v.avatar, msg_count: v.count }))

    return {
      recent_joins,
      active_users_today: activeSet.size,
      new_joins_24h,
      top_channels,
      voice_channels,
      scheduled_events,
      boost_level,
      boost_count,
      mod_events: mod_events.slice(0, 8),
      top_contributors,
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
  const [pair, cg, cgTickers, cmc, holders, discord, tgMembers, discordActivity, youtubeVideos, youtubeAnalytics, newsFeed, marketData, raidFeed, liveTrades] = await Promise.all([
    safe(fetchDex),
    safe(fetchCG),
    safe(fetchCGTickers),
    safe(fetchCMC),
    safe(fetchHolders),
    safe(fetchDiscord),
    safe(fetchTelegram),
    safe(fetchDiscordActivity),
    safe(fetchYouTube),
    safe(fetchYouTubeAnalytics),
    safe(fetchNewsFeed),
    safe(fetchMarketData),
    safe(fetchRaidFeed),
    safe(fetchBiggestTradesLive),
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
    logo:         t.market?.logo ?? undefined,
    volume_delta: 0,  // computed below after static_ is available
  }))

  // Total volume = sum of all exchange volumes
  const total_volume_24h = exchange_volumes.length > 0
    ? exchange_volumes.reduce((s, e) => s + e.volume_usd, 0)
    : (pair?.volume?.h24 ?? 0)

  // Biggest trades — live from GeckoTerminal, fallback to static
  const static_      = readStaticJson()

  // Patch exchange volume deltas now that static_ is available
  const snapExVols: Record<string, number> = {}
  ;(static_?._snapshot_24h?.exchange_volumes ?? []).forEach((e: any) => {
    if (e?.exchange) snapExVols[e.exchange] = e.volume_usd ?? 0
  })
  exchange_volumes.forEach((e: any) => {
    const prev = snapExVols[e.exchange] ?? 0
    e.volume_delta = prev ? Math.round((e.volume_usd - prev) * 100) / 100 : 0
  })
  const static_th    = static_?.token_health ?? {}
  const biggest_trades = liveTrades ?? static_th.biggest_trades ?? {
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
    social_pulse: (() => {
      const sp = static_?.social_pulse ?? { twitter_followers: 0, follower_change_24h: 0, posting_streak_days: 0, engagement_rate: 0, avg_engagement: 0, total_engagement_7d: 0, best_content_type: "tweet", content_type_stats: {} }
      const hist: { date: string; count: number }[] = sp.follower_history ?? []
      const cur = sp.twitter_followers ?? 0
      // snapshot-based 24h delta
      const snap24  = static_?._snapshot_24h?.twitter_followers ?? cur
      const delta1d = cur - snap24
      // history-based 3d / 7d deltas
      const now = new Date()
      const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString().slice(0,10)
      const countAt = (daysBack: number) => {
        const target = daysAgo(daysBack)
        const entry = [...hist].reverse().find(h => h.date <= target)
        return entry?.count ?? cur
      }
      const delta3d = cur - countAt(3)
      const delta7d = cur - countAt(7)
      return { ...sp, follower_change_24h: delta1d, follower_change_3d: delta3d, follower_change_7d: delta7d }
    })(),
    community: {
      ...(static_?.community ?? { discord_members: 0, active_7d: 0, new_joins_24h: 0, open_tickets: 0, unanswered_posts: 0, telegram_members: 0, watchlist_count: 0 }),
      // Live Discord data (overrides static when DISCORD_TOKEN env var is set)
      ...(discord ? {
        discord_members:    discord.members,
        online_now:         discord.online,
        // Delta = snapshot-based (cur members - 24h ago snapshot)
        discord_delta_24h:  discord.members - (static_?._snapshot_24h?.discord_members ?? discord.members),
        new_joins_24h:      discordActivity?.new_joins_24h ?? static_?.community?.new_joins_24h ?? 0,
      } : {}),
      // Live CoinGecko: telegram members + watchlist (no auth needed)
      ...(cg ? {
        watchlist_count:     cg.watchlist_portfolio_users ?? static_?.community?.watchlist_count ?? 0,
        watchlist_delta_24h: (cg.watchlist_portfolio_users ?? 0) - (static_?._snapshot_24h?.watchlist_count ?? cg.watchlist_portfolio_users ?? 0),
      } : {}),
      // Telegram members: prefer Bot API (real-time), fallback CoinGecko — always snapshot-based delta
      ...((() => {
        const tgCur = tgMembers ?? cg?.community_data?.telegram_channel_user_count ?? static_?.community?.telegram_members ?? 0
        const tgSnap = static_?._snapshot_24h?.telegram_members ?? tgCur
        return tgCur ? { telegram_members: tgCur, telegram_delta_24h: tgCur - tgSnap } : {}
      })()),
      // Live Discord activity: real joins feed + active users today + channel stats + enriched data
      ...(discordActivity ? {
        recent_joins:       discordActivity.recent_joins,
        active_users_today: discordActivity.active_users_today,
        top_channels:       discordActivity.top_channels,
        voice_channels:     discordActivity.voice_channels,
        scheduled_events:   discordActivity.scheduled_events,
        boost_level:        discordActivity.boost_level,
        boost_count:        discordActivity.boost_count,
        mod_events:         discordActivity.mod_events,
        top_contributors:   discordActivity.top_contributors,
      } : {
        recent_joins:       static_?.community?.recent_joins        ?? [],
        active_users_today: static_?.community?.active_users_today  ?? 0,
        top_channels:       static_?.community?.top_channels        ?? [],
        voice_channels:     static_?.community?.voice_channels      ?? [],
        scheduled_events:   static_?.community?.scheduled_events    ?? [],
        boost_level:        static_?.community?.boost_level         ?? 0,
        boost_count:        static_?.community?.boost_count         ?? 0,
        mod_events:         static_?.community?.mod_events          ?? [],
        top_contributors:   static_?.community?.top_contributors    ?? [],
      }),
    },
    content_pipeline:  static_?.content_pipeline  ?? [],
    agents:            static_?.agents            ?? [],
    milestones:        static_?.milestones        ?? [],
    alerts:            static_?.alerts            ?? [],
    recent_wins:       static_?.recent_wins       ?? [],
    next_target:       static_?.next_target       ?? null,
    tiktok_spotlight:  static_?.tiktok_spotlight  ?? [],
    youtube_spotlight: youtubeVideos && (youtubeVideos as unknown[]).length > 0
      ? youtubeVideos
      : (static_?.youtube_spotlight ?? []),
    youtube_analytics:   youtubeAnalytics ?? static_?.youtube_analytics ?? null,
    instagram_spotlight: static_?.instagram_spotlight ?? [],
    raid_feed:           (raidFeed as unknown[])?.length ? raidFeed : (static_?.raid_feed ?? []),
    news_feed:           (newsFeed as unknown[])?.length ? newsFeed : (static_?.news_feed ?? []),
    market_data:         (marketData as unknown[])?.length ? marketData : (static_?.market_data ?? []),
  }

  return NextResponse.json(out, { headers: { "Cache-Control": "no-store, max-age=0" } })
}
