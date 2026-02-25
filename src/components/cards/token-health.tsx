"use client"

import { TrendingUp, TrendingDown, Coins, ExternalLink } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

const fmt$ = (n: number) =>
  n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` :
  n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`

const fmtPrice = (n: number) =>
  n < 0.001 ? `$${n.toFixed(6)}` : `$${n.toFixed(5)}`

function Chg({ v, size="sm" }: { v: number; size?: "sm"|"md" }) {
  const up = v >= 0
  const cls = up ? "badge-up" : "badge-down"
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={cls} style={size === "md" ? { fontSize:"0.75rem", padding:"4px 10px" } : undefined}>
      <Icon style={{ width:11, height:11 }} />
      {up ? "+" : ""}{v.toFixed(2)}%
    </span>
  )
}

export function TokenHealthCard() {
  const { data, livePrice, liveChange24h, liveMcap } = useAppData()
  const t = data?.token_health
  const price = livePrice ?? t?.price ?? 0
  const chg   = liveChange24h ?? t?.price_change_24h ?? 0
  const mcap  = liveMcap ?? t?.market_cap ?? 0

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      {/* Hero price */}
      <div>
        <p className="hero-label" style={{ marginBottom:8 }}>$67 · Solana</p>
        <p className="hero-number">{fmtPrice(price)}</p>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
          <Chg v={chg} />
          <span style={{ fontSize:"0.75rem", color:"#8E8E93", fontWeight:500 }}>24h change</span>
        </div>
      </div>

      {/* Stats — clean horizontal row, no nested boxes */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 0", borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:18 }}>
        {[
          { label:"Market Cap",  value: fmt$(mcap) },
          { label:"Volume 24h",  value: fmt$(t?.total_volume_24h ?? 0) },
          { label:"Holders",     value: (t?.holders ?? 0).toLocaleString() },
          { label:"CMC Rank",    value: `#${t?.cmc_rank ?? "—"}` },
        ].map(s => (
          <div key={s.label}>
            <p style={{ fontSize:"1.125rem", fontWeight:700, letterSpacing:"-0.02em", color:"#1D1D1F" }}>{s.value}</p>
            <p style={{ fontSize:"0.6875rem", fontWeight:500, color:"#8E8E93", marginTop:2 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Big price block */}
      <div className="inset-cell" style={{ padding:"20px 20px" }}>
        <p className="hero-label" style={{ marginBottom:8 }}>Live Price</p>
        <p style={{ fontSize:"3.25rem", fontWeight:800, letterSpacing:"-0.055em", color:"#09090B", lineHeight:1 }}>
          {fmtPrice(price)}
        </p>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, flexWrap:"wrap" }}>
          <Chg v={chg} size="md" />
          <span style={{ fontSize:"0.6875rem", color:"#A1A1AA" }}>24h</span>
          {t?.price_change_1h !== undefined && <><Chg v={t.price_change_1h} /><span style={{ fontSize:"0.6875rem", color:"#A1A1AA" }}>1h</span></>}
          {t?.price_change_7d !== undefined && <><Chg v={t.price_change_7d} /><span style={{ fontSize:"0.6875rem", color:"#A1A1AA" }}>7d</span></>}
        </div>
      </div>

      {/* 4 stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          { label:"Market Cap",   value: fmt$(mcap) },
          { label:"Volume 24h",   value: fmt$(t?.total_volume_24h ?? 0) },
          { label:"Holders",      value: (t?.holders ?? 0).toLocaleString() },
          { label:"Liquidity",    value: fmt$(t?.liquidity ?? 0) },
        ].map(s => (
          <div key={s.label} className="inset-cell">
            <p className="metric-lg">{s.value}</p>
            <p className="metric-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ATH */}
      {t?.ath && (
        <div className="inset-cell-dark">
          <p className="hero-label" style={{ color:"rgba(255,255,255,0.35)", marginBottom:8 }}>All-Time High</p>
          <p style={{ fontSize:"1.75rem", fontWeight:800, color:"#fff", letterSpacing:"-0.04em", lineHeight:1 }}>
            {fmtPrice(t.ath)}
          </p>
          <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)", marginTop:6, fontWeight:500 }}>
            {Math.abs(t.ath_change_pct ?? 0).toFixed(1)}% below ATH · {t.ath_date}
          </p>
        </div>
      )}

      {/* Buy/sell bar */}
      {t?.buys_24h && (
        <div className="inset-cell">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#059669" }}>
              Buys {t.buys_24h.toLocaleString()} ({((t.buys_24h/(t.buys_24h+t.sells_24h))*100).toFixed(0)}%)
            </span>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#DC2626" }}>
              Sells {t.sells_24h.toLocaleString()}
            </span>
          </div>
          <div className="prog-track" style={{ height:8 }}>
            <div className="prog-fill" style={{ height:8, width:`${(t.buys_24h/(t.buys_24h+t.sells_24h))*100}%`, background:"#10B981" }} />
          </div>
        </div>
      )}

      {/* Exchange volumes */}
      {(t?.exchange_volumes?.length ?? 0) > 0 && (
        <div className="inset-cell">
          <p className="hero-label" style={{ marginBottom:14 }}>Volume by Exchange</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {t!.exchange_volumes.map((ex, i) => {
              const pct = (ex.volume_usd / t!.exchange_volumes[0].volume_usd) * 100
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {ex.logo && (
                    <img src={ex.logo} alt="" style={{ width:18, height:18, borderRadius:4, objectFit:"cover", flexShrink:0 }}
                      onError={e => { (e.target as HTMLImageElement).style.display="none" }} />
                  )}
                  <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#09090B", width:96, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ex.exchange}</span>
                  <div className="prog-track" style={{ flex:1, height:5 }}>
                    <div className="prog-fill" style={{ height:5, width:`${pct}%`, background: ex.is_dex ? "#6366F1" : "#F5A623" }} />
                  </div>
                  <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#09090B", width:52, textAlign:"right" }}>{fmt$(ex.volume_usd)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Links */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {[
          ["DexScreener","https://dexscreener.com/solana/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6"],
          ["Solscan","https://solscan.io/token/9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"],
          ["CoinGecko","https://www.coingecko.com/en/coins/the-official-67-coin"],
          ["CMC","https://coinmarketcap.com/currencies/the-official-67-coin-onchain/"],
        ].map(([l,h]) => (
          <a key={l} href={h} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
            style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:10, background:"#F4F4F5", fontSize:"0.8125rem", fontWeight:600, color:"#09090B", textDecoration:"none" }}>
            {l} <ExternalLink style={{ width:11, height:11, color:"#A1A1AA" }} />
          </a>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Token Health"
      subtitle="$67 on Solana"
      icon={<Coins style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      liveTag
    />
  )
}
