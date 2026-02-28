"use client"

import { Newspaper, TrendingUp, TrendingDown, ExternalLink, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import { useMemo } from "react"

function fmtUSD(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(1) + "K"
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 })
}
function fmtExact(n: number) { return n.toLocaleString("en-US") }
function sign(n: number) { return n > 0 ? "+" : "" }
function today() {
  return new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })
}
function shortAddr(addr: string) {
  if (!addr) return ""
  return addr.slice(0, 6) + "…" + addr.slice(-4)
}
function timeAgo(iso: string) {
  if (!iso) return ""
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

function Delta({ value, label }: { value: number; label?: string }) {
  const isUp   = value > 0
  const isZero = value === 0
  const color  = isZero ? "#8E8E93" : isUp ? "#059669" : "#EF4444"
  const bg     = isZero ? "rgba(142,142,147,0.1)" : isUp ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)"
  const Icon   = isZero ? Minus : isUp ? ArrowUpRight : ArrowDownRight
  const text   = label ?? (sign(value) + fmtExact(Math.abs(value)))
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:2,
      fontSize:"0.625rem", fontWeight:700, color, background:bg,
      padding:"2px 7px", borderRadius:99 }}>
      <Icon style={{ width:9, height:9 }} />
      {text}
    </span>
  )
}

/** Token Health-style stat cell */
function StatCell({ label, value, delta, deltaLabel, color, wide }: {
  label: string; value: string
  delta?: number; deltaLabel?: string
  color?: string; wide?: boolean
}) {
  return (
    <div style={{
      background:"rgba(0,0,0,0.03)", borderRadius:12, padding:"12px 14px",
      gridColumn: wide ? "1 / -1" : undefined,
      display:"flex", flexDirection:"column", gap:4,
      border:"1px solid rgba(0,0,0,0.05)"
    }}>
      <span style={{ fontSize:"0.6875rem", color:"#9CA3AF", fontWeight:500 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:6 }}>
        <span style={{ fontSize:"1.125rem", fontWeight:800, color: color ?? "#1D1D1F",
          fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em", lineHeight:1.1 }}>
          {value}
        </span>
        {delta !== undefined && <Delta value={delta} label={deltaLabel} />}
      </div>
    </div>
  )
}

/** Section divider header */
function SectionHead({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
      <span style={{ fontSize:"0.8125rem" }}>{emoji}</span>
      <span style={{ fontSize:"0.6875rem", fontWeight:800, color:"#6B7280",
        textTransform:"uppercase", letterSpacing:"0.09em" }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.07)" }} />
    </div>
  )
}

/** Whale card */
function WhaleCard({ label, usd, tx, wallet, time, isUp }: {
  label: string; usd: number; tx: string; wallet: string; time: string; isUp: boolean
}) {
  const color = isUp ? "#059669" : "#EF4444"
  return (
    <div style={{
      background: isUp ? "rgba(5,150,105,0.04)" : "rgba(239,68,68,0.04)",
      border: `1px solid ${isUp ? "rgba(5,150,105,0.12)" : "rgba(239,68,68,0.12)"}`,
      borderRadius:12, padding:"12px 14px"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:"0.6875rem", color:"#9CA3AF", fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:"1.125rem", fontWeight:800, color,
          fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em" }}>{fmtUSD(usd)}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
        {wallet && (
          <a href={`https://solscan.io/account/${wallet}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:"0.6875rem", color:"#6B7280", fontFamily:"monospace",
              textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}>
            💳 {shortAddr(wallet)}<ExternalLink style={{ width:9, height:9, opacity:0.4 }} />
          </a>
        )}
        <div style={{ flex:1 }} />
        {tx && (
          <a href={`https://solscan.io/tx/${tx}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:"0.6875rem", color:"#2563EB", fontWeight:600,
              textDecoration:"none", display:"flex", alignItems:"center", gap:2 }}>
            View TX <ExternalLink style={{ width:9, height:9 }} />
          </a>
        )}
        <span style={{ fontSize:"0.6875rem", color:"#A1A1AA" }}>{timeAgo(time)}</span>
      </div>
    </div>
  )
}

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
  const telegramDelta   = com?.telegram_delta_24h ?? 0

  const twitterFollowers = sp?.twitter_followers   ?? 0
  const followerDelta    = sp?.follower_change_24h  ?? 0

  const whaleBuy        = th?.biggest_trades?.biggest_buy_usd    ?? 0
  const whaleBuyTx      = th?.biggest_trades?.biggest_buy_tx     ?? ""
  const whaleBuyWallet  = th?.biggest_trades?.biggest_buy_wallet ?? ""
  const whaleBuyTime    = th?.biggest_trades?.biggest_buy_time   ?? ""
  const whaleSell       = th?.biggest_trades?.biggest_sell_usd   ?? 0
  const whaleSellTx     = th?.biggest_trades?.biggest_sell_tx    ?? ""
  const whaleSellWallet = th?.biggest_trades?.biggest_sell_wallet ?? ""
  const whaleSellTime   = th?.biggest_trades?.biggest_sell_time  ?? ""

  const raids24h = useMemo(() =>
    feed.filter(r => {
      try { return Date.now() - new Date(r.date).getTime() < 86_400_000 } catch { return false }
    }).length, [feed])

  const priceUp = ch24 >= 0

  // ── Collapsed ─────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <p style={{ fontSize:"0.6875rem", fontWeight:600, color:"#A1A1AA", marginBottom:12 }}>
        {today()}
      </p>
      {/* Price block */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14,
        padding:"12px 14px", borderRadius:14,
        background: priceUp ? "rgba(5,150,105,0.06)" : "rgba(239,68,68,0.06)",
        border: `1.5px solid ${priceUp ? "rgba(5,150,105,0.18)" : "rgba(239,68,68,0.18)"}` }}>
        {priceUp
          ? <TrendingUp  style={{ width:20, height:20, color:"#059669", flexShrink:0 }} />
          : <TrendingDown style={{ width:20, height:20, color:"#EF4444", flexShrink:0 }} />}
        <div>
          <p style={{ fontSize:"0.6875rem", color:"#8E8E93", fontWeight:600 }}>$67 Price</p>
          <p style={{ fontSize:"1.0625rem", fontWeight:800, color: priceUp ? "#059669" : "#EF4444",
            fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em" }}>
            ${price.toFixed(6)}
            <span style={{ fontSize:"0.75rem", marginLeft:8, opacity:0.85 }}>
              {sign(ch24)}{ch24.toFixed(2)}%
            </span>
          </p>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <p style={{ fontSize:"0.625rem", color:"#A1A1AA", fontWeight:600 }}>MCap</p>
          <p style={{ fontSize:"0.875rem", fontWeight:800, color:"#1D1D1F" }}>{fmtUSD(mcap)}</p>
          <p style={{ fontSize:"0.625rem", color:"#A1A1AA", marginTop:2 }}>Vol {fmtUSD(vol)}</p>
        </div>
      </div>
      {/* Quick stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <StatCell label="Holders"    value={fmtExact(holders)} delta={th?.holder_trend}
          deltaLabel={th?.holder_trend !== undefined ? `${sign(th.holder_trend)}${fmtExact(Math.abs(th.holder_trend ?? 0))} today` : undefined} />
        <StatCell label="Liquidity"  value={fmtUSD(liq)} delta={th?.liquidity_change_pct}
          deltaLabel={th?.liquidity_change_pct !== undefined ? `${sign(th.liquidity_change_pct)}${th.liquidity_change_pct?.toFixed(1)}%` : undefined} />
        <StatCell label="Discord"    value={fmtExact(discordMembers)} delta={discordDelta}
          deltaLabel={`${sign(discordDelta)}${fmtExact(Math.abs(discordDelta))} today`} />
        <StatCell label="X Followers" value={fmtExact(twitterFollowers)} delta={followerDelta}
          deltaLabel={`${sign(followerDelta)}${fmtExact(Math.abs(followerDelta))} today`} />
      </div>
      {news[0] && (
        <div style={{ marginTop:12, padding:"9px 11px", background:"rgba(37,99,235,0.05)",
          borderRadius:10, borderLeft:"3px solid #2563EB" }}>
          <p style={{ fontSize:"0.625rem", fontWeight:800, color:"#2563EB",
            textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Latest News</p>
          <p style={{ fontSize:"0.75rem", color:"#374151", lineHeight:1.45 }}>{news[0].title}</p>
        </div>
      )}
    </div>
  )

  // ── Expanded ──────────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <p style={{ fontSize:"0.9375rem", fontWeight:800, color:"#1D1D1F", letterSpacing:"-0.02em" }}>
        {today()}
      </p>

      {/* Price hero block */}
      <div style={{ display:"flex", alignItems:"center", gap:12,
        padding:"14px 16px", borderRadius:14,
        background: priceUp ? "rgba(5,150,105,0.06)" : "rgba(239,68,68,0.06)",
        border: `1.5px solid ${priceUp ? "rgba(5,150,105,0.18)" : "rgba(239,68,68,0.18)"}` }}>
        {priceUp
          ? <TrendingUp  style={{ width:22, height:22, color:"#059669", flexShrink:0 }} />
          : <TrendingDown style={{ width:22, height:22, color:"#EF4444", flexShrink:0 }} />}
        <div>
          <p style={{ fontSize:"0.6875rem", color:"#8E8E93", fontWeight:600 }}>$67 Price</p>
          <p style={{ fontSize:"1.125rem", fontWeight:800, color: priceUp ? "#059669" : "#EF4444",
            fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em" }}>
            ${price.toFixed(6)}
            <span style={{ fontSize:"0.8125rem", marginLeft:8, opacity:0.85 }}>
              {sign(ch24)}{ch24.toFixed(2)}%
            </span>
          </p>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <p style={{ fontSize:"0.625rem", color:"#A1A1AA", fontWeight:600 }}>MCap</p>
          <p style={{ fontSize:"0.9375rem", fontWeight:800, color:"#1D1D1F" }}>{fmtUSD(mcap)}</p>
          <p style={{ fontSize:"0.625rem", color:"#A1A1AA", marginTop:2 }}>Vol {fmtUSD(vol)}</p>
        </div>
      </div>

      {/* TOKEN HEALTH grid */}
      <SectionHead emoji="📈" label="Token Health" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <StatCell label="Market Cap" value={fmtUSD(mcap)} delta={th?.mcap_change_pct}
          deltaLabel={th?.mcap_change_pct !== undefined ? `${sign(th.mcap_change_pct)}${th.mcap_change_pct?.toFixed(1)}%` : undefined} />
        <StatCell label="Volume 24h" value={fmtUSD(vol)} delta={th?.volume_change_pct}
          deltaLabel={th?.volume_change_pct !== undefined ? `${sign(th.volume_change_pct)}${th.volume_change_pct?.toFixed(1)}%` : undefined} />
        <StatCell label="Holders" value={fmtExact(holders)} delta={th?.holder_trend}
          deltaLabel={th?.holder_trend !== undefined ? `${sign(th.holder_trend)}${fmtExact(Math.abs(th.holder_trend ?? 0))} today` : undefined} />
        <StatCell label="Liquidity" value={fmtUSD(liq)} delta={th?.liquidity_change_pct}
          deltaLabel={th?.liquidity_change_pct !== undefined ? `${sign(th.liquidity_change_pct)}${th.liquidity_change_pct?.toFixed(1)}%` : undefined} />
      </div>

      {/* WHALE ACTIVITY */}
      <SectionHead emoji="🐋" label="Whale Activity" />
      {whaleBuy > 0 && (
        <WhaleCard label="Biggest Buy"  usd={whaleBuy}  tx={whaleBuyTx}
          wallet={whaleBuyWallet}  time={whaleBuyTime}  isUp={true} />
      )}
      {whaleSell > 0 && (
        <WhaleCard label="Biggest Sell" usd={whaleSell} tx={whaleSellTx}
          wallet={whaleSellWallet} time={whaleSellTime} isUp={false} />
      )}
      {whaleBuy === 0 && whaleSell === 0 && (
        <p style={{ fontSize:"0.8125rem", color:"#A1A1AA", padding:"4px 0" }}>No whale trades in 24h</p>
      )}

      {/* COMMUNITY grid */}
      <SectionHead emoji="👥" label="Community" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <StatCell label={`Discord · ${fmtExact(discordOnline)} online`}
          value={fmtExact(discordMembers)} delta={discordDelta}
          deltaLabel={`${sign(discordDelta)}${fmtExact(Math.abs(discordDelta))} today`} />
        {telegramMembers > 0 && (
          <StatCell label="Telegram" value={fmtExact(telegramMembers)} delta={telegramDelta}
            deltaLabel={`${sign(telegramDelta)}${fmtExact(Math.abs(telegramDelta))} today`} />
        )}
        <StatCell label="X Followers" value={fmtExact(twitterFollowers)} delta={followerDelta}
          deltaLabel={`${sign(followerDelta)}${fmtExact(Math.abs(followerDelta))} today`} />
        {raids24h > 0 && (
          <StatCell label="Raid Tweets (24h)" value={String(raids24h)} color="#F5A623" />
        )}
      </div>

      {/* NEWS */}
      {news.length > 0 && (
        <>
          <SectionHead emoji="📰" label="Latest News" />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {news.slice(0, 4).map((n: any, i: number) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                style={{ padding:"9px 12px", background:"rgba(0,0,0,0.03)",
                  borderRadius:10, border:"1px solid rgba(0,0,0,0.05)",
                  display:"flex", flexDirection:"column", gap:3, textDecoration:"none" }}>
                <p style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F", lineHeight:1.35 }}>
                  {n.title}
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <p style={{ fontSize:"0.6875rem", color:"#A1A1AA" }}>{n.source}</p>
                  <ExternalLink style={{ width:10, height:10, color:"#A1A1AA" }} />
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Daily Briefing"
      subtitle="Live · Real Data"
      icon={<Newspaper style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
