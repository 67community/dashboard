"use client"

import { Users, Wifi, UserPlus, MessageSquare, Send, ArrowUpRight } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

export function CommunityCard() {
  const { data } = useAppData()
  const c = data?.community
  const members = c?.discord_members ?? 0

  const collapsed = (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="metric-value">
            {members >= 1000 ? `${(members/1000).toFixed(1)}K` : members.toLocaleString()}
          </span>
          <p className="metric-label mt-1">Discord Members</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-2xl px-3 py-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full dot-green" />
          <span className="text-xs font-bold text-green-700">113 online</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "New 24h", v: c?.new_joins_24h ?? "—" },
          { l: "Active 7d", v: (c?.active_7d ?? 0) >= 1000 ? `${((c?.active_7d ?? 0)/1000).toFixed(1)}K` : (c?.active_7d ?? "—") },
          { l: "Telegram", v: (c?.telegram_members ?? 0) >= 1000 ? `${((c?.telegram_members ?? 0)/1000).toFixed(1)}K` : (c?.telegram_members ?? "—") },
        ].map((x) => (
          <div key={x.l} className="bg-[#F2EDE4] rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-[#0D0D0D]">{String(x.v)}</p>
            <p className="metric-label mt-0.5">{x.l}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Discord", v: members.toLocaleString(), icon: "💬", bg: "#EEF2FF", text: "#4338CA" },
          { l: "Online Now", v: "113", icon: "🟢", bg: "#ECFDF5", text: "#065F46" },
          { l: "New Joins 24h", v: String(c?.new_joins_24h ?? "—"), icon: "👋", bg: "#EFF6FF", text: "#1D4ED8" },
          { l: "Telegram", v: (c?.telegram_members ?? 0).toLocaleString(), icon: "✈️", bg: "#F0F9FF", text: "#0369A1" },
        ].map((x) => (
          <div key={x.l} className="rounded-2xl p-4" style={{ backgroundColor: x.bg }}>
            <p className="text-xl mb-1">{x.icon}</p>
            <p className="text-2xl font-black tracking-tight" style={{ color: x.text }}>{x.v}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: x.text, opacity: 0.7 }}>{x.l}</p>
          </div>
        ))}
      </div>

      {/* CG Watchlist */}
      <div className="bg-[#0D0D0D] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1">CoinGecko Watchlist</p>
          <p className="text-2xl font-black text-white tracking-tight">
            {(c?.watchlist_count ?? 0) >= 1000 ? `${((c?.watchlist_count ?? 0)/1000).toFixed(1)}K` : (c?.watchlist_count ?? 0).toLocaleString()}
          </p>
        </div>
        <p className="text-4xl">👀</p>
      </div>

      {/* Growth bar */}
      <div className="bg-[#F2EDE4] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="metric-label">Path to 10K Discord</p>
          <span className="text-sm font-black text-[#F5A623]">{((members / 10000) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[#DDD7CC] rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full gold-gradient transition-all duration-1000 relative overflow-hidden"
            style={{ width: `${Math.min((members / 10000) * 100, 100)}%` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>
        <p className="text-xs text-[#9A9082] mt-2 font-medium">{(10000 - members).toLocaleString()} to go</p>
      </div>

      <a href="https://discord.gg/67community" target="_blank" rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 w-fit bg-[#5865F2] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#4752C4] transition-colors">
        Open Discord <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </div>
  )

  return (
    <DashboardCard title="Community" icon={<Users className="w-4 h-4" />}
      accentColor="#5865F2" collapsed={collapsed} expanded={expanded} />
  )
}
