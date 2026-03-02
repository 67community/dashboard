"use client"

import { useState, useEffect } from "react"
import { Building2, Plus, Trash2, ExternalLink } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

type ExchangeStatus = "listed" | "in-progress" | "target" | "rejected"

interface Exchange {
  id:         string
  name:       string
  url?:       string
  status:     ExchangeStatus
  appliedAt?: string
  listedAt?:  string
  note?:      string
  tier:       1 | 2 | 3
}

const STATUS_CONFIG: Record<ExchangeStatus, { label: string; emoji: string; color: string; bg: string }> = {
  "listed":      { label: "Listed",      emoji: "✅", color: "#059669", bg: "rgba(5,150,105,0.08)"  },
  "in-progress": { label: "In Progress", emoji: "⏳", color: "#D97706", bg: "rgba(217,119,6,0.08)"  },
  "target":      { label: "Target",      emoji: "🎯", color: "#2563EB", bg: "rgba(37,99,235,0.08)"  },
  "rejected":    { label: "Passed",      emoji: "❌", color: "#A1A1AA", bg: "#F4F4F5"               },
}

const TIER_CONFIG = {
  1: { label: "Tier 1", color: "#F5A623" },
  2: { label: "Tier 2", color: "#2563EB" },
  3: { label: "Tier 3", color: "#8E8E93" },
}

function getLogoUrl(name: string, url?: string): string {
  const overrides: Record<string, string> = {
    "bingx":          "https://logo.clearbit.com/bingx.com",
    "mexc":           "https://logo.clearbit.com/mexc.com",
    "gate.io":        "https://logo.clearbit.com/gate.io",
    "gate.io alpha":  "https://logo.clearbit.com/gate.io",
    "lbank":          "https://logo.clearbit.com/lbank.com",
    "moonshot":       "https://logo.clearbit.com/moonshot.money",
    "bitmart":        "https://logo.clearbit.com/bitmart.com",
    "bitrue":         "https://logo.clearbit.com/bitrue.com",
    "bitrue alpha":   "https://logo.clearbit.com/bitrue.com",
    "kcex":           "https://logo.clearbit.com/kcex.com",
    "bitkan":         "https://logo.clearbit.com/bitkan.com",
    "cex.io":         "https://logo.clearbit.com/cex.io",
    "kucoin":         "https://logo.clearbit.com/kucoin.com",
    "kucoin alpha":   "https://logo.clearbit.com/kucoin.com",
    "weex":           "https://logo.clearbit.com/weex.com",
    "coinmarketcap":  "https://logo.clearbit.com/coinmarketcap.com",
    "coingecko":      "https://logo.clearbit.com/coingecko.com",
    "bybit":          "https://logo.clearbit.com/bybit.com",
    "okx":            "https://logo.clearbit.com/okx.com",
    "okx.us":         "https://logo.clearbit.com/okx.com",
    "bitget":         "https://logo.clearbit.com/bitget.com",
    "crypto.com":     "https://logo.clearbit.com/crypto.com",
    "binance":        "https://logo.clearbit.com/binance.com",
    "coinbase":       "https://logo.clearbit.com/coinbase.com",
    "htx":            "https://logo.clearbit.com/htx.com",
  }
  const key = name.toLowerCase()
  if (overrides[key]) return overrides[key]
  if (url) {
    try {
      const domain = new URL(url).hostname.replace("www.", "")
      return `https://logo.clearbit.com/${domain}`
    } catch {}
  }
  return ""
}

const DEFAULT_EXCHANGES: Exchange[] = [
  { id:"1",  name:"BingX",         status:"listed",      tier:2, url:"https://bingx.com" },
  { id:"2",  name:"MEXC",          status:"listed",      tier:1, url:"https://mexc.com"  },
  { id:"3",  name:"Gate.io Alpha", status:"listed",      tier:1, url:"https://gate.io"   },
  { id:"4",  name:"LBank",         status:"listed",      tier:2, url:"https://lbank.com" },
  { id:"5",  name:"Moonshot",      status:"listed",      tier:2, url:"https://moonshot.money" },
  { id:"6",  name:"BitMart",       status:"listed",      tier:2, url:"https://bitmart.com" },
  { id:"7",  name:"Bitrue Alpha",  status:"listed",      tier:2, url:"https://bitrue.com" },
  { id:"8",  name:"KCEX",          status:"listed",      tier:3, url:"https://kcex.com" },
  { id:"9",  name:"BITKAN",        status:"listed",      tier:3, url:"https://bitkan.com" },
  { id:"10", name:"CEX.IO",        status:"listed",      tier:2, url:"https://cex.io" },
  { id:"11", name:"KuCoin Alpha",  status:"listed",      tier:1, url:"https://kucoin.com" },
  { id:"12", name:"WEEX",          status:"listed",      tier:2, url:"https://weex.com" },
  { id:"13", name:"CoinMarketCap", status:"listed",      tier:1, url:"https://coinmarketcap.com" },
  { id:"14", name:"CoinGecko",     status:"listed",      tier:1, url:"https://coingecko.com" },
  { id:"15", name:"Bybit",         status:"in-progress", tier:1, url:"https://bybit.com", note:"Application submitted" },
  { id:"16", name:"OKX.US",        status:"target",      tier:1, url:"https://okx.com" },
  { id:"17", name:"Bitget",        status:"target",      tier:1, url:"https://bitget.com" },
  { id:"18", name:"Crypto.com",    status:"target",      tier:1, url:"https://crypto.com" },
]

function ExchangeLogo({ name, url, size = 36 }: { name: string; url?: string; size?: number }) {
  const [err, setErr] = useState(false)
  const logoUrl = getLogoUrl(name, url)

  if (!logoUrl || err) {
    const initials = name.slice(0, 2).toUpperCase()
    const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360
    return (
      <div style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: `hsl(${hue}, 55%, 92%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.34, fontWeight: 800,
        color: `hsl(${hue}, 50%, 35%)`, flexShrink: 0,
      }}>{initials}</div>
    )
  }
  return (
    <img src={logoUrl} alt={name} width={size} height={size}
      style={{ borderRadius: size * 0.28, objectFit: "contain", background: "#fff", flexShrink: 0 }}
      onError={() => setErr(true)} />
  )
}

export function ExchangeTrackerCard() {
  const [exchanges,  setExchanges]  = useState<Exchange[]>(DEFAULT_EXCHANGES)
  const [addOpen,    setAddOpen]    = useState(false)
  const [name,       setName]       = useState("")
  const [url,        setUrl]        = useState("")
  const [status,     setStatus]     = useState<ExchangeStatus>("target")
  const [tier,       setTier]       = useState<1|2|3>(2)
  const [note,       setNote]       = useState("")
  const [filterSt,   setFilterSt]   = useState<ExchangeStatus | "all">("all")
  const [deleteMode, setDeleteMode] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_exchanges")
      if (s) setExchanges(JSON.parse(s))
      else   localStorage.setItem("67_exchanges", JSON.stringify(DEFAULT_EXCHANGES))
    } catch {}
  }, [])

  function save(exs: Exchange[]) {
    setExchanges(exs)
    localStorage.setItem("67_exchanges", JSON.stringify(exs))
  }

  function addExchange() {
    if (!name.trim()) return
    save([...exchanges, { id: Date.now().toString(), name: name.trim(), url: url || undefined, status, tier, note: note || undefined } as Exchange])
    setName(""); setUrl(""); setNote(""); setAddOpen(false)
  }

  const listed   = exchanges.filter(e => e.status === "listed")
  const progress = exchanges.filter(e => e.status === "in-progress")
  const targets  = exchanges.filter(e => e.status === "target")
  const filtered = filterSt === "all" ? exchanges : exchanges.filter(e => e.status === filterSt)
  const sorted   = [...filtered].sort((a,b) => a.tier - b.tier)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[
          { n: listed.length,   label:"Listed",   color:"#059669", bg:"rgba(5,150,105,0.08)" },
          { n: progress.length, label:"Progress", color:"#D97706", bg:"rgba(217,119,6,0.08)" },
          { n: targets.length,  label:"Targets",  color:"#2563EB", bg:"rgba(37,99,235,0.08)" },
        ].map(({ n, label, color, bg }) => (
          <div key={label} style={{ background: bg, borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
            <p style={{ fontSize:"1.75rem", fontWeight:900, color, lineHeight:1, margin:0 }}>{n}</p>
            <p style={{ fontSize:"0.5625rem", color, opacity:0.7, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Logo grid — listed */}
      <div>
        <p style={{ fontSize:"0.625rem", fontWeight:800, color:"#8E8E93", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
          Listed on {listed.length} Exchanges
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {listed.map(e => (
            <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer"
              title={e.name}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, textDecoration:"none" }}>
              <div style={{ width:48, height:48, borderRadius:13, border:"1.5px solid rgba(0,0,0,0.07)", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                <ExchangeLogo name={e.name} url={e.url} size={38} />
              </div>
              <span style={{ fontSize:"0.5rem", fontWeight:700, color:"#8E8E93", textAlign:"center", maxWidth:52, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* In-progress */}
      {progress.map(e => (
        <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(217,119,6,0.06)", borderRadius:12, border:"1px solid rgba(217,119,6,0.18)" }}>
          <ExchangeLogo name={e.name} url={e.url} size={32} />
          <div style={{ flex:1 }}>
            <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F", margin:0 }}>{e.name}</p>
            {e.note && <p style={{ fontSize:"0.75rem", color:"#8E8E93", margin:0 }}>{e.note}</p>}
          </div>
          <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#D97706", background:"rgba(217,119,6,0.1)", padding:"3px 9px", borderRadius:99 }}>⏳ In Progress</span>
        </div>
      ))}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Filter + Edit */}
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <div style={{ display:"flex", gap:4, flex:1 }}>
          {(["all", "listed", "in-progress", "target", "rejected"] as const).map(f => {
            const cnt = f === "all" ? exchanges.length : exchanges.filter(e => e.status === f).length
            const cfg = f === "all" ? null : STATUS_CONFIG[f]
            const active = filterSt === f
            return (
              <button key={f} onClick={() => setFilterSt(f)}
                style={{ flex:1, padding:"6px 4px", borderRadius:10, border:"none", cursor:"pointer",
                  background: active ? (cfg?.bg ?? "rgba(245,166,35,0.12)") : "#F4F4F5",
                  outline: active ? `1.5px solid ${cfg?.color ?? "#F5A623"}` : "none",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                <span style={{ fontSize:"0.8125rem", fontWeight:800, color: active ? (cfg?.color ?? "#F5A623") : "#1D1D1F" }}>{cnt}</span>
                <span style={{ fontSize:"0.45rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", color: active ? (cfg?.color ?? "#F5A623") : "#A1A1AA" }}>
                  {f === "all" ? "All" : f === "in-progress" ? "Progress" : f}
                </span>
              </button>
            )
          })}
        </div>
        <button onClick={() => setDeleteMode(d => !d)}
          style={{ padding:"6px 12px", borderRadius:10, border:"none", cursor:"pointer",
            background: deleteMode ? "rgba(239,68,68,0.1)" : "#F4F4F5",
            color: deleteMode ? "#EF4444" : "#8E8E93", fontSize:"0.75rem", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
          <Trash2 style={{ width:13, height:13 }} />{deleteMode ? "Done" : "Edit"}
        </button>
      </div>

      {/* Add form */}
      {!addOpen ? (
        <button onClick={() => setAddOpen(true)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", borderRadius:12,
            border:"1.5px dashed rgba(0,0,0,0.12)", background:"none", cursor:"pointer", width:"100%",
            color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
          <Plus style={{ width:14, height:14 }} /> Add exchange
        </button>
      ) : (
        <div style={{ background:"#FAFAFA", borderRadius:12, padding:14, display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", gap:6 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Exchange name" autoFocus
              style={{ flex:2, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#fff" }} />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
              style={{ flex:2, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#fff" }} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <select value={status} onChange={e => setStatus(e.target.value as ExchangeStatus)}
              style={{ flex:2, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#fff" }}>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
            <select value={tier} onChange={e => setTier(Number(e.target.value) as 1|2|3)}
              style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#fff" }}>
              <option value={1}>Tier 1</option><option value={2}>Tier 2</option><option value={3}>Tier 3</option>
            </select>
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notes (optional)"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#fff" }} />
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={addExchange} disabled={!name.trim()}
              style={{ flex:1, padding:"9px 0", borderRadius:8, border:"none", cursor: !name.trim() ? "not-allowed" : "pointer",
                background: !name.trim() ? "#E5E5EA" : "#059669", color: !name.trim() ? "#A1A1AA" : "#fff", fontSize:"0.875rem", fontWeight:700 }}>
              Add Exchange
            </button>
            <button onClick={() => { setAddOpen(false); setName(""); setUrl(""); setNote("") }}
              style={{ padding:"9px 16px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", background:"none", cursor:"pointer", fontSize:"0.875rem", color:"#8E8E93" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exchange list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {sorted.map(e => {
          const sc = STATUS_CONFIG[e.status]
          const tc = TIER_CONFIG[e.tier]
          return (
            <div key={e.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:14, background: sc.bg, border:`1px solid ${sc.color}22` }}>
              <div style={{ width:44, height:44, borderRadius:11, border:"1.5px solid rgba(0,0,0,0.07)", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                <ExchangeLogo name={e.name} url={e.url} size={34} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:1 }}>
                  <p style={{ fontSize:"0.9375rem", fontWeight:700, color:"#1D1D1F", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</p>
                  <span style={{ fontSize:"0.5625rem", fontWeight:800, color: tc.color, background:"rgba(0,0,0,0.05)", padding:"2px 6px", borderRadius:99, flexShrink:0 }}>{tc.label}</span>
                </div>
                {e.note && <p style={{ fontSize:"0.75rem", color:"#8E8E93", margin:0 }}>{e.note}</p>}
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ color:"#A1A1AA", display:"flex" }}>
                    <ExternalLink style={{ width:14, height:14 }} />
                  </a>
                )}
                <select value={e.status} onChange={ev => save(exchanges.map(ex => ex.id === e.id ? { ...ex, status: ev.target.value as ExchangeStatus } : ex))}
                  style={{ padding:"4px 7px", borderRadius:8, border:`1.5px solid ${sc.color}44`, outline:"none", fontSize:"0.625rem", fontFamily:"inherit", background:"#FFF", color: sc.color, fontWeight:800, cursor:"pointer" }}>
                  {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
                {deleteMode && (
                  <button onClick={() => save(exchanges.filter(ex => ex.id !== e.id))}
                    style={{ width:30, height:30, borderRadius:8, border:"none", cursor:"pointer", background:"rgba(239,68,68,0.1)", color:"#EF4444", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Trash2 style={{ width:13, height:13 }} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Exchange Tracker"
      subtitle={`${listed.length} Listed · ${progress.length} In Progress · ${targets.length} Targets`}
      icon={<Building2 style={{ width:16, height:16 }} />}
      accentColor="#059669"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
