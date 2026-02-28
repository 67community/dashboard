"use client"

import { Newspaper, TrendingUp, TrendingDown, ExternalLink, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import { useMemo } from "react"

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtUSD(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(1) + "K"
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

function fmtExact(n: number) {
  return n.toLocaleString("en-US")
}

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
      fontSize:"0.6875rem", fontWeight:700, color, background:bg,
      padding:"2px 8px", borderRadius:99 }}>
      <Icon style={{ width:10, height:10 }} />
      {text}
    </span>
  )
}

function Section({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10, marginTop:6,
      padding:"6px 10px", borderRadius:8,
      background:"linear-gradient(135deg, rgba(245,166,35,0.06) 0%, rgba(245,166,35,0.02) 100%)",
      border:"1px solid rgba(245,166,35,0.12)" }}>
      <span style={{ fontSize:"0.8125rem" }}>{emoji}</span>
      <span style={{ fontSize:"0.6875rem", fontWeight:800, color:"#374151",
        textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(245,166,35,0.2)" }} />
    </div>
  )
}

function Row({ label, value, delta, deltaLabel, color, sub, href }: {
  label: string; value: string
  delta?: number; deltaLabel?: string
  color?: string; sub?: string; href?: string
}) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"8px 0", borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
      <div>
        <span style={{ fontSize:"0.8125rem", color:"#6B7280", fontWeight:500 }}>{label}</span>
        {sub && <div style={{ fontSize:"0.6875rem", color:"#A1A1AA", marginTop:1 }}>{sub}</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:"0.875rem", fontWeight:700, color: color ?? "#1D1D1F",
              fontVariantNumeric:"tabular-nums", display:"flex", alignItems:"center", gap:3,
              textDecoration:"none" }}>
            {value}<ExternalLink style={{ width:11, height:11, opacity:0.5 }} />
          </a>
        ) : (
          <span style={{ fontSize:"0.875rem", fontWeight:700, color: color ?? "#1D1D1F",
            fontVariantNumeric:"tabular-nums" }}>{value}</span>
        )}
        {delta !== undefined && <Delta value={delta} label={deltaLabel} />}
      </div>
    </div>
  )
}

function WhaleRow({ label, usd, tx, wallet, time, color }: {
  label: string; usd: number; tx: string; wallet: string; time: string; color: string
}) {
  const isUp = color === "#059669"
  return (
    <div style={{ padding:"10px 12px", borderRadius:10, marginBottom:6,
      background: isUp ? "rgba(5,150,105,0.05)" : "rgba(239,68,68,0.05)",
      border: `1px solid ${isUp ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.15)"}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#6B7280" }}>{label}</span>
        <span style={{ fontSize:"1rem", fontWeight:800, color, fontVariantNumeric:"tabular-nums" }}>
          {fmtUSD(usd)}
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5 }}>
        {wallet && (
          <a href={`https://solscan.io/account/${wallet}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:"0.6875rem", color:"#6B7280", fontFamily:"monospace",
              textDecoration:"none", display:"flex", alignItems:"center", gap:2 }}>
            💳 {shortAddr(wallet)}<ExternalLink style={{ width:9, height:9, opacity:0.5 }} />
          </a>
        )}
        <div style={{ flex:1 }} />
        {tx && (
          <a href={`https://solscan.io/tx/${tx}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:"0.6875rem", color:"#2563EB",
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
  const whaleSellWallet = th?.biggest_trades?.biggest_sell_wallet?? ""
  const whaleSellTime   = th?.biggest_trades?.biggest_sell_time  ?? ""

  const raids24h = useMemo(() =>
    feed.filter(r => {
      try { return Date.now() - new Date(r.date).getTime() < 86_400_000 } catch { return false }
    }).length, [feed])

  const priceUp = ch24 >= 0

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <p style={{ fontSize:"0.6875rem", fontWeight:600, color:"#A1A1AA", marginBottom:12 }}>
        {today()}
      </p>
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
      <Row label="Holders"     value={fmtExact(holders)} />
      <Row label="Liquidity"   value={fmtUSD(liq)} delta={th?.liquidity_change_pct}
           deltaLabel={th?.liquidity_change_pct !== undefined ? `${sign(th.liquidity_change_pct)}${th.liquidity_change_pct?.toFixed(1)}%` : undefined} />
      <Row label="Discord"     value={fmtExact(discordMembers)}
           delta={discordDelta} deltaLabel={`${sign(discordDelta)}${fmtExact(Math.abs(discordDelta))} today`} />
      <Row label="X Followers" value={fmtExact(twitterFollowers)}
           delta={followerDelta} deltaLabel={`${sign(followerDelta)}${fmtExact(Math.abs(followerDelta))} today`} />
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

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <p style={{ fontSize:"0.9375rem", fontWeight:800, color:"#1D1D1F", letterSpacing:"-0.02em" }}>
        {today()}
      </p>

      {/* Price block — same as collapsed */}
      <div style={{ display:"flex", alignItems:"center", gap:12,
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

      <div>
        <Section emoji="📈" label="Token Health" />
        <Row label="Price"      value={`$${price.toFixed(8)}`}
             delta={ch24} deltaLabel={`${sign(ch24)}${ch24.toFixed(2)}%`} />
        <Row label="Market Cap" value={fmtUSD(mcap)}
             delta={th?.mcap_change_pct}
             deltaLabel={th?.mcap_change_pct !== undefined ? `${sign(th.mcap_change_pct)}${th.mcap_change_pct?.toFixed(1)}%` : undefined} />
        <Row label="Volume 24h" value={fmtUSD(vol)}
             delta={th?.volume_change_pct}
             deltaLabel={th?.volume_change_pct !== undefined ? `${sign(th.volume_change_pct)}${th.volume_change_pct?.toFixed(1)}%` : undefined} />
        <Row label="Liquidity"  value={fmtUSD(liq)}
             delta={th?.liquidity_change_pct}
             deltaLabel={th?.liquidity_change_pct !== undefined ? `${sign(th.liquidity_change_pct)}${th.liquidity_change_pct?.toFixed(1)}%` : undefined} />
        <Row label="Holders"    value={fmtExact(holders)}
             delta={th?.holder_trend}
             deltaLabel={th?.holder_trend !== undefined ? `${sign(th.holder_trend)}${fmtExact(Math.abs(th.holder_trend ?? 0))} today` : undefined} />
      </div>

      <div>
        <Section emoji="🐋" label="Whale Activity" />
        {whaleBuy > 0 && (
          <WhaleRow label="Biggest Buy"  usd={whaleBuy}  tx={whaleBuyTx}
            wallet={whaleBuyWallet}  time={whaleBuyTime}  color="#059669" />
        )}
        {whaleSell > 0 && (
          <WhaleRow label="Biggest Sell" usd={whaleSell} tx={whaleSellTx}
            wallet={whaleSellWallet} time={whaleSellTime} color="#EF4444" />
        )}
        {whaleBuy === 0 && whaleSell === 0 && (
          <p style={{ fontSize:"0.8125rem", color:"#A1A1AA", padding:"8px 0" }}>No whale trades in 24h</p>
        )}
      </div>

      <div>
        <Section emoji="👥" label="Community" />
        <Row label="Discord Members"
             value={fmtExact(discordMembers)}
             delta={discordDelta}
             deltaLabel={`${sign(discordDelta)}${fmtExact(Math.abs(discordDelta))} today`}
             sub={`${fmtExact(discordOnline)} online now`} />
        {telegramMembers > 0 && (
          <Row label="Telegram"
               value={fmtExact(telegramMembers)}
               delta={telegramDelta}
               deltaLabel={`${sign(telegramDelta)}${fmtExact(Math.abs(telegramDelta))} today`} />
        )}
      </div>

      <div>
        <Section emoji="📣" label="Social" />
        <Row label="X Followers"
             value={fmtExact(twitterFollowers)}
             delta={followerDelta}
             deltaLabel={`${sign(followerDelta)}${fmtExact(Math.abs(followerDelta))} today`} />
        {raids24h > 0 && (
          <Row label="Raid Tweets (24h)" value={String(raids24h)} color="#F5A623" />
        )}
      </div>

      {news.length > 0 && (
        <div>
          <Section emoji="📰" label="Latest News" />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {news.slice(0, 4).map((n: any, i: number) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                style={{ padding:"9px 11px", background:"rgba(0,0,0,0.03)",
                  borderRadius:10, display:"flex", flexDirection:"column", gap:3,
                  textDecoration:"none" }}>
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
        </div>
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
