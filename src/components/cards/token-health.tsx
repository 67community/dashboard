"use client"

import { TrendingUp, TrendingDown, Coins, ExternalLink } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { PriceChart } from "@/components/ui/price-chart"
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
            <p style={{ fontSize:"1.375rem", fontWeight:700, letterSpacing:"-0.03em", color:"#1D1D1F" }}>{s.value}</p>
            <p style={{ fontSize:"0.8125rem", fontWeight:500, color:"#8E8E93", marginTop:3 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const cexVols = t?.exchange_volumes?.filter(e => !e.is_dex) ?? []
  const dexVols = t?.exchange_volumes?.filter(e =>  e.is_dex) ?? []
  const allMax  = t?.exchange_volumes?.[0]?.volume_usd ?? 1

  function VolumeList({ items, color }: { items: typeof cexVols; color: string }) {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
        {items.map((ex, i) => {
          const pct = (ex.volume_usd / allMax) * 100
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
              {ex.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ex.logo} alt={ex.exchange}
                  style={{ width:22, height:22, borderRadius:6, objectFit:"cover", flexShrink:0,
                    boxShadow:"0 0 0 1px rgba(0,0,0,0.07)" }}
                  onError={e => { (e.target as HTMLImageElement).style.display="none" }} />
              ) : (
                <div style={{ width:22, height:22, borderRadius:6, background:"#E8E8ED", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.5625rem", fontWeight:700, color:"#8E8E93" }}>
                  {ex.exchange.charAt(0)}
                </div>
              )}
              <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F",
                width:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {ex.exchange}
              </span>
              <div className="prog-track" style={{ flex:1, height:5 }}>
                <div className="prog-fill" style={{ height:5, width:`${pct}%`, background:color }} />
              </div>
              <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"#1D1D1F",
                width:56, textAlign:"right", fontVariantNumeric:"tabular-nums" }}>
                {fmt$(ex.volume_usd)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Price Chart ── */}
      <PriceChart currentPrice={price} />

      {/* ── 4 stats ── */}
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

      {/* ── ATH ── */}
      {t?.ath && (
        <div className="inset-cell-dark">
          <p className="hero-label" style={{ color:"rgba(255,255,255,0.35)", marginBottom:8 }}>All-Time High</p>
          <p style={{ fontSize:"1.75rem", fontWeight:800, color:"#fff", letterSpacing:"-0.04em", lineHeight:1 }}>
            {fmtPrice(t.ath)}
          </p>
          <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)", marginTop:6 }}>
            {Math.abs(t.ath_change_pct ?? 0).toFixed(1)}% below ATH · {t.ath_date}
          </p>
        </div>
      )}

      {/* ── Buy/sell ── */}
      {t?.buys_24h && (
        <div className="inset-cell">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#1A8343" }}>
              Buys {t.buys_24h.toLocaleString()} ({((t.buys_24h/(t.buys_24h+t.sells_24h))*100).toFixed(0)}%)
            </span>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#C0392B" }}>
              Sells {t.sells_24h.toLocaleString()}
            </span>
          </div>
          <div className="prog-track" style={{ height:8 }}>
            <div className="prog-fill" style={{ height:8, width:`${(t.buys_24h/(t.buys_24h+t.sells_24h))*100}%`, background:"#34C759" }} />
          </div>
        </div>
      )}

      {/* ── CEX Volume ── */}
      {cexVols.length > 0 && (
        <div className="inset-cell">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <p className="hero-label">CEX Volume</p>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#1D1D1F" }}>
              {fmt$(cexVols.reduce((a,e) => a + e.volume_usd, 0))} total
            </span>
          </div>
          <VolumeList items={cexVols} color="#F5A623" />
        </div>
      )}

      {/* ── DEX Volume ── */}
      {dexVols.length > 0 && (
        <div className="inset-cell">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <p className="hero-label">DEX Volume</p>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#1D1D1F" }}>
              {fmt$(dexVols.reduce((a,e) => a + e.volume_usd, 0))} total
            </span>
          </div>
          <VolumeList items={dexVols} color="#8B5CF6" />
        </div>
      )}

      {/* ── Links ── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {[
          ["DexScreener","https://dexscreener.com/solana/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6"],
          ["Solscan","https://solscan.io/token/9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"],
          ["CoinGecko","https://www.coingecko.com/en/coins/the-official-67-coin"],
          ["CMC","https://coinmarketcap.com/currencies/the-official-67-coin-onchain/"],
        ].map(([l,h]) => (
          <a key={l} href={h} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
            style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"8px 14px",
              borderRadius:10, background:"#F5F5F7", fontSize:"0.8125rem", fontWeight:600,
              color:"#1D1D1F", textDecoration:"none" }}>
            {l} <ExternalLink style={{ width:11, height:11, color:"#8E8E93" }} />
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
