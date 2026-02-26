"use client"

import { useState, useEffect } from "react"
import { Building2, Plus, ExternalLink, Trash2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

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

export function ExchangeTrackerCard() {
  const [exchanges,  setExchanges]  = useState<Exchange[]>(DEFAULT_EXCHANGES)
  const [addOpen,    setAddOpen]    = useState(false)
  const [name,       setName]       = useState("")
  const [url,        setUrl]        = useState("")
  const [status,     setStatus]     = useState<ExchangeStatus>("target")
  const [tier,       setTier]       = useState<1|2|3>(2)
  const [note,       setNote]       = useState("")
  const [filterSt,   setFilterSt]   = useState<ExchangeStatus | "all">("all")

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
    save([...exchanges, {
      id: Date.now().toString(), name: name.trim(), url: url || undefined,
      status, tier, note: note || undefined, createdAt: new Date().toISOString(),
    } as Exchange])
    setName(""); setUrl(""); setNote(""); setAddOpen(false)
  }

  function updateStatus(id: string, st: ExchangeStatus) {
    save(exchanges.map(e => e.id === id ? { ...e, status: st } : e))
  }

  const listed   = exchanges.filter(e => e.status === "listed").length
  const progress = exchanges.filter(e => e.status === "in-progress").length
  const targets  = exchanges.filter(e => e.status === "target").length
  const filtered = filterSt === "all" ? exchanges : exchanges.filter(e => e.status === filterSt)
  const sorted   = [...filtered].sort((a,b) => a.tier - b.tier)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Stats */}
      <div style={{ display:"flex", gap:8 }}>
        {[
          { n: listed,   label: "Listed",   c: "#059669" },
          { n: progress, label: "Progress", c: "#D97706" },
          { n: targets,  label: "Targets",  c: "#2563EB" },
        ].map(({ n, label, c }) => (
          <div key={label} className="inset-cell" style={{ flex:1, textAlign:"center" }}>
            <p style={{ fontSize:"1.5rem", fontWeight:800, color: c, lineHeight:1 }}>{n}</p>
            <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
              textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* In-progress highlights */}
      {exchanges.filter(e => e.status === "in-progress").map(e => (
        <div key={e.id} className="inset-cell" style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:"1.25rem" }}>⏳</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F" }}>{e.name}</p>
            {e.note && <p style={{ fontSize:"0.75rem", color:"#8E8E93" }}>{e.note}</p>}
          </div>
          <span style={{ fontSize:"0.625rem", fontWeight:700, color: TIER_CONFIG[e.tier].color,
            background:"#F4F4F5", padding:"2px 8px", borderRadius:99 }}>
            {TIER_CONFIG[e.tier].label}
          </span>
        </div>
      ))}

      {/* Listed count */}
      <div onClick={e => e.stopPropagation()} style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:12 }}>
        <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
          textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Listed ({listed})</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {exchanges.filter(e => e.status === "listed").map(e => (
            <span key={e.id} style={{ fontSize:"0.75rem", fontWeight:600, color:"#059669",
              background:"rgba(5,150,105,0.08)", padding:"3px 10px", borderRadius:99 }}>
              {e.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Filter tabs */}
      <div style={{ display:"flex", gap:4 }}>
        {(["all", "listed", "in-progress", "target", "rejected"] as const).map(f => {
          const cnt = f === "all" ? exchanges.length : exchanges.filter(e => e.status === f).length
          const cfg = f === "all" ? null : STATUS_CONFIG[f]
          const active = filterSt === f
          return (
            <button key={f} onClick={() => setFilterSt(f)}
              style={{ flex:1, padding:"7px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: active ? (cfg?.bg ?? "#F5A62322") : "#F4F4F5",
                outline: active ? `1.5px solid ${cfg?.color ?? "#F5A623"}` : "none",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:"0.75rem", fontWeight:800,
                color: active ? (cfg?.color ?? "#F5A623") : "#1D1D1F" }}>{cnt}</span>
              <span style={{ fontSize:"0.45rem", fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.04em", color: active ? (cfg?.color ?? "#F5A623") : "#A1A1AA" }}>
                {f === "all" ? "All" : f === "in-progress" ? "Progress" : f}
              </span>
            </button>
          )
        })}
      </div>

      {/* Add */}
      {!addOpen ? (
        <button onClick={() => setAddOpen(true)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
            borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
            cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
          <Plus style={{ width:14, height:14 }} /> Add exchange
        </button>
      ) : (
        <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", gap:6 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Exchange name"
              style={{ flex:2, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL"
              style={{ flex:2, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <select value={status} onChange={e => setStatus(e.target.value as ExchangeStatus)}
              style={{ flex:2, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
            <select value={tier} onChange={e => setTier(Number(e.target.value) as 1|2|3)}
              style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
              <option value={1}>Tier 1</option>
              <option value={2}>Tier 2</option>
              <option value={3}>Tier 3</option>
            </select>
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notes (optional)"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={addExchange} disabled={!name.trim()}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                cursor: !name.trim() ? "not-allowed" : "pointer",
                background: !name.trim() ? "#E5E5EA" : "#F5A623",
                color: !name.trim() ? "#A1A1AA" : "#000", fontSize:"0.8125rem", fontWeight:700 }}>Add</button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {sorted.map(e => {
          const sc = STATUS_CONFIG[e.status]
          const tc = TIER_CONFIG[e.tier]
          return (
            <div key={e.id} className="inset-cell" style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:"1rem" }}>{sc.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F" }}>{e.name}</p>
                  <span style={{ fontSize:"0.5625rem", fontWeight:700, color: tc.color }}>{tc.label}</span>
                </div>
                {e.note && <p style={{ fontSize:"0.75rem", color:"#8E8E93" }}>{e.note}</p>}
              </div>
              <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer"
                    style={{ color:"#A1A1AA", display:"flex" }}>
                    <ExternalLink style={{ width:13, height:13 }} />
                  </a>
                )}
                <select value={e.status} onChange={ev => updateStatus(e.id, ev.target.value as ExchangeStatus)}
                  style={{ padding:"3px 6px", borderRadius:6, border:"1.5px solid rgba(0,0,0,0.1)",
                    outline:"none", fontSize:"0.625rem", fontFamily:"inherit", background:"#FFF",
                    color: sc.color, fontWeight:700 }}>
                  {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                    <option key={k} value={k}>{v.emoji} {v.label}</option>
                  ))}
                </select>
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
      subtitle="Listed · In Progress · Targets"
      icon={<Building2 style={{ width:16, height:16 }} />}
      accentColor="#059669"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
