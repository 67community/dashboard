"use client"

import { Bot } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

function ago(ts: string) {
  if (!ts || ts === "unknown") return "—"
  try {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s/60)}m`
    if (s < 86400) return `${Math.floor(s/3600)}h`
    return `${Math.floor(s/86400)}d`
  } catch { return "—" }
}

export function AgentStatusCard() {
  const { data } = useAppData()
  const bots = data?.agents ?? []
  const on = bots.filter(b => b.status === "green").length
  const allGood = on === bots.length && bots.length > 0

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      {/* Hero */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p className="hero-label" style={{ marginBottom:8 }}>Bots Active</p>
          <p className="hero-number">{bots.length === 0 ? "—" : `${on}/${bots.length}`}</p>
        </div>
        {bots.length > 0 && (
          <span className={allGood ? "badge-up" : "badge-down"} style={{ marginTop:6 }}>
            {allGood ? "All good ✓" : `${bots.length - on} offline`}
          </span>
        )}
      </div>

      {/* Bot list — clean, readable */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:18 }}>
        {bots.slice(0, 5).map(b => (
          <div key={b.name} style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span className={b.status === "green" ? "dot-on" : "dot-off"} />
            <span style={{ fontSize:"1rem", fontWeight:600, color:"#1D1D1F", flex:1 }}>{b.name}</span>
            <span style={{ fontSize:"0.75rem", color:"#8E8E93" }}>{ago(b.last_run)} ago</span>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <div style={{ background:"#ECFDF5", borderRadius:12, padding:"16px 16px" }}>
          <p style={{ fontSize:"2rem", fontWeight:800, color:"#059669", letterSpacing:"-0.04em", lineHeight:1 }}>{on}</p>
          <p style={{ fontSize:"0.6875rem", fontWeight:600, color:"#059669", opacity:0.65, marginTop:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>Running</p>
        </div>
        <div style={{ background: bots.length - on > 0 ? "#FEF2F2" : "#F4F4F5", borderRadius:12, padding:"16px 16px" }}>
          <p style={{ fontSize:"2rem", fontWeight:800, color: bots.length - on > 0 ? "#DC2626" : "#A1A1AA", letterSpacing:"-0.04em", lineHeight:1 }}>{bots.length - on}</p>
          <p style={{ fontSize:"0.6875rem", fontWeight:600, color: bots.length - on > 0 ? "#DC2626" : "#A1A1AA", opacity:0.65, marginTop:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>Offline</p>
        </div>
      </div>

      {/* Full bot list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {bots.map(b => (
          <div key={b.name} className="inset-cell" style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span className={b.status === "green" ? "dot-on" : "dot-off"} style={{ width:10, height:10 }} />
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#09090B" }}>{b.name}</p>
              <p style={{ fontSize:"0.75rem", color:"#A1A1AA", marginTop:2 }}>{b.schedule}</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:"0.75rem", fontWeight:700, color: b.status === "green" ? "#10B981" : "#EF4444" }}>
                {b.status === "green" ? "Running" : "Offline"}
              </p>
              <p style={{ fontSize:"0.6875rem", color:"#A1A1AA", marginTop:2 }}>{ago(b.last_run)} ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Agent Status"
      subtitle="Bots & Automation"
      icon={<Bot style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
