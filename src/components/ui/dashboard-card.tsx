"use client"

import { useState, ReactNode } from "react"
import { X, Maximize2 } from "lucide-react"

interface Props {
  title: string
  subtitle?: string
  icon: ReactNode
  accentColor: string
  collapsed: ReactNode
  expanded: ReactNode
  className?: string
  liveTag?: boolean
  onOpen?: () => void
}

export function DashboardCard({
  title, subtitle, icon, accentColor, collapsed, expanded, className = "", liveTag, onOpen
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Grid tile ── */}
      <div
        onClick={() => { setOpen(true); onOpen?.() }}
        className={`mc-card mc-card-hover flex flex-col overflow-hidden select-none ${className}`}
      >
        {/* Accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}33)`, flexShrink: 0 }} />

        <div className="flex flex-col flex-1 gap-5" style={{ padding:"24px 26px 26px" }}>
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: `${accentColor}14` }}>
                <span style={{ color: accentColor, display:"flex" }}>{icon}</span>
              </div>
              <div>
                <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"#09090B", lineHeight:1 }}>{title}</p>
                {subtitle && <p style={{ fontSize:"0.6875rem", color:"#A1A1AA", marginTop:2 }}>{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {liveTag && (
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:"0.625rem", fontWeight:700, color:"#059669", background:"#ECFDF5", padding:"2px 8px", borderRadius:99 }}>
                  <span className="dot-on" style={{ width:6, height:6 }} />
                  LIVE
                </span>
              )}
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#F4F4F5", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Maximize2 style={{ width:12, height:12, color:"#A1A1AA" }} />
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="flex-1">{collapsed}</div>
        </div>
      </div>

      {/* ── Full detail modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)" }}
            onClick={() => setOpen(false)} />

          {/* Sheet */}
          <div
            className="anim-slide-up relative w-full sm:max-w-[560px] max-h-[88vh] flex flex-col"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Accent line */}
            <div style={{ height:3, background:`linear-gradient(90deg,${accentColor},${accentColor}33)`, flexShrink:0 }} />

            {/* Sheet header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid rgba(0,0,0,0.06)", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:11, background:`${accentColor}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:accentColor, display:"flex" }}>{icon}</span>
                </div>
                <div>
                  <p style={{ fontSize:"0.9375rem", fontWeight:700, color:"#09090B", lineHeight:1 }}>{title}</p>
                  {subtitle && <p style={{ fontSize:"0.75rem", color:"#A1A1AA", marginTop:3 }}>{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ width:32, height:32, borderRadius:"50%", background:"#F4F4F5", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
              >
                <X style={{ width:14, height:14, color:"#71717A" }} />
              </button>
            </div>

            {/* Content */}
            <div style={{ overflowY:"auto", flex:1, padding:24 }}>{expanded}</div>
          </div>
        </div>
      )}
    </>
  )
}
