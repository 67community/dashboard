"use client"

import { Trophy } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

const COLORS = ["#F5A623","#5865F2","#10B981","#1D9BF0","#8B5CF6"]

function fmtV(label: string, v: number) {
  if (label.toLowerCase().includes("cap") || label.includes("$"))
    return v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : `$${(v/1e3).toFixed(0)}K`
  return v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(1)}K` : v.toLocaleString()
}

function pct(cur: number, tgt: number) { return Math.min((cur / tgt) * 100, 100) }

export function MilestonesCard() {
  const { data } = useAppData()
  const ms   = data?.milestones ?? []
  const wins = data?.recent_wins ?? []

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      <div>
        <p className="hero-label" style={{ marginBottom:8 }}>Goals Progress</p>
        <p className="hero-number">{ms.length === 0 ? "—" : `${ms.filter(m => pct(m.current, m.target) >= 100).length}/${ms.length}`}</p>
        <p style={{ fontSize:"0.875rem", color:"#8E8E93", marginTop:6, fontWeight:500 }}>goals complete</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:18 }}>
        {ms.length === 0
          ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:32 }} />)
          : ms.slice(0,3).map((m, i) => {
            const p = pct(m.current, m.target)
            return (
              <div key={m.label}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:"0.875rem", fontWeight:600, color:"#1D1D1F" }}>{m.label}</span>
                  <span style={{ fontSize:"0.875rem", fontWeight:700, color: COLORS[i] }}>{p.toFixed(0)}%</span>
                </div>
                <div className="prog-track" style={{ height:5 }}>
                  <div className="prog-fill" style={{ height:5, width:`${p}%`, background:COLORS[i] }} />
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {ms.map((m, i) => {
        const p = pct(m.current, m.target)
        return (
          <div key={m.label} className="inset-cell">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#09090B" }}>{m.label}</p>
              <span style={{ fontSize:"1.125rem", fontWeight:800, color:COLORS[i % COLORS.length] }}>{p.toFixed(0)}%</span>
            </div>
            <div className="prog-track" style={{ height:8, marginBottom:8 }}>
              <div className="prog-fill" style={{ height:8, width:`${p}%`, background:COLORS[i % COLORS.length] }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:"0.75rem", color:"#A1A1AA", fontWeight:500 }}>{fmtV(m.label, m.current)} now</span>
              <span style={{ fontSize:"0.75rem", color:"#A1A1AA", fontWeight:500 }}>{fmtV(m.label, m.target)} goal</span>
            </div>
          </div>
        )
      })}

      {/* Recent wins */}
      {wins.length > 0 && (
        <div className="inset-cell-dark">
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <Trophy style={{ width:16, height:16, color:"#F5A623" }} />
            <p className="hero-label" style={{ color:"rgba(255,255,255,0.35)", marginBottom:0 }}>Recent Wins</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {wins.map((w, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:"0.875rem", fontWeight:600, color:"#fff" }}>{w.label}</span>
                <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.3)", fontWeight:500 }}>
                  {new Date(w.date).toLocaleDateString("en-US", { month:"short", day:"numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Milestones"
      subtitle="Goals & Achievements"
      icon={<Trophy style={{ width:16, height:16 }} />}
      accentColor="#8B5CF6"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
