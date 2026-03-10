"use client"
import React from "react"

import { TrendingUp, TrendingDown, Coins, ExternalLink } from "lucide-react"
import { WhaleAlertBadge } from "@/components/cards/wallet-tracker"
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

// ── Exchange Section (embedded in Coin Health) ───────────────────────────────
type ExchangeStatus = "listed" | "in-progress" | "target" | "rejected"
interface Exchange {
  id:         string
  name:       string
  url?:       string
  status:     ExchangeStatus
  appliedAt?: string
  listedAt?:  string
  volume?:    string
  note?:      string
  tier:       1 | 2 | 3
}
const DEFAULT_EXCHANGES: Exchange[] = [
  { id:"1",  name:"BingX",         status:"listed",      tier:2, listedAt:"2026-01-01", url:"https://bingx.com" },
  { id:"2",  name:"MEXC",          status:"listed",      tier:1, listedAt:"2026-01-01", url:"https://mexc.com"  },
  { id:"3",  name:"Gate.io Alpha", status:"listed",      tier:1, listedAt:"2026-01-01", url:"https://gate.io"   },
  { id:"4",  name:"LBank",         status:"listed",      tier:2, listedAt:"2026-01-01", url:"https://lbank.com" },
  { id:"5",  name:"Moonshot",      status:"listed",      tier:2, listedAt:"2026-01-01", url:"https://moonshot.money" },
  { id:"6",  name:"BitMart",       status:"listed",      tier:2, listedAt:"2026-01-01", url:"https://bitmart.com" },
  { id:"7",  name:"Bitrue Alpha",  status:"listed",      tier:2, listedAt:"2026-01-01", url:"https://bitrue.com" },
  { id:"8",  name:"KCEX",          status:"listed",      tier:3, listedAt:"2026-01-01" },
  { id:"9",  name:"BITKAN",        status:"listed",      tier:3, listedAt:"2026-01-01" },
  { id:"10", name:"CEX.IO",        status:"listed",      tier:2, listedAt:"2026-01-01", url:"https://cex.io" },
  { id:"11", name:"KuCoin Alpha",  status:"listed",      tier:1, listedAt:"2026-01-01", url:"https://kucoin.com" },
  { id:"12", name:"WEEX",          status:"listed",      tier:2, listedAt:"2026-01-01", url:"https://weex.com" },
  { id:"13", name:"CoinMarketCap", status:"listed",      tier:1, listedAt:"2026-01-01", url:"https://coinmarketcap.com" },
  { id:"14", name:"CoinGecko",     status:"listed",      tier:1, listedAt:"2026-01-01", url:"https://coingecko.com" },
  { id:"15", name:"Bybit",         status:"in-progress", tier:1, appliedAt:"2026-02-01", url:"https://bybit.com", note:"Application submitted" },
  { id:"16", name:"OKX.US",        status:"target",      tier:1, url:"https://okx.com" },
  { id:"17", name:"Bitget",        status:"target",      tier:1, url:"https://bitget.com" },
  { id:"18", name:"Crypto.com",    status:"target",      tier:1, url:"https://crypto.com" },
]
const TIER_CONFIG = {
  1: { label: "Tier 1", color: "#F5A623" },
  2: { label: "Tier 2", color: "#2563EB" },
  3: { label: "Tier 3", color: "var(--tertiary)" },
}

function getLogoUrl(name: string, url?: string): string {
  const overrides: Record<string, string> = {
    "bingx":"/exchanges/bingx.jpg","mexc":"/exchanges/mexc.png",
    "gate.io":"/exchanges/gate.png","gate.io alpha":"/exchanges/gate.png",
    "lbank":"/exchanges/lbank.png","moonshot":"/exchanges/moonshot.ico",
    "bitmart":"/exchanges/bitmart.png","bitrue":"/exchanges/bitrue.png",
    "bitrue alpha":"/exchanges/bitrue.png","kcex":"/exchanges/kcex.jpg",
    "bitkan":"/exchanges/bitkan.png","cex.io":"/exchanges/cexio.png",
    "kucoin":"/exchanges/kucoin.png","kucoin alpha":"/exchanges/kucoin.png",
    "weex":"/exchanges/weex.png","coinmarketcap":"/exchanges/coinmarketcap.ico",
    "coingecko":"/exchanges/coingecko.svg","bybit":"/exchanges/bybit.png",
    "okx":"/exchanges/okx.ico","okx.us":"/exchanges/okx.ico",
    "bitget":"https://logo.clearbit.com/bitget.com","crypto.com":"https://logo.clearbit.com/crypto.com",
  }
  const found = overrides[name.toLowerCase()]
  if (found) return found
  return ""
}

function ExLogo({ name, url }: { name: string; url?: string }) {
  const [err, setErr] = React.useState(false)
  const src = getLogoUrl(name, url)
  if (!src || err) {
    const hue = name.split("").reduce((a,c) => a + c.charCodeAt(0), 0) % 360
    return <div style={{ width:34, height:34, borderRadius:9, background:`hsl(${hue},55%,92%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.625rem", fontWeight:800, color:`hsl(${hue},50%,35%)`, flexShrink:0 }}>{name.slice(0,2).toUpperCase()}</div>
  }
  return <img src={src} alt={name} width={34} height={34} style={{ borderRadius:9, objectFit:"contain", background:"var(--card)", flexShrink:0 }} onError={() => setErr(true)} />
}

function ExchangeSection() {
  const [exchanges, setExchanges] = React.useState<Exchange[]>(DEFAULT_EXCHANGES)
  React.useEffect(() => {
    const s = localStorage.getItem("67_exchanges")
    if (s) setExchanges(JSON.parse(s))
  }, [])
  const listed   = exchanges.filter(e => e.status === "listed")
  const progress = exchanges.filter(e => e.status === "in-progress")
  return (
    <div>
      <p style={{ fontSize:"0.6875rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
        Exchanges — {listed.length} listed · {progress.length} in progress
      </p>
      {/* Logo grid */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom: progress.length > 0 ? 12 : 0 }}>
        {listed.map(e => (
          <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer" title={e.name}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, textDecoration:"none" }}>
            <div style={{ width:42, height:42, borderRadius:11, border:"1.5px solid var(--separator)", background:"var(--card)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
              <ExLogo name={e.name} url={e.url} />
            </div>
            <span style={{ fontSize:"0.45rem", fontWeight:700, color:"var(--tertiary)", textAlign:"center", maxWidth:46, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</span>
          </a>
        ))}
      </div>
      {/* In-progress */}
      {progress.map(e => (
        <div key={e.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:10, background:"rgba(217,119,6,0.06)", border:"1px solid rgba(217,119,6,0.15)", marginBottom:6 }}>
          <ExLogo name={e.name} url={e.url} />
          <div style={{ flex:1 }}>
            <span style={{ fontSize:"0.875rem", fontWeight:700, color:"#D97706" }}>{e.name}</span>
            {e.note && <p style={{ fontSize:"0.75rem", color:"var(--tertiary)", margin:0 }}>{e.note}</p>}
          </div>
          <span style={{ fontSize:"0.625rem", fontWeight:800, color:"#D97706", background:"rgba(217,119,6,0.1)", padding:"2px 8px", borderRadius:99 }}>⏳ In Progress</span>
        </div>
      ))}
    </div>
  )
}


function getLocalExchangeLogo(name: string, fallback?: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const map: Record<string, string> = {
    'xtcom': '/exchanges/xtcom.png',
    'kcex': '/exchanges/kcex.jpg',
    'pumpswap': '/exchanges/pumpswap.jpg',
    'lbank': '/exchanges/lbank.png',
    'mexc': '/exchanges/mexc.png',
    'bilaxy': '/exchanges/bilaxy.png',
    'cexio': '/exchanges/cexio.png',
    'bingx': '/exchanges/bingx.jpg',
    'bitmart': '/exchanges/bitmart.png',
    'bitrue': '/exchanges/bitrue.png',
    'bybit': '/exchanges/bybit.png',
    'kucoin': '/exchanges/kucoin.png',
    'weex': '/exchanges/weex.png',
    'bitkan': '/exchanges/bitkan.png',
    'meteora': '/exchanges/meteora.jpg',
    'gate': '/exchanges/gate.png',
    'pumpfun': '/exchanges/pumpswap.jpg',
    'pumpswapamm': '/exchanges/pumpswap.jpg',
    'raydium': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  }
  return map[key] || fallback || ''
}

export function TokenHealthCard() {
  const { data, livePrice, liveChange24h, liveMcap } = useAppData()
  const t = data?.token_health
  const price = livePrice ?? t?.price ?? 0
  const chg   = liveChange24h ?? t?.price_change_24h ?? 0
  const mcap  = liveMcap ?? t?.market_cap ?? 0

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Title + price above chart */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:-4 }}>
        <div>
          <p style={{ fontSize:"0.5625rem", color:"var(--tertiary)", fontWeight:600, margin:0 }}>The Official 67 Coin</p>
          <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
            <p style={{ fontSize:"1.0625rem", fontWeight:800, margin:0, color:"var(--foreground)", fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em" }}>
              {fmtPrice(price)}
            </p>
            <span style={{ fontSize:"0.6875rem", fontWeight:700,
              color: chg >= 0 ? "#059669" : "#EF4444" }}>
              {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
            </span>
          </div>
        </div>
        <WhaleAlertBadge />
      </div>

      {/* Price Chart */}
      <PriceChart currentPrice={price} />

      {/* Stats — compact 2x2 grid */}
      <div className="grid-2col" style={{ borderTop:"1px solid var(--separator)", paddingTop:10 }}>
        {[
          { label:"Market Cap",  value: fmt$(mcap),                         pct: t?.mcap_change_pct },
          { label:"Volume 24h",  value: fmt$(t?.total_volume_24h ?? 0),     pct: t?.volume_change_pct },
          { label:"Holders",     value: (t?.holders ?? 0).toLocaleString(), pct: null, abs: t?.holder_trend ?? 0 },
          { label:"Liquidity",   value: fmt$(t?.liquidity ?? 0),            pct: t?.liquidity_change_pct },
        ].map(s => {
          const delta    = s.pct ?? 0
          const absDelta = s.abs ?? 0
          const showPct  = s.pct !== undefined && s.pct !== null && delta !== 0
          const showAbs  = !showPct && absDelta !== 0
          const positive = (showPct ? delta : absDelta) > 0
          return (
            <div key={s.label} style={{ background:"rgba(0,0,0,0.03)", borderRadius:10, padding:"8px 10px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", marginBottom:2 }}>
                <p style={{ fontSize:"0.9375rem", fontWeight:700, letterSpacing:"-0.03em", color:"var(--foreground)", margin:0 }}>{s.value}</p>
                {(showPct || showAbs) && (
                  <span style={{
                    fontSize:"0.5625rem", fontWeight:800, letterSpacing:"-0.01em",
                    padding:"1px 5px", borderRadius:99,
                    background: positive ? "#E8F8EE" : "#FEF0F0",
                    color:      positive ? "#1A8343" : "#C0392B",
                  }}>
                    {showPct
                      ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`
                      : `${absDelta > 0 ? "+" : ""}${absDelta}`
                    }
                  </span>
                )}
              </div>
              <p style={{ fontSize:"0.625rem", fontWeight:500, color:"var(--tertiary)", margin:0 }}>{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* CEX Volume */}
      {(() => {
        const cex = (t?.exchange_volumes ?? []).filter(e => !e.is_dex && e.volume_usd >= 1300)
        if (cex.length === 0) return null
        const max = cex[0]?.volume_usd ?? 1
        const total = cex.reduce((s, e) => s + e.volume_usd, 0)
        return (
          <div style={{ borderTop:"1px solid var(--separator)", paddingTop:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <p style={{ fontSize:"0.5625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", margin:0 }}>CEX Volume</p>
              <span style={{ fontSize:"0.5625rem", fontWeight:700, color:"var(--tertiary)" }}>{fmt$(total)} total</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {cex.map((ex, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {ex.logo
                    ? <img src={getLocalExchangeLogo(ex.exchange, ex.logo)} alt={ex.exchange} width={22} height={22} style={{ borderRadius:6, objectFit:"cover", flexShrink:0, boxShadow:"0 0 0 1px rgba(0,0,0,0.07)" }} onError={e=>{(e.target as HTMLImageElement).style.display="none"}} />
                    : <div style={{ width:22, height:22, borderRadius:6, background:"var(--fill-primary)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.5625rem", fontWeight:700, color:"var(--tertiary)" }}>{ex.exchange.charAt(0)}</div>
                  }
                  <span style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)", width:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flexShrink:0 }}>{ex.exchange}</span>
                  <div style={{ flex:1, height:5, background:"rgba(0,0,0,0.06)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.max(4,(ex.volume_usd/max)*100)}%`, background:"#F5A623", borderRadius:99 }} />
                  </div>
                  <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)", width:48, textAlign:"right", flexShrink:0 }}>{fmt$(ex.volume_usd)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* DEX Volume — PumpSwap + Meteora ilk 2 */}
      {(() => {
        const dex = (t?.exchange_volumes ?? []).filter(e => e.is_dex).slice(0,2)
        if (dex.length === 0) return null
        const max = dex[0]?.volume_usd ?? 1
        const total = dex.reduce((s, e) => s + e.volume_usd, 0)
        return (
          <div style={{ borderTop:"1px solid var(--separator)", paddingTop:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <p style={{ fontSize:"0.5625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", margin:0 }}>DEX Volume</p>
              <span style={{ fontSize:"0.5625rem", fontWeight:700, color:"var(--tertiary)" }}>{fmt$(total)} total</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {dex.map((ex, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {ex.logo
                    ? <img src={getLocalExchangeLogo(ex.exchange, ex.logo)} alt={ex.exchange} width={22} height={22} style={{ borderRadius:6, objectFit:"cover", flexShrink:0, boxShadow:"0 0 0 1px rgba(0,0,0,0.07)" }} onError={e=>{(e.target as HTMLImageElement).style.display="none"}} />
                    : <div style={{ width:22, height:22, borderRadius:6, background:"var(--fill-primary)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.5625rem", fontWeight:700, color:"var(--tertiary)" }}>{ex.exchange.charAt(0)}</div>
                  }
                  <span style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)", width:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flexShrink:0 }}>{ex.exchange}</span>
                  <div style={{ flex:1, height:5, background:"rgba(0,0,0,0.06)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.max(4,(ex.volume_usd/max)*100)}%`, background:"#7C3AED", borderRadius:99 }} />
                  </div>
                  <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)", width:48, textAlign:"right", flexShrink:0 }}>{fmt$(ex.volume_usd)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* 24h Transactions */}
      {(() => {
        const totalTx = (t?.buys_24h ?? 0) + (t?.sells_24h ?? 0)
        if (totalTx === 0) return null
        const bullPct = Math.round((t?.buys_24h ?? 0) / totalTx * 100)
        const sentiment = bullPct > 55 ? "Bullish" : bullPct < 45 ? "Bearish" : "Neutral"
        const sentColor = sentiment === "Bullish" ? "#059669" : sentiment === "Bearish" ? "#EF4444" : "#F5A623"
        return (
          <div style={{ borderTop:"1px solid var(--separator)", paddingTop:10 }}>
            <p style={{ fontSize:"0.5625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>24h Transactions</p>
            <div className="grid-2col" style={{ marginBottom:8 }}>
              <div style={{ background:"rgba(52,211,153,0.12)", borderRadius:10, padding:"8px 10px" }}>
                <p style={{ fontSize:"1rem", fontWeight:800, letterSpacing:"-0.03em", color:"#34D399", margin:0 }}>{(t?.buys_24h ?? 0).toLocaleString()}</p>
                <p style={{ fontSize:"0.5625rem", fontWeight:600, color:"#34D399", margin:"2px 0 0" }}>Buys</p>
              </div>
              <div style={{ background:"rgba(248,113,113,0.12)", borderRadius:10, padding:"8px 10px" }}>
                <p style={{ fontSize:"1rem", fontWeight:800, letterSpacing:"-0.03em", color:"#C0392B", margin:0 }}>{(t?.sells_24h ?? 0).toLocaleString()}</p>
                <p style={{ fontSize:"0.5625rem", fontWeight:600, color:"#C0392B", margin:"2px 0 0" }}>Sells</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ flex:1, height:5, background:"rgba(0,0,0,0.06)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${bullPct}%`, background:"#059669", borderRadius:99 }} />
              </div>
              <span style={{ fontSize:"0.625rem", fontWeight:800, color: sentColor, flexShrink:0 }}>{sentiment} {bullPct}%</span>
            </div>
          </div>
        )
      })()}

      {/* ATH — siyah kutu */}
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
                <img src={getLocalExchangeLogo(ex.exchange, ex.logo)} alt={ex.exchange}
                  style={{ width:22, height:22, borderRadius:6, objectFit:"cover", flexShrink:0,
                    boxShadow:"0 0 0 1px rgba(0,0,0,0.07)" }}
                  onError={e => { (e.target as HTMLImageElement).style.display="none" }} />
              ) : (
                <div style={{ width:22, height:22, borderRadius:6, background:"var(--fill-primary)", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.5625rem", fontWeight:700, color:"var(--tertiary)" }}>
                  {ex.exchange.charAt(0)}
                </div>
              )}
              <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)",
                width:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {ex.exchange}
              </span>
              <div className="prog-track" style={{ flex:1, height:5 }}>
                <div className="prog-fill" style={{ height:5, width:`${pct}%`, background:color }} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)",
                  fontVariantNumeric:"tabular-nums" }}>
                  {fmt$(ex.volume_usd)}
                </span>
                {ex.volume_delta !== 0 && ex.volume_delta !== undefined && (
                  <span style={{
                    fontSize:"0.5625rem", fontWeight:700,
                    color: ex.volume_delta > 0 ? "#059669" : "#EF4444",
                    background: ex.volume_delta > 0 ? "rgba(5,150,105,0.08)" : "rgba(239,68,68,0.08)",
                    padding:"1px 5px", borderRadius:99
                  }}>
                    {ex.volume_delta > 0 ? "+" : ""}{fmt$(ex.volume_delta)}
                  </span>
                )}
              </div>
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

      {/* ── Stats grid ── */}
      <div className="grid-2col-8">
        {[
          { label:"Market Cap",  value: fmt$(mcap),                         pct: t?.mcap_change_pct },
          { label:"Volume 24h",  value: fmt$(t?.total_volume_24h ?? 0),     pct: t?.volume_change_pct },
          { label:"Holders",     value: (t?.holders ?? 0).toLocaleString(), pct: null, abs: t?.holder_trend ?? 0 },
          { label:"Liquidity",   value: fmt$(t?.liquidity ?? 0),            pct: t?.liquidity_change_pct },
        ].map(s => {
          const delta    = s.pct ?? 0
          const absDelta = (s as {abs?: number}).abs ?? 0
          const showPct  = s.pct !== undefined && s.pct !== null && delta !== 0
          const showAbs  = !showPct && absDelta !== 0
          const positive = (showPct ? delta : absDelta) > 0
          return (
            <div key={s.label} className="inset-cell">
              <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:4 }}>
                <p className="metric-lg" style={{ margin:0 }}>{s.value}</p>
                {(showPct || showAbs) && (
                  <span style={{
                    fontSize:"0.75rem", fontWeight:800,
                    padding:"2px 8px", borderRadius:99,
                    background: positive ? "#E8F8EE" : "#FEF0F0",
                    color:      positive ? "#1A8343" : "#C0392B",
                  }}>
                    {showPct
                      ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`
                      : `${absDelta > 0 ? "+" : ""}${absDelta}`
                    }
                  </span>
                )}
              </div>
              <p className="metric-label" style={{ marginTop:0 }}>{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* ── 24h Buys / Sells + Sentiment ── */}
      {(() => {
        const totalTx  = (t?.buys_24h ?? 0) + (t?.sells_24h ?? 0)
        const bullPct  = totalTx > 0 ? Math.round((t?.buys_24h ?? 0) / totalTx * 100) : 55
        const bearPct  = 100 - bullPct
        const sentiment = bullPct > 55 ? "Bullish" : bullPct < 45 ? "Bearish" : "Neutral"
        const sentColor = sentiment === "Bullish" ? "#34C759" : sentiment === "Bearish" ? "#FF3B30" : "#F5A623"
        const sentBg    = sentiment === "Bullish" ? "#E8F8EE" : sentiment === "Bearish" ? "#FEF0F0"  : "#FFF8EC"
        const sentLabel = sentiment

        return (
          <div className="inset-cell">
            <p className="hero-label" style={{ marginBottom:12 }}>24h Transactions</p>

            {/* Buy / Sell count cards */}
            <div className="grid-2col-8" style={{ marginBottom:14 }}>
              <div style={{ background:"rgba(52,211,153,0.12)", borderRadius:10, padding:"12px 14px" }}>
                <p style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.04em", color:"#34D399" }}>
                  {(t?.buys_24h ?? 0).toLocaleString()}
                </p>
                <p style={{ fontSize:"0.75rem", fontWeight:600, color:"#34D399", marginTop:3 }}>Buys</p>
              </div>
              <div style={{ background:"rgba(248,113,113,0.12)", borderRadius:10, padding:"12px 14px" }}>
                <p style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.04em", color:"#C0392B" }}>
                  {(t?.sells_24h ?? 0).toLocaleString()}
                </p>
                <p style={{ fontSize:"0.75rem", fontWeight:600, color:"#C0392B", marginTop:3 }}>Sells</p>
              </div>
            </div>

            {/* Single clean sentiment pill */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:7,
                padding:"7px 14px", borderRadius:99,
                background: sentBg,
                border:`1.5px solid ${sentColor}22`,
              }}>
                <span className="sentiment-dot" style={{ "--dot-color": sentColor } as React.CSSProperties} />
                <span style={{ fontSize:"0.8125rem", fontWeight:700, color: sentColor, letterSpacing:"-0.01em" }}>
                  {sentLabel}
                </span>
                <span style={{ fontSize:"0.8125rem", fontWeight:800, color: sentColor }}>
                  {bullPct}%
                </span>
              </div>
              <span style={{ fontSize:"0.6875rem", color:"var(--tertiary)" }}>market sentiment</span>
            </div>
          </div>
        )
      })()}

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

      {/* ── CEX Volume ── */}
      {cexVols.length > 0 && (
        <div className="inset-cell">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <p className="hero-label">CEX Volume</p>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)" }}>
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
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)" }}>
              {fmt$(dexVols.reduce((a,e) => a + e.volume_usd, 0))} total
            </span>
          </div>
          <VolumeList items={dexVols} color="#8B5CF6" />
        </div>
      )}

      {/* ── Exchange Listings ── */}
      <ExchangeSection />

      {/* ── Links — premium with logos ── */}
      <div className="grid-2col-8">
        {[
          { label:"DexScreener",   url:"https://dexscreener.com/solana/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6", favicon:"https://dexscreener.com/favicon.ico" },
          { label:"Solscan",       url:"https://solscan.io/token/9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump",   favicon:"https://solscan.io/favicon.ico" },
          { label:"CoinGecko",     url:"https://www.coingecko.com/en/coins/the-official-67-coin",                   favicon:"https://www.coingecko.com/favicon.ico" },
          { label:"CoinMarketCap", url:"https://coinmarketcap.com/currencies/the-official-67-coin-onchain/",        favicon:"https://coinmarketcap.com/favicon.ico" },
        ].map(({ label, url, favicon }) => (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"12px 14px", borderRadius:12,
              background:"var(--fill-primary)",
              border:"1px solid rgba(0,0,0,0.06)",
              textDecoration:"none",
              transition:"background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#EEEEF0")}
            onMouseLeave={e => (e.currentTarget.style.background = "#F5F5F7")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={favicon} alt="" width={18} height={18}
              style={{ width:18, height:18, borderRadius:4, objectFit:"contain", flexShrink:0 }}
              onError={e => { (e.target as HTMLImageElement).style.display="none" }} />
            <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", flex:1,
              letterSpacing:"-0.01em" }}>{label}</span>
            <ExternalLink style={{ width:12, height:12, color:"var(--tertiary)", flexShrink:0 }} />
          </a>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Coin"
      subtitle="$67"
      icon={<img src="/67logo.png" alt="67" style={{ width:18, height:18, borderRadius:"50%", objectFit:"cover" }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      liveTag
    />
  )
}
