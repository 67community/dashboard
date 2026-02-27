"use client"

import { Newspaper, TrendingUp, TrendingDown, Users, Zap, Target } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import { useMemo } from "react"

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K"
  return n.toLocaleString()
}

function sign(n: number) { return n >= 0 ? "+" : "" }

function today() {
  return new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })
}

// ── Stat row ──────────────────────────────────────────────────────────────────

function Row({ label, value, delta, deltaLabel, color }: {
  label: string; value: string; delta?: number; deltaLabel?: string; color?: string
}) {
  const up = (delta ?? 0) >= 0
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"7px 0", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
      <span style={{ fontSize:"0.8125rem", color:"#6B7280", fontWeight:500 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:"0.875rem", fontWeight:700, color: color ?? "#1D1D1F",
          fontVariantNumeric:"tabular-nums" }}>{value}</span>
        {delta !== undefined && (
          <span style={{ fontSize:"0.6875rem", fontWeight:700,
            color: up ? "#059669" : "#EF4444",
            background: up ? "rgba(5,150,105,0.08)" : "rgba(239,68,68,0.08)",
            padding:"1px 7px", borderRadius:99 }}>
            {sign(delta)}{deltaLabel ?? delta.toFixed(1) + "%"}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function DailyBriefingCard() {
  const { data, livePrice, liveChange24h } = useAppData()

  const th   = data?.token_health
  const com  = data?.community
  const sp   = data?.social_pulse
  const news = data?.news_feed ?? []
  const feed = (data?.raid_feed ?? []) as { date: string }[]

  const price   = livePrice   ?? th?.price ?? 0
  const ch24    = liveChange24h ?? th?.price_change_24h ?? 0
  const mcap    = th?.market_cap ?? 0
  const holders = th?.holders ?? 0
  const liq     = th?.liquidity ?? 0
  const vol     = th?.volume_24h ?? 0

  const discordMembers  = com?.discord_members  ?? 0
  const discordDelta    = com?.discord_delta_24h ?? 0
  const discordOnline   = com?.online_now        ?? 0
  const telegramMembers = com?.telegram_members  ?? 0
  const newJoins        = com?.new_joins_24h     ?? 0

  const twitterFollowers = sp?.twitter_followers  ?? 0
  const followerDelta    = sp?.follower_change_24h ?? 0

  // Raids in last 24h
  const raids24h = useMemo(() =>
    feed.filter(r => {
      try { return Date.now() - new Date(r.date).getTime() < 86_400_000 } catch { return false }
    }).length, [feed])

  // Latest news headline
  const latestNews = news[0]

  // Whale activity
  const whaleBuy  = th?.biggest_trades?.biggest_buy_usd  ?? 0
  const whaleSell = th?.biggest_trades?.biggest_sell_usd ?? 0

  const priceUp = ch24 >= 0

  // ── Collapsed — key numbers at a glance ───────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {/* Date */}
      <p style={{ fontSize:"0.6875rem", fontWeight:600, color:"#A1A1AA", marginBottom:12 }}>
        {today()}
      </p>

      {/* Price block */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14,
        padding:"10px 12px", borderRadius:12,
        background: priceUp ? "rgba(5,150,105,0.06)" : "rgba(239,68,68,0.06)",
        border: `1.5px solid ${priceUp ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.15)"}` }}>
        {priceUp
          ? <TrendingUp style={{ width:18, height:18, color:"#059669", flexShrink:0 }} />
          : <TrendingDown style={{ width:18, height:18, color:"#EF4444", flexShrink:0 }} />}
        <div>
          <p style={{ fontSize:"0.6875rem", color:"#8E8E93", fontWeight:600 }}>$67 Price</p>
          <p style={{ fontSize:"1rem", fontWeight:800, color: priceUp ? "#059669" : "#EF4444",
            fontVariantNumeric:"tabular-nums" }}>
            ${price.toFixed(6)}
            <span style={{ fontSize:"0.75rem", marginLeft:8 }}>
              {sign(ch24)}{ch24.toFixed(2)}%
            </span>
          </p>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <p style={{ fontSize:"0.625rem", color:"#A1A1AA" }}>MCap</p>
          <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"#1D1D1F" }}>${fmt(mcap)}</p>
        </div>
      </div>

      {/* Quick stats */}
      <Row label="Holders"     value={fmt(holders)}     delta={undefined} />
      <Row label="Volume 24h"  value={`$${fmt(vol)}`}   delta={th?.volume_change_pct}  />
      <Row label="Liquidity"   value={`$${fmt(liq)}`}   delta={th?.liquidity_change_pct} />
      <Row label="Discord"     value={`${fmt(discordMembers)} members`}
           delta={newJoins > 0 ? newJoins : undefined}
           deltaLabel={newJoins > 0 ? `+${newJoins} today` : undefined} />
      {raids24h > 0 && (
        <Row label="Raids (24h)" value={`${raids24h} tweets`} />
      )}

      {/* Latest news */}
      {latestNews && (
        <div style={{ marginTop:10, padding:"8px 10px", background:"rgba(37,99,235,0.04)",
          borderRadius:8, borderLeft:"3px solid #2563EB" }}>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#2563EB",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Latest News</p>
          <p style={{ fontSize:"0.75rem", color:"#374151", lineHeight:1.4 }}>{latestNews.title}</p>
        </div>
      )}
    </div>
  )

  // ── Expanded — full breakdown ─────────────────────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F" }}>{today()}</p>

      {/* Token */}
      <div>
        <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
          textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>
          📈 Token Health
        </p>
        <Row label="Price"      value={`$${price.toFixed(8)}`}  delta={ch24} />
        <Row label="Market Cap" value={`$${fmt(mcap)}`}          delta={th?.mcap_change_pct} />
        <Row label="Volume 24h" value={`$${fmt(vol)}`}           delta={th?.volume_change_pct} />
        <Row label="Liquidity"  value={`$${fmt(liq)}`}           delta={th?.liquidity_change_pct} />
        <Row label="Holders"    value={fmt(holders)}             delta={th?.holder_trend} deltaLabel={`${sign(th?.holder_trend ?? 0)}${th?.holder_trend ?? 0} today`} />
      </div>

      {/* Whale */}
      {(whaleBuy >= 1000 || whaleSell >= 1000) && (
        <div>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>
            🐋 Whale Activity
          </p>
          {whaleBuy >= 1000  && <Row label="Biggest Buy"  value={`$${fmt(whaleBuy)}`}  color="#059669" />}
          {whaleSell >= 1000 && <Row label="Biggest Sell" value={`$${fmt(whaleSell)}`} color="#EF4444" />}
        </div>
      )}

      {/* Community */}
      <div>
        <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
          textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>
          👥 Community
        </p>
        <Row label="Discord Members" value={fmt(discordMembers)}
             delta={discordDelta} deltaLabel={`${sign(discordDelta)}${discordDelta} today`} />
        <Row label="Online Now"      value={`${discordOnline} online`} />
        <Row label="New Joins 24h"   value={`+${newJoins}`} color="#059669" />
        {telegramMembers > 0 && <Row label="Telegram" value={fmt(telegramMembers)} />}
      </div>

      {/* Social */}
      {twitterFollowers > 0 && (
        <div>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>
            📣 Social
          </p>
          <Row label="X Followers" value={fmt(twitterFollowers)}
               delta={followerDelta} deltaLabel={`${sign(followerDelta)}${followerDelta} today`} />
          {raids24h > 0 && <Row label="Raid Tweets (24h)" value={String(raids24h)} color="#F5A623" />}
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>
            📰 Latest News
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {news.slice(0, 3).map((n: any, i: number) => (
              <div key={i} style={{ padding:"8px 10px", background:"rgba(0,0,0,0.03)",
                borderRadius:8, display:"flex", flexDirection:"column", gap:2 }}>
                <p style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F",
                  lineHeight:1.35 }}>{n.title}</p>
                <p style={{ fontSize:"0.6875rem", color:"#A1A1AA" }}>{n.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Daily Briefing"
      subtitle="Live · Real Data · No AI"
      icon={<Newspaper style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
