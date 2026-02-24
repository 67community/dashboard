"use client"

import { Trophy } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

const COLORS = ["#F5A623", "#6366f1", "#10b981", "#0EA5E9", "#8b5cf6"]

function fmt(label: string, val: number): string {
  if (label.includes("Cap") || label.includes("$")) {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
    return `$${val}`
  }
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return val.toLocaleString()
}

function fmtTarget(label: string, val: number): string {
  if (label.includes("Cap") || label.includes("$")) {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`
    return `$${val}`
  }
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return val.toLocaleString()
}

function pct(current: number, target: number): number {
  return Math.min((current / target) * 100, 100)
}

export function MilestonesCard() {
  const { data } = useAppData()
  const milestones = data?.milestones ?? []
  const recentWins = data?.recent_wins ?? []

  const top3 = milestones.slice(0, 3)

  const collapsed = (
    <div className="space-y-3 mt-2">
      {top3.length === 0 ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : top3.map((m, i) => (
        <div key={m.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 font-medium truncate max-w-[65%]">{m.label}</span>
            <span className="text-xs text-gray-400 tabular-nums">{pct(m.current, m.target).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct(m.current, m.target)}%`, backgroundColor: COLORS[i] }} />
          </div>
        </div>
      ))}
    </div>
  )

  const expanded = (
    <div className="space-y-4">
      {milestones.map((m, i) => (
        <div key={m.label} className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-800">{m.label}</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: COLORS[i % COLORS.length] }}>
              {pct(m.current, m.target).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct(m.current, m.target)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Current: <span className="font-medium text-gray-600">{fmt(m.label, m.current)}</span></span>
            <span>Target: <span className="font-medium text-gray-600">{fmtTarget(m.label, m.target)}</span></span>
          </div>
        </div>
      ))}

      {recentWins.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-sm font-semibold text-amber-700 mb-3">🏆 Recent Wins</p>
          <div className="space-y-2">
            {recentWins.map((win, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-amber-800 font-medium">{win.label}</span>
                <span className="text-amber-500">{new Date(win.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard title="Milestones" icon={<Trophy className="w-4 h-4" />}
      accentColor="#8b5cf6" collapsed={collapsed} expanded={expanded} />
  )
}
