"use client"

import { Bot } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

function ago(ts: string) {
  if (!ts || ts === "unknown") return "—"
  try {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s/60)}m`
    if (s < 86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`
  } catch { return "—" }
}

export function AgentStatusCard() {
  const { data } = useAppData()
  const bots = data?.agents ?? []
  const on = bots.filter(b => b.status === "green").length
  const allGood = on === bots.length && bots.length > 0

  const collapsed = (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="display-number">{bots.length === 0 ? "—" : `${on}/${bots.length}`}</p>
          <p className="display-label mt-1.5">Bots Active</p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${allGood ? "badge-up" : bots.length === 0 ? "" : "badge-down"}`}>
          {bots.length === 0 ? "Loading…" : allGood ? "All Systems Go ✓" : `${bots.length - on} Offline`}
        </div>
      </div>
      <div className="space-y-2.5">
        {bots.slice(0, 5).map(b => (
          <div key={b.name} className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${b.status === "green" ? "dot-live" : "dot-off"}`} />
            <span className="text-xs font-semibold text-[#374151] flex-1">{b.name}</span>
            <span className="text-xs text-[#9CA3AF] font-medium">{ago(b.last_run)}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl p-4" style={{ background: "#F0FDF4" }}>
          <p className="text-3xl font-black tracking-tight" style={{ color: "#15803D" }}>{on}</p>
          <p className="text-xs font-bold mt-0.5 tracking-widest uppercase" style={{ color: "#15803D", opacity: 0.7 }}>Running</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: bots.length - on > 0 ? "#FEF2F2" : "#F2F2F3" }}>
          <p className="text-3xl font-black tracking-tight" style={{ color: bots.length - on > 0 ? "#DC2626" : "#9CA3AF" }}>
            {bots.length - on}
          </p>
          <p className="text-xs font-bold mt-0.5 tracking-widest uppercase" style={{ color: bots.length - on > 0 ? "#DC2626" : "#9CA3AF", opacity: 0.7 }}>
            Offline
          </p>
        </div>
      </div>

      {/* Bot list */}
      {bots.map(b => (
        <div key={b.name} className="flex items-center gap-3.5 stat-pill">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${b.status === "green" ? "dot-live" : "dot-off"}`} />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#111110]">{b.name}</p>
            <p className="text-xs text-[#6B7280]">{b.schedule}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold" style={{ color: b.status === "green" ? "#34C759" : "#FF3B30" }}>
              {b.status === "green" ? "Running" : "Offline"}
            </p>
            <p className="text-xs text-[#9CA3AF]">{ago(b.last_run)} ago</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <DashboardCard title="Agent Status" subtitle="Bots & Automation"
      icon={<Bot className="w-[18px] h-[18px]" />}
      accentColor="#34C759" collapsed={collapsed} expanded={expanded} />
  )
}
