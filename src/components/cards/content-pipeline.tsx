"use client"

import { Calendar, Clock, Plus, CheckCircle2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

export function ContentPipelineCard() {
  const collapsed = (
    <div className="space-y-3 mt-1">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-400 mt-0.5">Drafts in queue</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Next post</p>
          <p className="text-sm font-semibold text-gray-500">—</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
        <Clock className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">Last post: loading...</span>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Queue</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-400 mt-0.5">drafts</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">0</p>
          <p className="text-xs text-gray-400 mt-0.5">ready</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Posted</p>
          <p className="text-2xl font-bold text-gray-500">—</p>
          <p className="text-xs text-gray-400 mt-0.5">this week</p>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-amber-600" />
          <p className="text-sm font-semibold text-amber-700">Content Calendar</p>
        </div>
        <p className="text-sm text-amber-600">
          AI draft queue and post scheduling coming in Sprint 3. Nothing auto-publishes — all content goes through human review first.
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Content Breakdown</p>
        </div>
        <div className="space-y-2.5">
          {[
            { label: "Hype / Price", pct: 40, color: "#F5A623" },
            { label: "Community", pct: 30, color: "#6366f1" },
            { label: "Education", pct: 20, color: "#10b981" },
            { label: "Memes", pct: 10, color: "#0EA5E9" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{item.label}</span>
                <span>{item.pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Content Pipeline"
      icon={<Calendar className="w-4 h-4" />}
      accentColor="#ec4899"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
