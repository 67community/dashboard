"use client"

import { useEffect } from "react"
import { Twitter, Flame, BarChart2, Heart, MessageCircle, ArrowUpRight } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

declare global { interface Window { twttr?: { widgets?: { load: (el?: Element) => void } } } }

export function SocialPulseCard() {
  const { data } = useAppData()
  const s = data?.social_pulse
  const followers = s?.twitter_followers ?? 0
  const engagement = s?.engagement_rate ?? 0
  const streak = s?.posting_streak_days ?? 0

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.twttr?.widgets) {
        window.twttr.widgets.load()
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [s?.best_tweet_week?.tweet_id, s?.best_tweet_2d?.tweet_id])

  const collapsed = (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="metric-value">
            {followers >= 1000 ? `${(followers/1000).toFixed(1)}K` : followers.toLocaleString()}
          </span>
          <p className="metric-label mt-1">X / Twitter Followers</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-green-600 tracking-tight">{engagement.toFixed(1)}%</p>
          <p className="metric-label">Engagement</p>
        </div>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-700">{streak} day streak 🔥</span>
        </div>
      )}
      {s?.best_tweet_week && (
        <div className="bg-[#F2EDE4] rounded-2xl p-3.5">
          <p className="text-xs text-[#7A7060] font-medium line-clamp-2 leading-relaxed mb-2">
            {s.best_tweet_week.text.slice(0, 100)}…
          </p>
          <div className="flex items-center gap-3 text-xs text-[#9A9082] font-semibold">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />{s.best_tweet_week.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-400" />{s.best_tweet_week.replies}</span>
            <span className="ml-auto text-[#C8C0B4]">{s.best_tweet_week.date}</span>
          </div>
        </div>
      )}
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#F2EDE4] rounded-2xl p-4">
          <p className="metric-label mb-1.5">Followers</p>
          <p className="text-2xl font-black text-[#0D0D0D] tracking-tight">{followers.toLocaleString()}</p>
          {(s?.follower_change_24h ?? 0) !== 0 && (
            <p className={`text-xs font-bold mt-1 ${(s?.follower_change_24h ?? 0) > 0 ? "text-green-600" : "text-red-500"}`}>
              {(s?.follower_change_24h ?? 0) > 0 ? "+" : ""}{s?.follower_change_24h} today
            </p>
          )}
        </div>
        <div className="bg-[#F2EDE4] rounded-2xl p-4">
          <p className="metric-label mb-1.5">Engagement</p>
          <p className="text-2xl font-black text-green-600 tracking-tight">{engagement.toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #FEF3D0, #FDE9A0)" }}>
          <p className="metric-label mb-1.5 text-amber-700">Streak</p>
          <p className="text-2xl font-black text-amber-700 tracking-tight">{streak}d 🔥</p>
        </div>
      </div>

      {/* Content breakdown */}
      {s?.content_type_stats && (
        <div className="bg-[#F2EDE4] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="metric-label">Content Performance</p>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full capitalize">
              Best: {(s.best_content_type ?? "").replace("_", " ")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(s.content_type_stats).map(([type, stats]) => (
              <div key={type} className="bg-white rounded-xl px-3 py-2.5">
                <p className="text-xs font-semibold text-[#4A4035] capitalize">{type.replace("_", " ")}</p>
                <p className="text-sm font-bold text-[#0D0D0D] mt-0.5">{stats.avg_eng.toFixed(0)} <span className="text-[#9A9082] font-normal text-xs">avg eng</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tweet embeds */}
      {s?.best_tweet_week && (
        <div>
          <p className="metric-label mb-3">Best Tweet This Week</p>
          {s.best_tweet_week.embed_html ? (
            <div className="rounded-2xl overflow-hidden"
              dangerouslySetInnerHTML={{ __html: s.best_tweet_week.embed_html }} />
          ) : (
            <a href={s.best_tweet_week.tweet_url} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block bg-[#F2EDE4] rounded-2xl p-4 hover:bg-[#EDE8DF] transition-colors">
              <p className="text-sm text-[#0D0D0D] leading-relaxed">{s.best_tweet_week.text}</p>
              <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-[#9A9082]">
                <span>❤️ {s.best_tweet_week.likes}</span>
                <span>💬 {s.best_tweet_week.replies}</span>
                <span className="ml-auto flex items-center gap-1">View <ArrowUpRight className="w-3 h-3" /></span>
              </div>
            </a>
          )}
        </div>
      )}

      {s?.best_tweet_2d && (
        <div>
          <p className="metric-label mb-3">Trending 48h</p>
          {s.best_tweet_2d.embed_html ? (
            <div className="rounded-2xl overflow-hidden"
              dangerouslySetInnerHTML={{ __html: s.best_tweet_2d.embed_html }} />
          ) : (
            <a href={s.best_tweet_2d.tweet_url} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block bg-[#F2EDE4] rounded-2xl p-4 hover:bg-[#EDE8DF] transition-colors">
              <p className="text-sm text-[#0D0D0D] leading-relaxed">{s.best_tweet_2d.text}</p>
              <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-[#9A9082]">
                <span>❤️ {s.best_tweet_2d.likes}</span>
                <span>💬 {s.best_tweet_2d.replies}</span>
              </div>
            </a>
          )}
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard title="Social Pulse" icon={<BarChart2 className="w-4 h-4" />}
      accentColor="#1D9BF0" collapsed={collapsed} expanded={expanded} />
  )
}
