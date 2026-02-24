"use client"

import { useState, ReactNode } from "react"
import { X } from "lucide-react"

interface Props {
  title: string
  subtitle?: string
  icon: ReactNode
  accentColor: string
  collapsed: ReactNode
  expanded: ReactNode
  className?: string
  liveTag?: boolean
}

export function DashboardCard({ title, subtitle, icon, accentColor, collapsed, expanded, className = "", liveTag }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Grid card ── */}
      <div
        className={`apple-card apple-card-clickable overflow-hidden ${className}`}
        onClick={() => setOpen(true)}
      >
        {/* Thin top accent */}
        <div className="h-[2.5px]" style={{ background: `linear-gradient(90deg, ${accentColor}CC, ${accentColor}44)` }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-2.5">
              {/* Icon blob */}
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
                style={{ background: `${accentColor}18` }}>
                <span style={{ color: accentColor }} className="flex items-center justify-center w-[18px] h-[18px]">
                  {icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold leading-none" style={{ color: "#1A1A18" }}>{title}</p>
                {subtitle && <p className="text-xs mt-0.5" style={{ color: "#7A7570" }}>{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {liveTag && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: "#1A6E3F", background: "#E6F7ED" }}>
                  <span className="dot-live w-1.5 h-1.5 inline-block" />
                  LIVE
                </span>
              )}
              <div className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(120,95,60,0.08)" }}>
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" style={{ color: "#7A7570" }}>
                  <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          {collapsed}
        </div>
      </div>

      {/* ── Full-screen sheet modal ── */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Sheet — warm cream */}
          <div
            className="relative w-full sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden modal-sheet"
            style={{
              background: "#FAF7F2",
              borderRadius: "24px",
              boxShadow: "0 8px 60px rgba(100,75,40,0.18), 0 0 0 1px rgba(120,95,60,0.08)",
            }}>

            {/* Top accent */}
            <div className="h-[3px] flex-shrink-0" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)` }} />

            {/* Sheet header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(120,95,60,0.09)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: `${accentColor}18` }}>
                  <span style={{ color: accentColor }}>{icon}</span>
                </div>
                <div>
                  <h2 className="text-base font-bold leading-none" style={{ color: "#1A1A18" }}>{title}</h2>
                  {subtitle && <p className="text-xs mt-0.5" style={{ color: "#7A7570" }}>{subtitle}</p>}
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(120,95,60,0.08)" }}>
                <X className="w-3.5 h-3.5" style={{ color: "#7A7570" }} />
              </button>
            </div>

            {/* Sheet content */}
            <div className="overflow-y-auto flex-1 p-6">{expanded}</div>
          </div>
        </div>
      )}
    </>
  )
}
