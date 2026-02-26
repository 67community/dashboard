"use client"

import { useState, useEffect } from "react"
import { Target, Plus, Trash2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

interface PriceMilestone {
  id:          string
  label:       string
  targetPrice: number
  note?:       string
  hit:         boolean
  hitAt?:      string
  createdAt:   string
}

const DEFAULT_MILESTONES: PriceMilestone[] = [
  { id:"1", label:"1M Market Cap",   targetPrice:0.000001, note:"First major milestone",  hit:false, createdAt:"2026-01-01T00:00:00Z" },
  { id:"2", label:"10M Market Cap",  targetPrice:0.00001,  note:"Community celebration",  hit:false, createdAt:"2026-01-01T00:00:00Z" },
  { id:"3", label:"100M Market Cap", targetPrice:0.0001,   note:"Tier 1 exchange target", hit:false, createdAt:"2026-01-01T00:00:00Z" },
  { id:"4", label:"1B Market Cap",   targetPrice:0.001,    note:"The dream 🚀",           hit:false, createdAt:"2026-01-01T00:00:00Z" },
]

function fmt(p: number) {
  if (p < 0.00001) return `$${p.toFixed(9)}`
  if (p < 0.001)   return `$${p.toFixed(6)}`
  return `$${p.toFixed(4)}`
}

function pct(current: number, target: number) {
  if (target <= 0) return 0
  return Math.min((current / target) * 100, 100)
}

export function PriceMilestonesCard() {
  const { data, livePrice } = useAppData()
  const price = livePrice ?? data?.token_health?.price ?? 0

  const [milestones, setMilestones] = useState<PriceMilestone[]>(DEFAULT_MILESTONES)
  const [addOpen,    setAddOpen]    = useState(false)
  const [label,      setLabel]      = useState("")
  const [target,     setTarget]     = useState("")
  const [note,       setNote]       = useState("")

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_price_milestones")
      if (s) setMilestones(JSON.parse(s))
      else   localStorage.setItem("67_price_milestones", JSON.stringify(DEFAULT_MILESTONES))
    } catch {}
  }, [])

  // Auto-mark as hit
  useEffect(() => {
    if (!price) return
    const updated = milestones.map(m =>
      !m.hit && price >= m.targetPrice
        ? { ...m, hit: true, hitAt: new Date().toISOString() }
        : m
    )
    if (updated.some((m, i) => m.hit !== milestones[i].hit)) {
      setMilestones(updated)
      localStorage.setItem("67_price_milestones", JSON.stringify(updated))
    }
  }, [price, milestones])

  function save(ms: PriceMilestone[]) {
    setMilestones(ms)
    localStorage.setItem("67_price_milestones", JSON.stringify(ms))
  }

  function add() {
    if (!label.trim() || !target) return
    const tp = parseFloat(target)
    if (isNaN(tp) || tp <= 0) return
    save([...milestones, {
      id: Date.now().toString(), label: label.trim(),
      targetPrice: tp, note: note || undefined,
      hit: price >= tp,
      hitAt: price >= tp ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    }])
    setLabel(""); setTarget(""); setNote(""); setAddOpen(false)
  }

  const sorted   = [...milestones].sort((a,b) => a.targetPrice - b.targetPrice)
  const nextHit  = sorted.find(m => !m.hit)
  const hitCount = milestones.filter(m => m.hit).length

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Current price */}
      <div style={{ display:"flex", gap:8 }}>
        <div className="inset-cell" style={{ flex:1 }}>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
            textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Live Price</p>
          <p style={{ fontSize:"1.125rem", fontWeight:800, color:"#1D1D1F",
            letterSpacing:"-0.03em" }}>{price > 0 ? fmt(price) : "—"}</p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#F5A623", lineHeight:1 }}>
            {hitCount}/{milestones.length}
          </p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Hit</p>
        </div>
      </div>

      {/* Next target */}
      {nextHit && (
        <div style={{ background:"rgba(245,166,35,0.07)", border:"1.5px solid rgba(245,166,35,0.25)",
          borderRadius:12, padding:"12px 14px" }}>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#F5A623",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>🎯 Next Target</p>
          <p style={{ fontSize:"0.9375rem", fontWeight:800, color:"#1D1D1F" }}>{nextHit.label}</p>
          <p style={{ fontSize:"0.75rem", color:"#8E8E93", marginTop:2 }}>{fmt(nextHit.targetPrice)}</p>
          {price > 0 && (
            <>
              <div className="prog-track" style={{ height:6, marginTop:8 }}>
                <div className="prog-fill" style={{ height:6, width:`${pct(price, nextHit.targetPrice)}%`,
                  background:"#F5A623" }} />
              </div>
              <p style={{ fontSize:"0.6875rem", color:"#8E8E93", marginTop:4 }}>
                {pct(price, nextHit.targetPrice).toFixed(1)}% there · {fmt(nextHit.targetPrice - price)} away
              </p>
            </>
          )}
        </div>
      )}

      {/* Milestone list */}
      <div onClick={e => e.stopPropagation()}
        style={{ display:"flex", flexDirection:"column", gap:6, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:12 }}>
        {sorted.slice(0,4).map(m => (
          <div key={m.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"0.875rem" }}>{m.hit ? "✅" : "⬜"}</span>
            <span style={{ flex:1, fontSize:"0.8125rem", fontWeight: m.hit ? 500 : 600,
              color: m.hit ? "#A1A1AA" : "#1D1D1F",
              textDecoration: m.hit ? "line-through" : "none" }}>{m.label}</span>
            <span style={{ fontSize:"0.6875rem", color:"#8E8E93", fontFamily:"monospace" }}>
              {fmt(m.targetPrice)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {!addOpen ? (
        <button onClick={() => setAddOpen(true)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
            borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
            cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
          <Plus style={{ width:14, height:14 }} /> Add milestone
        </button>
      ) : (
        <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:8 }}>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Milestone name"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Target price (e.g. 0.00001)"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={add} disabled={!label.trim() || !target}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                cursor: !label.trim()||!target ? "not-allowed" : "pointer",
                background: !label.trim()||!target ? "#E5E5EA" : "#F5A623",
                color: !label.trim()||!target ? "#A1A1AA" : "#000",
                fontSize:"0.8125rem", fontWeight:700 }}>Add 🎯</button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {sorted.map(m => {
          const p = price > 0 ? pct(price, m.targetPrice) : 0
          return (
            <div key={m.id} className="inset-cell">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <p style={{ fontSize:"0.875rem", fontWeight:700, color: m.hit ? "#A1A1AA" : "#1D1D1F",
                    textDecoration: m.hit ? "line-through" : "none" }}>{m.label}</p>
                  {m.note && <p style={{ fontSize:"0.75rem", color:"#A1A1AA" }}>{m.note}</p>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#8E8E93",
                    fontFamily:"monospace" }}>{fmt(m.targetPrice)}</span>
                  <span style={{ fontSize:"1rem" }}>{m.hit ? "✅" : "⬜"}</span>
                  <button onClick={() => save(milestones.filter(x => x.id !== m.id))}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444",
                      padding:2, display:"flex" }}>
                    <Trash2 style={{ width:13, height:13 }} />
                  </button>
                </div>
              </div>
              {!m.hit && price > 0 && (
                <>
                  <div className="prog-track" style={{ height:6 }}>
                    <div className="prog-fill" style={{ height:6, width:`${p}%`, background:"#F5A623" }} />
                  </div>
                  <p style={{ fontSize:"0.6875rem", color:"#8E8E93", marginTop:4 }}>
                    {p.toFixed(1)}% · {fmt(m.targetPrice - price)} to go
                  </p>
                </>
              )}
              {m.hit && m.hitAt && (
                <p style={{ fontSize:"0.6875rem", color:"#059669" }}>
                  Hit on {new Date(m.hitAt).toLocaleDateString()} 🎉
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Price Milestones"
      subtitle="Targets · Progress · Celebrate"
      icon={<Target style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
