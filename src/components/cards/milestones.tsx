"use client"

import { Trophy } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

const COLORS = ["#F5A623","#5865F2","#34C759","#1D9BF0","#BF5AF2"]

function fv(label: string, v: number) {
  if (label.toLowerCase().includes("cap") || label.includes("$"))
    return v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : `$${(v/1e3).toFixed(0)}K`
  return v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(1)}K` : v.toLocaleString()
}

function pct(cur: number, tgt: number) { return Math.min((cur/tgt)*100, 100) }

export function MilestonesCard() {
  const { data } = useAppData()
  const ms = data?.milestones ?? []
  const wins = data?.recent_wins ?? []

  const collapsed = (
    <div className="space-y-4">
      {ms.length === 0
        ? [1,2,3].map(i => <div key={i} className="skeleton h-8 w-full" />)
        : ms.slice(0,3).map((m,i) => {
          const p = pct(m.current, m.target)
          return (
            <div key={m.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#3C3C43] truncate max-w-[65%]">{m.label}</span>
                <span className="text-xs font-black" style={{ color: COLORS[i] }}>{p.toFixed(0)}%</span>
              </div>
              <div className="progress-track h-2">
                <div className="progress-fill h-2" style={{ width:`${p}%`, background:COLORS[i] }} />
              </div>
            </div>
          )
        })
      }
    </div>
  )

  const expanded = (
    <div className="space-y-4">
      {ms.map((m,i) => {
        const p = pct(m.current, m.target)
        return (
          <div key={m.label} className="stat-pill">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold text-[#1D1D1F]">{m.label}</p>
              <span className="text-lg font-black" style={{ color: COLORS[i%COLORS.length] }}>{p.toFixed(0)}%</span>
            </div>
            <div className="progress-track h-3 mb-2.5">
              <div className="progress-fill h-3" style={{ width:`${p}%`, background:COLORS[i%COLORS.length] }} />
            </div>
            <div className="flex justify-between text-xs font-semibold text-[#8E8E93]">
              <span>{fv(m.label, m.current)} now</span>
              <span>{fv(m.label, m.target)} goal</span>
            </div>
          </div>
        )
      })}

      {wins.length > 0 && (
        <div className="rounded-2xl p-5 overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1D1D1F, #2D2D2F)" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ background: "radial-gradient(circle at 80% 20%, #F5A623, transparent)" }} />
          <p className="display-label text-white/40 mb-4">🏆 Recent Wins</p>
          <div className="space-y-3">
            {wins.map((w,i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{w.label}</span>
                <span className="text-xs text-white/30 font-medium">
                  {new Date(w.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard title="Milestones" subtitle="Goals & Achievements"
      icon={<Trophy className="w-[18px] h-[18px]" />}
      accentColor="#BF5AF2" collapsed={collapsed} expanded={expanded} />
  )
}
