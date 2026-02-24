"use client"

import { Users } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

export function CommunityCard() {
  const { data } = useAppData()
  const c = data?.community
  const m = c?.discord_members ?? 0

  const collapsed = (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="display-number">{m >= 1000 ? `${(m/1000).toFixed(1)}K` : m.toLocaleString()}</p>
          <p className="display-label mt-1.5">Discord Members</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl"
          style={{ background: "#E8FBF0" }}>
          <span className="dot-live w-2 h-2 inline-block" />
          <span className="text-xs font-bold" style={{ color: "#1A8743" }}>113 online</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "New 24h",   v: String(c?.new_joins_24h ?? "—") },
          { l: "Active 7d", v: (c?.active_7d ?? 0) >= 1000 ? `${((c?.active_7d??0)/1000).toFixed(1)}K` : String(c?.active_7d ?? "—") },
          { l: "Telegram",  v: (c?.telegram_members ?? 0) >= 1000 ? `${((c?.telegram_members??0)/1000).toFixed(1)}K` : String(c?.telegram_members ?? "—") },
        ].map(x => (
          <div key={x.l} className="stat-pill text-center">
            <p className="text-lg font-black text-[#1A1A18] tracking-tight">{x.v}</p>
            <p className="display-label mt-0.5">{x.l}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      {/* Big number */}
      <div className="rounded-2xl p-5 text-center"
        style={{ background: "linear-gradient(135deg, #5865F2, #7289DA)" }}>
        <p className="display-label text-white/50 mb-2">Discord Members</p>
        <p style={{ fontSize: "3.5rem", fontWeight: 900, color: "white", letterSpacing: "-0.05em", lineHeight: 1 }}>
          {m >= 1000 ? `${(m/1000).toFixed(1)}K` : m.toLocaleString()}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <span className="dot-live w-2.5 h-2.5 inline-block" style={{ background: "#43B581" }} />
          <span className="text-sm font-semibold text-white/80">113 members online now</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { l: "New Joins 24h",  v: String(c?.new_joins_24h ?? "—"),  bg: "#EFF6FF", tc: "#1D4ED8" },
          { l: "Active 7d",      v: (c?.active_7d??0).toLocaleString(), bg: "#F0FDF4", tc: "#15803D" },
          { l: "Telegram",       v: (c?.telegram_members??0).toLocaleString(), bg: "#F0F9FF", tc: "#0369A1" },
          { l: "CG Watchlist",   v: (c?.watchlist_count??0).toLocaleString(), bg: "#FFF7ED", tc: "#C2410C" },
        ].map(x => (
          <div key={x.l} className="rounded-2xl p-4" style={{ background: x.bg }}>
            <p className="text-2xl font-black tracking-tight" style={{ color: x.tc }}>{x.v}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: x.tc, opacity: 0.7 }}>{x.l}</p>
          </div>
        ))}
      </div>

      {/* Growth bar */}
      <div className="stat-pill">
        <div className="flex justify-between items-center mb-3">
          <p className="display-label">Goal: 10,000 Discord Members</p>
          <span className="text-sm font-black" style={{ color: "#5865F2" }}>{((m/10000)*100).toFixed(1)}%</span>
        </div>
        <div className="progress-track h-3">
          <div className="progress-fill h-3" style={{ width: `${Math.min((m/10000)*100,100)}%`, background: "linear-gradient(90deg, #5865F2, #7289DA)" }} />
        </div>
        <p className="text-xs text-[#7A7570] mt-2">{(10000-m).toLocaleString()} members to go</p>
      </div>
    </div>
  )

  return (
    <DashboardCard title="Community" subtitle="Discord · Telegram"
      icon={<Users className="w-[18px] h-[18px]" />}
      accentColor="#5865F2" collapsed={collapsed} expanded={expanded} />
  )
}
