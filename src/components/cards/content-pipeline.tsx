"use client"

import { Calendar } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

export function ContentPipelineCard() {
  const { data } = useAppData()
  const lastPost = data?.social_pulse?.best_tweet_week?.date ?? "—"

  const collapsed = (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="display-number">0</p>
          <p className="display-label mt-1.5">Drafts in Queue</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#1D1D1F]">{lastPost}</p>
          <p className="display-label">Last Post</p>
        </div>
      </div>
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#F5F5F7" }}>
        <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "#EC4899" }} />
        <p className="text-xs font-semibold" style={{ color: "#6E6E73" }}>
          AI content pipeline launching in Sprint 3
        </p>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { l: "Queue",    v: "0",       sub: "drafts" },
          { l: "Approved", v: "0",       sub: "ready"  },
          { l: "Last Post", v: lastPost, sub: ""       },
        ].map(x => (
          <div key={x.l} className="stat-pill text-center">
            <p className="text-2xl font-black text-[#1D1D1F] tracking-tight">{x.v}</p>
            <p className="display-label mt-1">{x.l}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5" style={{ background: "#1D1D1F" }}>
        <Calendar className="w-5 h-5 mb-3" style={{ color: "#EC4899" }} />
        <p className="text-sm font-bold text-white mb-1.5">Content Calendar</p>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
          AI-generated drafts, approval queue, and post scheduling coming in Sprint 3.
          Nothing auto-publishes — human review required before any post goes live.
        </p>
      </div>

      <div className="stat-pill">
        <p className="display-label mb-3.5">Planned Content Mix</p>
        {[
          { l: "Hype & price action",  v: 40, c: "#F5A623" },
          { l: "Community moments",    v: 30, c: "#5865F2" },
          { l: "Education / Threads",  v: 20, c: "#34C759" },
          { l: "Memes",                v: 10, c: "#1D9BF0" },
        ].map(x => (
          <div key={x.l} className="mb-3">
            <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: "#6E6E73" }}>
              <span>{x.l}</span><span>{x.v}%</span>
            </div>
            <div className="progress-track h-1.5">
              <div className="progress-fill h-1.5" style={{ width:`${x.v}%`, background:x.c }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard title="Content Pipeline" subtitle="Posts & Scheduling"
      icon={<Calendar className="w-[18px] h-[18px]" />}
      accentColor="#EC4899" collapsed={collapsed} expanded={expanded} />
  )
}
