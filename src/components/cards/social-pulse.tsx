"use client"

import { useEffect } from "react"
import { BarChart2, Flame, Heart, MessageCircle } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

declare global { interface Window { twttr?: { widgets?: { load: () => void } } } }

export function SocialPulseCard() {
  const { data } = useAppData()
  const s = data?.social_pulse
  const followers = s?.twitter_followers ?? 0
  const engagement = s?.engagement_rate ?? 0
  const streak = s?.posting_streak_days ?? 0

  useEffect(() => {
    const t = setTimeout(() => { window.twttr?.widgets?.load() }, 1000)
    return () => clearTimeout(t)
  }, [s?.best_tweet_week?.tweet_id, s?.best_tweet_2d?.tweet_id])

  const fmtFollowers = followers >= 1000 ? `${(followers/1000).toFixed(1)}K` : followers.toLocaleString()

  const collapsed = (
    <div className="space-y-5">
      {/* Hero */}
      <div className="flex items-end justify-between">
        <div>
          <p className="display-number">{fmtFollowers}</p>
          <p className="display-label mt-1.5">X Followers</p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", color: "#34C759" }}>
            {engagement.toFixed(1)}%
          </p>
          <p className="display-label">Engagement</p>
        </div>
      </div>

      {/* Streak pill */}
      {streak > 0 && (
        <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
          style={{ background: "linear-gradient(135deg, #FFF7E6, #FFF0CC)" }}>
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-700">{streak}-day posting streak</span>
          <span className="ml-auto text-base">🔥</span>
        </div>
      )}

      {/* Best tweet preview */}
      {s?.best_tweet_week && (
        <div className="rounded-2xl p-4" style={{ background: "#EDE8DF" }}>
          <p className="text-xs text-[#7A7570] line-clamp-2 leading-relaxed mb-2.5">
            {s.best_tweet_week.text.slice(0, 120)}…
          </p>
          <div className="flex items-center gap-3 text-xs font-bold text-[#7A7570]">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#FF3B30]" />{s.best_tweet_week.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-[#30B0C7]" />{s.best_tweet_week.replies}</span>
            <span className="ml-auto text-[#A8A29A]">{s.best_tweet_week.date}</span>
          </div>
        </div>
      )}
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="stat-pill">
          <p className="display-label mb-2">Followers</p>
          <p className="text-2xl font-black text-[#1A1A18] tracking-tight">{fmtFollowers}</p>
        </div>
        <div className="stat-pill">
          <p className="display-label mb-2">Engagement</p>
          <p className="text-2xl font-black tracking-tight" style={{ color: "#34C759" }}>{engagement.toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl p-3.5" style={{ background: "linear-gradient(135deg, #FFF7E6, #FFE9A0)" }}>
          <p className="display-label text-amber-600 mb-2">Streak</p>
          <p className="text-2xl font-black text-amber-700">{streak}d 🔥</p>
        </div>
      </div>

      {/* Content performance */}
      {s?.content_type_stats && (
        <div className="stat-pill">
          <div className="flex items-center justify-between mb-3">
            <p className="display-label">Content Performance</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#FFF7E6", color: "#C8820A" }}>
              Best: {(s.best_content_type ?? "").replace("_", " ")}
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(s.content_type_stats).map(([type, st]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#3C3630] capitalize w-32">{type.replace("_"," ")}</span>
                <span className="text-xs text-[#7A7570]">{st.count} posts</span>
                <span className="text-xs font-bold text-[#1A1A18]">{st.avg_eng.toFixed(0)} avg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tweets */}
      {s?.best_tweet_week && (
        <div>
          <p className="display-label mb-3">Best This Week</p>
          {s.best_tweet_week.embed_html
            ? <div className="rounded-2xl overflow-hidden" dangerouslySetInnerHTML={{ __html: s.best_tweet_week.embed_html }} />
            : <a href={s.best_tweet_week.tweet_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                className="block stat-pill hover:bg-[#E5DFD5] transition-colors">
                <p className="text-sm text-[#1A1A18] leading-relaxed">{s.best_tweet_week.text}</p>
                <div className="flex gap-4 mt-3 text-xs font-bold text-[#7A7570]">
                  <span>❤️ {s.best_tweet_week.likes}</span>
                  <span>💬 {s.best_tweet_week.replies}</span>
                </div>
              </a>
          }
        </div>
      )}

      {s?.best_tweet_2d && (
        <div>
          <p className="display-label mb-3">Trending 48h</p>
          {s.best_tweet_2d.embed_html
            ? <div className="rounded-2xl overflow-hidden" dangerouslySetInnerHTML={{ __html: s.best_tweet_2d.embed_html }} />
            : <a href={s.best_tweet_2d.tweet_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                className="block stat-pill hover:bg-[#E5DFD5] transition-colors">
                <p className="text-sm text-[#1A1A18] leading-relaxed">{s.best_tweet_2d.text}</p>
                <div className="flex gap-4 mt-3 text-xs font-bold text-[#7A7570]">
                  <span>❤️ {s.best_tweet_2d.likes}</span>
                  <span>💬 {s.best_tweet_2d.replies}</span>
                </div>
              </a>
          }
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard title="Social Pulse" subtitle="@67coinX"
      icon={<BarChart2 className="w-[18px] h-[18px]" />}
      accentColor="#1D9BF0" collapsed={collapsed} expanded={expanded} />
  )
}
