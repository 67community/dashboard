"use client"

import { Users, Wifi, UserPlus, MessageSquare, Send } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

export function CommunityCard() {
  const { data } = useAppData()
  const c = data?.community

  const discordMembers = c?.discord_members ?? 0
  const onlineNow = 113 // from invite endpoint (widget not enabled)
  const newJoins = c?.new_joins_24h ?? 0
  const active7d = c?.active_7d ?? 0

  const collapsed = (
    <div className="space-y-3 mt-1">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            {discordMembers >= 1000 ? `${(discordMembers / 1000).toFixed(1)}K` : discordMembers.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Discord Members</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-xl px-2.5 py-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-green-700">{onlineNow} online</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">New Joins 24h</p>
          <p className="text-sm font-semibold text-gray-800">{newJoins || "—"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Active 7d</p>
          <p className="text-sm font-semibold text-gray-800">{active7d ? active7d.toLocaleString() : "—"}</p>
        </div>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Discord Members", value: discordMembers.toLocaleString(), icon: <Users className="w-4 h-4" />, color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
          { label: "Online Now", value: onlineNow.toString(), icon: <Wifi className="w-4 h-4" />, color: "bg-green-50 border-green-100 text-green-700" },
          { label: "New Joins 24h", value: newJoins?.toString() || "—", icon: <UserPlus className="w-4 h-4" />, color: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: "Open Tickets", value: c?.open_tickets?.toString() || "0", icon: <MessageSquare className="w-4 h-4" />, color: "bg-amber-50 border-amber-100 text-amber-700" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl p-4 border ${item.color}`}>
            <div className="mb-2 opacity-70">{item.icon}</div>
            <p className="text-2xl font-bold tabular-nums">{item.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Telegram + Watchlist */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-sky-500" />
            <p className="text-sm font-semibold text-sky-700">Telegram</p>
          </div>
          <p className="text-2xl font-bold text-sky-700">
            {(c?.telegram_members ?? 0) >= 1000
              ? `${((c?.telegram_members ?? 0) / 1000).toFixed(1)}K`
              : (c?.telegram_members ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-sky-400 mt-0.5">members</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-sm font-semibold text-purple-700 mb-2">CG Watchlist</p>
          <p className="text-2xl font-bold text-purple-700">
            {(c?.watchlist_count ?? 0) >= 1000
              ? `${((c?.watchlist_count ?? 0) / 1000).toFixed(1)}K`
              : (c?.watchlist_count ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-purple-400 mt-0.5">watching</p>
        </div>
      </div>

      {/* Growth progress */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
        <p className="text-sm font-semibold text-indigo-700 mb-2">Discord Growth Goal</p>
        <div className="flex items-center justify-between text-sm text-indigo-600 mb-2">
          <span>10,000 members</span>
          <span className="font-semibold">{((discordMembers / 10000) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-indigo-100 rounded-full h-2">
          <div className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((discordMembers / 10000) * 100, 100)}%` }} />
        </div>
        <p className="text-xs text-indigo-400 mt-2">{(10000 - discordMembers).toLocaleString()} to go</p>
      </div>

      <a href="https://discord.gg/67community" target="_blank" rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl text-xs font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 transition-colors w-fit">
        Discord Server ↗
      </a>
    </div>
  )

  return (
    <DashboardCard title="Community" icon={<Users className="w-4 h-4" />}
      accentColor="#6366f1" collapsed={collapsed} expanded={expanded} />
  )
}
