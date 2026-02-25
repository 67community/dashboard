"use client"

import { Users } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

export function CommunityCard() {
  const { data } = useAppData()
  const c = data?.community
  const members = c?.discord_members ?? 0
  const fmtM = members >= 1000 ? `${(members/1000).toFixed(1)}K` : members.toLocaleString()
  const goal = 10000
  const pct = Math.min((members / goal) * 100, 100)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      {/* Hero */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p className="hero-label" style={{ marginBottom:8 }}>Discord Members</p>
          <p className="hero-number">{fmtM}</p>
        </div>
        <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#E8F8EE", padding:"6px 12px", borderRadius:99, marginTop:4 }}>
          <span className="dot-on" style={{ width:7, height:7 }} />
          <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#1A8343" }}>113 online</span>
        </span>
      </div>

      {/* Stats — inset-cell grey boxes */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:16 }}>
        {[
          { label:"New 24h",   value: String(c?.new_joins_24h ?? "—") },
          { label:"Active 7d", value: (c?.active_7d ?? 0) >= 1000 ? `${((c?.active_7d??0)/1000).toFixed(1)}K` : String(c?.active_7d ?? "—") },
          { label:"Telegram",  value: (c?.telegram_members ?? 0) >= 1000 ? `${((c?.telegram_members??0)/1000).toFixed(1)}K` : String(c?.telegram_members ?? "—") },
        ].map(s => (
          <div key={s.label} className="inset-cell" style={{ textAlign:"center" }}>
            <p style={{ fontSize:"1.25rem", fontWeight:700, letterSpacing:"-0.03em", color:"#1D1D1F", margin:0 }}>{s.value}</p>
            <p style={{ fontSize:"0.6875rem", fontWeight:500, color:"#8E8E93", marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Big Discord block */}
      <div style={{ background:"linear-gradient(135deg, #5865F2, #7289DA)", borderRadius:16, padding:"24px 20px", textAlign:"center" }}>
        <p className="hero-label" style={{ color:"rgba(255,255,255,0.5)", marginBottom:10 }}>Discord Members</p>
        <p style={{ fontSize:"4rem", fontWeight:900, color:"#fff", letterSpacing:"-0.055em", lineHeight:1 }}>{fmtM}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:10 }}>
          <span className="dot-on" style={{ background:"#43B581" }} />
          <span style={{ fontSize:"0.875rem", fontWeight:600, color:"rgba(255,255,255,0.75)" }}>113 members online</span>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          { label:"New Joins 24h", value: String(c?.new_joins_24h ?? "—"), bg:"#EFF6FF", color:"#2563EB" },
          { label:"Active 7d",     value: (c?.active_7d??0).toLocaleString(), bg:"#ECFDF5", color:"#059669" },
          { label:"Telegram",      value: (c?.telegram_members??0).toLocaleString(), bg:"#F0F9FF", color:"#0284C7" },
          { label:"CG Watchlist",  value: (c?.watchlist_count??0).toLocaleString(), bg:"#FFF7ED", color:"#EA580C" },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.04em", color:s.color, lineHeight:1 }}>{s.value}</p>
            <p style={{ fontSize:"0.6875rem", fontWeight:600, color:s.color, opacity:0.65, marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Goal progress */}
      <div className="inset-cell">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <p className="hero-label">Goal: 10,000 Members</p>
          <span style={{ fontSize:"0.875rem", fontWeight:800, color:"#5865F2" }}>{pct.toFixed(1)}%</span>
        </div>
        <div className="prog-track" style={{ height:10 }}>
          <div className="prog-fill" style={{ height:10, width:`${pct}%`, background:"linear-gradient(90deg,#5865F2,#7289DA)" }} />
        </div>
        <p style={{ fontSize:"0.75rem", color:"#A1A1AA", marginTop:8 }}>
          {(goal - members).toLocaleString()} members to go
        </p>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Community"
      subtitle="Discord · Telegram"
      icon={<Users style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
