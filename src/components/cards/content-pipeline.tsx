"use client"

import { Calendar, Clock } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

export function ContentPipelineCard() {
  const { data } = useAppData()
  const s = data?.social_pulse

  const lastPost = s?.best_tweet_week?.date ?? "—"

  const collapsed = (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="metric-value">0</span>
          <p className="metric-label mt-1">Drafts in Queue</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#0D0D0D]">—</p>
          <p className="metric-label">Next Scheduled</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-[#F2EDE4] rounded-2xl px-4 py-2.5">
        <Clock className="w-3.5 h-3.5 text-[#9A9082]" />
        <span className="text-xs font-semibold text-[#7A7060]">Last post: {lastPost}</span>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Queue", v: "0", sub: "drafts" },
          { l: "Approved", v: "0", sub: "ready" },
          { l: "Last Post", v: lastPost, sub: "date" },
        ].map(x => (
          <div key={x.l} className="bg-[#F2EDE4] rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-[#0D0D0D]">{x.v}</p>
            <p className="metric-label mt-1">{x.l}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0D0D0D] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-white/40" />
          <p className="text-xs font-bold text-white/40 tracking-widest uppercase">Content Calendar</p>
        </div>
        <p className="text-sm text-white/60 leading-relaxed">
          AI content drafts, approval workflows, and scheduling coming in Sprint 3.
          Nothing auto-publishes — human review first, always.
        </p>
      </div>

      <div className="bg-[#F2EDE4] rounded-2xl p-4">
        <p className="metric-label mb-3.5">Planned Content Mix</p>
        {[
          { l: "Hype / Price action", v: 40, c: "#F5A623" },
          { l: "Community moments", v: 30, c: "#5865F2" },
          { l: "Education / Thread", v: 20, c: "#10B981" },
          { l: "Memes", v: 10, c: "#1D9BF0" },
        ].map(x => (
          <div key={x.l} className="mb-2.5">
            <div className="flex justify-between text-xs font-semibold text-[#7A7060] mb-1">
              <span>{x.l}</span><span>{x.v}%</span>
            </div>
            <div className="w-full bg-[#DDD7CC] rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${x.v}%`, backgroundColor: x.c }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard title="Content Pipeline" icon={<Calendar className="w-4 h-4" />}
      accentColor="#EC4899" collapsed={collapsed} expanded={expanded} />
  )
}
