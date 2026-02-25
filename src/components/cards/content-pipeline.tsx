"use client"

import { Calendar, Clock, CheckCircle2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

export function ContentPipelineCard() {
  const { data } = useAppData()
  const lastPost = data?.social_pulse?.best_tweet_week?.date ?? "—"

  const MIX = [
    { label:"Hype & price action",  pct:40, color:"#F5A623" },
    { label:"Community moments",    pct:30, color:"#5865F2" },
    { label:"Education / Threads",  pct:20, color:"#10B981" },
    { label:"Memes",                pct:10, color:"#1D9BF0" },
  ]

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      {/* Hero */}
      <div>
        <p className="hero-label" style={{ marginBottom:8 }}>Drafts in Queue</p>
        <p className="hero-number">0</p>
        <p style={{ fontSize:"0.875rem", color:"#8E8E93", marginTop:6 }}>Last post: {lastPost}</p>
      </div>

      {/* Sprint 3 notice */}
      <div style={{ display:"flex", alignItems:"center", gap:12, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:18 }}>
        <Calendar style={{ width:16, height:16, color:"#8B5CF6", flexShrink:0 }} />
        <p style={{ fontSize:"0.875rem", fontWeight:600, color:"#6D28D9" }}>
          AI pipeline launching Sprint 3
        </p>
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[
          { icon:<Clock style={{ width:14, height:14 }} />, label:"Queue",    value:"0",      sub:"drafts",   color:"#A1A1AA" },
          { icon:<CheckCircle2 style={{ width:14, height:14 }} />, label:"Approved", value:"0", sub:"ready", color:"#10B981" },
          { icon:<Calendar style={{ width:14, height:14 }} />, label:"Last Post", value:lastPost, sub:"", color:"#3B82F6" },
        ].map(s => (
          <div key={s.label} className="inset-cell" style={{ textAlign:"center" }}>
            <span style={{ color:s.color, display:"flex", justifyContent:"center", marginBottom:6 }}>{s.icon}</span>
            <p style={{ fontSize:"1.125rem", fontWeight:800, color:"#09090B", letterSpacing:"-0.03em" }}>{s.value}</p>
            <p className="metric-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* What's coming */}
      <div className="inset-cell-dark">
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <Calendar style={{ width:18, height:18, color:"#EC4899" }} />
          <p style={{ fontSize:"0.9375rem", fontWeight:700, color:"#fff" }}>Content Calendar</p>
        </div>
        <p style={{ fontSize:"0.8125rem", color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
          AI-generated drafts, approval queue, and post scheduling coming in Sprint 3.
          <br /><br />
          <strong style={{ color:"rgba(255,255,255,0.7)" }}>Nothing auto-publishes</strong> — human review required before any post goes live.
        </p>
      </div>

      {/* Content mix */}
      <div className="inset-cell">
        <p className="hero-label" style={{ marginBottom:16 }}>Planned Content Mix</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {MIX.map(x => (
            <div key={x.label}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#3F3F46" }}>{x.label}</span>
                <span style={{ fontSize:"0.8125rem", fontWeight:800, color:x.color }}>{x.pct}%</span>
              </div>
              <div className="prog-track" style={{ height:6 }}>
                <div className="prog-fill" style={{ height:6, width:`${x.pct}%`, background:x.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Content Pipeline"
      subtitle="Posts & Scheduling"
      icon={<Calendar style={{ width:16, height:16 }} />}
      accentColor="#EC4899"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
