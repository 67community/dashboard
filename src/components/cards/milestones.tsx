"use client"

import { Trophy, CheckCircle2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { MILESTONES } from "@/lib/mock-data"
import { Milestone } from "@/lib/types"

function fmtVal(m: Milestone): string {
  if (m.unit === "USD") {
    const v = m.current
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
    return `$${v}`
  }
  if (m.unit === "rank") return `#${m.current.toLocaleString()}`
  if (m.current >= 1_000) return `${(m.current / 1_000).toFixed(1)}K`
  return m.current.toString()
}

function fmtTarget(m: Milestone): string {
  if (m.unit === "USD") {
    const v = m.target
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`
    return `$${v}`
  }
  if (m.unit === "rank") return `Top ${m.target}`
  if (m.target >= 1_000) return `${(m.target / 1_000).toFixed(0)}K`
  return m.target.toString()
}

function pct(m: Milestone): number {
  if (m.unit === "rank") {
    // Lower is better for rank
    const worstRank = 5000
    return Math.min(((worstRank - m.current) / (worstRank - m.target)) * 100, 100)
  }
  return Math.min((m.current / m.target) * 100, 100)
}

const COLORS = ["#F5A623", "#6366f1", "#10b981", "#0EA5E9", "#8b5cf6"]

export function MilestonesCard() {
  const top3 = MILESTONES.slice(0, 3)

  const collapsed = (
    <div className="space-y-3 mt-2">
      {top3.map((m, i) => (
        <div key={m.id}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 font-medium truncate max-w-[60%]">{m.title}</span>
            <span className="text-xs text-gray-400 tabular-nums">{pct(m).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct(m)}%`, backgroundColor: COLORS[i] }}
            />
          </div>
        </div>
      ))}
    </div>
  )

  const expanded = (
    <div className="space-y-4">
      {MILESTONES.map((m, i) => (
        <div key={m.id} className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {m.achieved ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" style={{ borderColor: COLORS[i % COLORS.length] }} />
              )}
              <span className="text-sm font-semibold text-gray-800">{m.title}</span>
            </div>
            <span className="text-sm font-bold tabular-nums" style={{ color: COLORS[i % COLORS.length] }}>
              {pct(m).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct(m)}%`, backgroundColor: COLORS[i % COLORS.length] }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Current: <span className="font-medium text-gray-600">{fmtVal(m)}</span></span>
            <span>Target: <span className="font-medium text-gray-600">{fmtTarget(m)}</span></span>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <DashboardCard
      title="Milestones"
      icon={<Trophy className="w-4 h-4" />}
      accentColor="#8b5cf6"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
