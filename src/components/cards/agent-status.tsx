"use client"

import { Bot } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

function ago(ts: string): string {
  if (!ts || ts === "unknown") return "—"
  try {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s/60)}m`
    if (s < 86400) return `${Math.floor(s/3600)}h`
    return `${Math.floor(s/86400)}d`
  } catch { return "—" }
}

export function AgentStatusCard() {
  const { data } = useAppData()
  const bots = data?.agents ?? []
  const on = bots.filter(b => b.status === "green").length
  const total = bots.length
  const allGood = on === total && total > 0

  const collapsed = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-end gap-2">
            <span className="metric-value">{total === 0 ? "—" : `${on}/${total}`}</span>
          </div>
          <p className="metric-label mt-1">Bots Active</p>
        </div>
        <div className={`px-3 py-1.5 rounded-2xl text-xs font-bold ${allGood ? "bg-green-100 text-green-700" : total === 0 ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-600"}`}>
          {total === 0 ? "Loading" : allGood ? "All Systems Go ✓" : `${total - on} Offline`}
        </div>
      </div>
      <div className="space-y-2">
        {bots.slice(0, 5).map((b) => (
          <div key={b.name} className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${b.status === "green" ? "bg-green-400 dot-green" : "bg-red-400"}`} />
            <span className="text-xs text-[#4A4035] font-medium flex-1">{b.name}</span>
            <span className="text-xs text-[#C8C0B4] font-medium">{ago(b.last_run)}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <p className="text-3xl font-black text-green-700">{on}</p>
          <p className="text-xs font-bold text-green-600 mt-0.5 tracking-widest uppercase">Running</p>
        </div>
        <div className={`rounded-2xl p-4 border ${total - on > 0 ? "bg-red-50 border-red-200" : "bg-[#F2EDE4] border-[#DDD7CC]"}`}>
          <p className={`text-3xl font-black ${total - on > 0 ? "text-red-600" : "text-[#C8C0B4]"}`}>{total - on}</p>
          <p className={`text-xs font-bold mt-0.5 tracking-widest uppercase ${total - on > 0 ? "text-red-500" : "text-[#C8C0B4]"}`}>Offline</p>
        </div>
      </div>

      {/* Bot list */}
      <div className="space-y-2">
        {bots.map((b) => (
          <div key={b.name} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-[#EDE8DF]">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${b.status === "green" ? "bg-green-400 dot-green" : "bg-red-400"}`} />
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0D0D0D]">{b.name}</p>
              <p className="text-xs text-[#9A9082]">{b.schedule}</p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-bold ${b.status === "green" ? "text-green-600" : "text-red-500"}`}>
                {b.status === "green" ? "● Running" : "● Offline"}
              </p>
              <p className="text-xs text-[#C8C0B4]">{ago(b.last_run)} ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard title="Agent Status" icon={<Bot className="w-4 h-4" />}
      accentColor="#10B981" collapsed={collapsed} expanded={expanded}
      badge={allGood ? "ALL GO" : undefined} />
  )
}
