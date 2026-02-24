"use client"

import { Bot, CheckCircle2, XCircle } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

function timeAgo(ts: string): string {
  if (!ts || ts === "unknown") return "unknown"
  try {
    const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (secs < 60) return `${secs}s ago`
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
    return `${Math.floor(secs / 86400)}d ago`
  } catch { return ts }
}

export function AgentStatusCard() {
  const { data } = useAppData()
  const bots = data?.agents ?? []
  const running = bots.filter((b) => b.status === "green").length

  const collapsed = (
    <div className="space-y-2.5 mt-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-500">{running}/{bots.length} bots active</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          running === bots.length && bots.length > 0
            ? "bg-green-50 text-green-700"
            : running === 0 && bots.length > 0
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700"
        }`}>
          {bots.length === 0 ? "Loading..." : running === bots.length ? "All Systems Go" : `${bots.length - running} offline`}
        </span>
      </div>
      {bots.slice(0, 5).map((bot) => (
        <div key={bot.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${bot.status === "green" ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-xs text-gray-600">{bot.name}</span>
          </div>
          <span className="text-xs text-gray-400">{timeAgo(bot.last_run)}</span>
        </div>
      ))}
    </div>
  )

  const expanded = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-700">{running}</p>
          <p className="text-xs text-green-600 mt-0.5">Running</p>
        </div>
        <div className={`rounded-2xl p-4 border ${bots.length - running > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
          <XCircle className={`w-5 h-5 mb-2 ${bots.length - running > 0 ? "text-red-400" : "text-gray-300"}`} />
          <p className={`text-2xl font-bold ${bots.length - running > 0 ? "text-red-700" : "text-gray-400"}`}>
            {bots.length - running}
          </p>
          <p className={`text-xs mt-0.5 ${bots.length - running > 0 ? "text-red-600" : "text-gray-400"}`}>Offline</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
        {bots.map((bot) => (
          <div key={bot.name} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${
                bot.status === "green"
                  ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.4)]"
                  : "bg-red-400"
              }`} />
              <div>
                <p className="text-sm font-semibold text-gray-800">{bot.name}</p>
                <p className="text-xs text-gray-400">{bot.schedule}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium ${bot.status === "green" ? "text-green-600" : "text-red-500"}`}>
                {bot.status === "green" ? "Running" : "Offline"}
              </p>
              <p className="text-xs text-gray-400">{timeAgo(bot.last_run)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard title="Agent Status" icon={<Bot className="w-4 h-4" />}
      accentColor="#10b981" collapsed={collapsed} expanded={expanded} />
  )
}
