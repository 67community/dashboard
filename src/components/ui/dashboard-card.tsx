"use client"

import { useState, ReactNode } from "react"
import { X, Maximize2 } from "lucide-react"

interface DashboardCardProps {
  title: string
  icon: ReactNode
  accentColor?: string
  collapsed: ReactNode
  expanded: ReactNode
  className?: string
  badge?: string
}

export function DashboardCard({
  title, icon, accentColor = "#F5A623", collapsed, expanded, className = "", badge,
}: DashboardCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className={`mc-card cursor-pointer overflow-hidden group ${className}`}
        onClick={() => setOpen(true)}
      >
        {/* Top accent line */}
        <div className="h-[3px] w-full rounded-t-[20px]" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}18` }}>
                <span style={{ color: accentColor }} className="w-4 h-4">{icon}</span>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: accentColor }}>
                  {title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  {badge}
                </span>
              )}
              <Maximize2 className="w-3.5 h-3.5 text-[#C8C0B4] group-hover:text-[#9A9082] transition-colors" />
            </div>
          </div>

          {/* Content */}
          <div>{collapsed}</div>
        </div>
      </div>

      {/* Full modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col modal-enter shadow-2xl"
            style={{ background: "#FDFAF6", border: "1px solid #DDD7CC" }}>
            {/* Modal accent */}
            <div className="h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD7CC] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}18` }}>
                  <span style={{ color: accentColor }}>{icon}</span>
                </div>
                <h2 className="text-base font-bold text-[#0D0D0D] tracking-tight">{title}</h2>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-[#E8E2D8] hover:bg-[#DDD7CC] flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-[#7A7060]" />
              </button>
            </div>
            {/* Modal content */}
            <div className="overflow-y-auto flex-1 p-6">{expanded}</div>
          </div>
        </div>
      )}
    </>
  )
}
