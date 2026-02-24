"use client"

import { Users, Wifi, UserPlus, MessageSquare } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { COMMUNITY_STATS } from "@/lib/mock-data"

export function CommunityCard() {
  const c = COMMUNITY_STATS

  const collapsed = (
    <div className="space-y-3 mt-1">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            {c.discordMembers >= 1000 ? `${(c.discordMembers / 1000).toFixed(1)}K` : c.discordMembers}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Discord Members</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-xl px-2.5 py-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-green-700">{c.onlineNow} online</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">New Joins 24h</p>
          <p className="text-sm font-semibold text-gray-700">{c.newJoins24h || "—"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Open Tickets</p>
          <p className="text-sm font-semibold text-gray-700">{c.openTickets || "—"}</p>
        </div>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Members", value: c.discordMembers.toLocaleString(), icon: <Users className="w-4 h-4" />, color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
          { label: "Online Now", value: c.onlineNow.toString(), icon: <Wifi className="w-4 h-4" />, color: "bg-green-50 border-green-100 text-green-700" },
          { label: "New Joins 24h", value: c.newJoins24h?.toString() || "—", icon: <UserPlus className="w-4 h-4" />, color: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: "Open Tickets", value: c.openTickets?.toString() || "—", icon: <MessageSquare className="w-4 h-4" />, color: "bg-amber-50 border-amber-100 text-amber-700" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl p-4 border ${item.color}`}>
            <div className="mb-2 opacity-70">{item.icon}</div>
            <p className="text-2xl font-bold tabular-nums">{item.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
        <p className="text-sm font-semibold text-indigo-700 mb-2">Growth Goal</p>
        <div className="flex items-center justify-between text-sm text-indigo-600 mb-2">
          <span>5,000 members by end of March</span>
          <span className="font-semibold">{((c.discordMembers / 5000) * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-indigo-100 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((c.discordMembers / 5000) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-indigo-400 mt-2">{(5000 - c.discordMembers).toLocaleString()} members to go</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Quick Links</p>
        <div className="flex gap-2">
          <a
            href="https://discord.gg/67community"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 bg-white rounded-xl text-xs font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 transition-colors"
          >
            Discord Server ↗
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Community"
      icon={<Users className="w-4 h-4" />}
      accentColor="#6366f1"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
