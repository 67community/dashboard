"use client"

import { useEffect } from "react"
import { Twitter, Flame, BarChart2, Heart, MessageCircle } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

declare global {
  interface Window { twttr?: { widgets?: { load: () => void } } }
}

export function SocialPulseCard() {
  const { data } = useAppData()
  const s = data?.social_pulse

  // Load Twitter widgets after render
  useEffect(() => {
    if (typeof window !== "undefined" && window.twttr?.widgets) {
      window.twttr.widgets.load()
    }
  }, [s?.best_tweet_week?.embed_html, s?.best_tweet_2d?.embed_html])

  const followers = s?.twitter_followers ?? 0
  const engagement = s?.engagement_rate ?? 0
  const streak = s?.posting_streak_days ?? 0

  const collapsed = (
    <div className="space-y-3 mt-1">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            {followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : followers.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">X / Twitter Followers</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Engagement</p>
          <p className="text-sm font-semibold text-green-600">{engagement.toFixed(1)}%</p>
        </div>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2 border border-orange-100">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-medium text-orange-700">{streak} day posting streak 🔥</span>
        </div>
      )}
      {s?.best_tweet_week && (
        <div className="bg-sky-50 rounded-xl p-2.5 border border-sky-100">
          <p className="text-xs text-gray-500 line-clamp-2">{s.best_tweet_week.text.slice(0, 80)}...</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />{s.best_tweet_week.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-sky-400" />{s.best_tweet_week.replies}</span>
          </div>
        </div>
      )}
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Followers</p>
          <p className="text-xl font-bold text-gray-900">{followers.toLocaleString()}</p>
          {(s?.follower_change_24h ?? 0) !== 0 && (
            <p className={`text-xs font-medium mt-0.5 ${(s?.follower_change_24h ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
              {(s?.follower_change_24h ?? 0) >= 0 ? "+" : ""}{s?.follower_change_24h} today
            </p>
          )}
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Engagement</p>
          <p className="text-xl font-bold text-green-600">{engagement.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-0.5">avg/post</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <p className="text-xs text-orange-500 mb-1">Streak</p>
          <p className="text-xl font-bold text-orange-700">{streak}d 🔥</p>
        </div>
      </div>

      {/* Content type breakdown */}
      {s?.content_type_stats && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Best Content Type: <span className="text-amber-600 capitalize">{s.best_content_type?.replace("_", " ")}</span>
          </p>
          <div className="space-y-2">
            {Object.entries(s.content_type_stats).map(([type, stats]) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="text-gray-500 capitalize w-28">{type.replace("_", " ")}</span>
                <span className="text-gray-400">{stats.count} posts</span>
                <span className="font-semibold text-gray-700">{stats.avg_eng.toFixed(0)} avg eng</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best tweets */}
      {s?.best_tweet_week && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Best This Week</p>
          {s.best_tweet_week.embed_html ? (
            <div
              className="overflow-hidden rounded-2xl"
              dangerouslySetInnerHTML={{ __html: s.best_tweet_week.embed_html }}
            />
          ) : (
            <a href={s.best_tweet_week.tweet_url} target="_blank" rel="noopener noreferrer"
              className="block bg-sky-50 rounded-2xl p-4 border border-sky-100 hover:bg-sky-100 transition-colors">
              <p className="text-sm text-gray-700">{s.best_tweet_week.text}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>❤️ {s.best_tweet_week.likes}</span>
                <span>💬 {s.best_tweet_week.replies}</span>
                <span>{s.best_tweet_week.date}</span>
              </div>
            </a>
          )}
        </div>
      )}

      {s?.best_tweet_2d && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Trending 48h</p>
          {s.best_tweet_2d.embed_html ? (
            <div className="overflow-hidden rounded-2xl"
              dangerouslySetInnerHTML={{ __html: s.best_tweet_2d.embed_html }} />
          ) : (
            <a href={s.best_tweet_2d.tweet_url} target="_blank" rel="noopener noreferrer"
              className="block bg-sky-50 rounded-2xl p-4 border border-sky-100 hover:bg-sky-100 transition-colors">
              <p className="text-sm text-gray-700">{s.best_tweet_2d.text}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
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
      accentColor="#0EA5E9" collapsed={collapsed} expanded={expanded} />
  )
}
