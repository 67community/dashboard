"use client"

import { Twitter, Flame, BarChart2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { SOCIAL_PULSE } from "@/lib/mock-data"

export function SocialPulseCard() {
  const s = SOCIAL_PULSE

  const collapsed = (
    <div className="space-y-3 mt-1">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            {s.followers >= 1000 ? `${(s.followers / 1000).toFixed(1)}K` : s.followers}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">X / Twitter Followers</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Engagement</p>
          <p className="text-sm font-semibold text-green-600">{s.engagementRate}%</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2 border border-orange-100">
        <Flame className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-xs font-medium text-orange-700">{s.postingStreak} day posting streak</span>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Followers</p>
          <p className="text-xl font-bold text-gray-900">{s.followers.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Engagement</p>
          <p className="text-xl font-bold text-green-600">{s.engagementRate}%</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <p className="text-xs text-orange-500 mb-1">Streak</p>
          <p className="text-xl font-bold text-orange-700">{s.postingStreak}d 🔥</p>
        </div>
      </div>

      <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
        <div className="flex items-center gap-2 mb-3">
          <Twitter className="w-4 h-4 text-sky-500" />
          <p className="text-sm font-semibold text-sky-700">Best Tweet This Week</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Tweet data loads from the data pipeline. Run update-data.py to fetch the latest from @67coinX.
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Quick Links</p>
        <div className="flex gap-2">
          <a
            href="https://twitter.com/67coinX"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 bg-white rounded-xl text-xs font-medium text-gray-700 hover:text-sky-600 hover:bg-sky-50 border border-gray-200 transition-colors"
          >
            @67coinX ↗
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Social Pulse"
      icon={<BarChart2 className="w-4 h-4" />}
      accentColor="#0EA5E9"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
