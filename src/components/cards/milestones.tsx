"use client"

import { Trophy } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

const COLORS = ["#F5A623", "#5865F2", "#10B981", "#1D9BF0", "#8B5CF6"]

function fmtV(label: string, v: number) {
  if (label.toLowerCase().includes("cap") || label.includes("$")) {
    if (v >= 1e6) return `$${(v/1e6).toFixed(2)}M`
    if (v >= 1e3) return `$${(v/1e3).toFixed(0)}K`
    return `$${v}`
  }
  if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`
  return v.toLocaleString()
}

function pct(cur: number, tgt: number) { return Math.min((cur / tgt) * 100, 100) }

export function MilestonesCard() {
  const { data } = useAppData()
  const milestones = data?.milestones ?? []
  const wins = data?.recent_wins ?? []

  const collapsed = (
    <div className="space-y-3.5">
      {milestones.length === 0 ? (
        <div className="space-y-2.5">
          {[1,2,3].map(i => <div key={i} className="skeleton h-6 w-full" />)}
        </div>
      ) : milestones.slice(0, 3).map((m, i) => {
        const p = pct(m.current, m.target)
        return (
          <div key={m.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-[#4A4035] truncate max-w-[65%]">{m.label}</span>
              <span className="text-xs font-black" style={{ color: COLORS[i] }}>{p.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-[#DDD7CC] rounded-full h-2 overflow-hidden">
              <div className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${p}%`, backgroundColor: COLORS[i] }} />
            </div>
          </div>
        )
      })}
    </div>
  )

  const expanded = (
    <div className="space-y-4">
      {milestones.map((m, i) => {
        const p = pct(m.current, m.target)
        return (
          <div key={m.label} className="bg-[#F2EDE4] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-bold text-[#0D0D0D]">{m.label}</p>
              <span className="text-base font-black" style={{ color: COLORS[i % COLORS.length] }}>{p.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-[#DDD7CC] rounded-full h-3 overflow-hidden mb-2">
              <div className="h-3 rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${p}%`, backgroundColor: COLORS[i % COLORS.length] }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>
            <div className="flex justify-between text-xs font-semibold text-[#9A9082]">
              <span>{fmtV(m.label, m.current)} now</span>
              <span>{fmtV(m.label, m.target)} target</span>
            </div>
          </div>
        )
      })}

      {wins.length > 0 && (
        <div className="bg-[#0D0D0D] rounded-2xl p-5">
          <p className="text-xs font-bold text-white/40 tracking-widest uppercase mb-3">🏆 Recent Wins</p>
          <div className="space-y-2.5">
            {wins.map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{w.label}</span>
                <span className="text-xs text-white/40 font-medium">
                  {new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard title="Milestones" icon={<Trophy className="w-4 h-4" />}
      accentColor="#8B5CF6" collapsed={collapsed} expanded={expanded} />
  )
}
