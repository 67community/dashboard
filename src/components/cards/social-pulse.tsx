"use client"

import { useEffect } from "react"
import { BarChart2, Flame, Heart, MessageCircle, Share2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

declare global { interface Window { twttr?: { widgets?: { load: () => void } } } }

const LOGO = "https://raw.githubusercontent.com/67coin/67/main/logo.png"

export function SocialPulseCard() {
  const { data } = useAppData()
  const s = data?.social_pulse
  const followers  = s?.twitter_followers ?? 0
  const engagement = s?.engagement_rate ?? 0
  const streak     = s?.posting_streak_days ?? 0
  const fmtF = followers >= 1000 ? `${(followers/1000).toFixed(1)}K` : followers.toLocaleString()

  // Load Twitter widgets on mount and when tweet IDs change
  useEffect(() => {
    const timers = [
      setTimeout(() => window.twttr?.widgets?.load(), 800),
      setTimeout(() => window.twttr?.widgets?.load(), 2500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [s?.best_tweet_week?.tweet_id, s?.best_tweet_2d?.tweet_id])

  // Called when modal opens — fire multiple retries to ensure widgets render
  const handleOpen = () => {
    [300, 800, 1800, 3500].forEach(ms =>
      setTimeout(() => window.twttr?.widgets?.load(), ms)
    )
  }

  const TweetCard = ({ tweet }: { tweet: NonNullable<typeof s>["best_tweet_week"] }) => {
    if (!tweet) return null
    if (tweet.embed_html) {
      // Force light theme on embeds
      const lightHtml = tweet.embed_html
        .replace(/data-theme="dark"/g, 'data-theme="light"')
        .replace(/data-theme='dark'/g, "data-theme='light'")
      return (
        <div style={{ borderRadius:12, overflow:"hidden" }}
          dangerouslySetInnerHTML={{ __html: lightHtml }} />
      )
    }
    return (
      <a href={tweet.tweet_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
        style={{ display:"block", textDecoration:"none" }}>
        <div className="inset-cell" style={{ cursor:"pointer" }}>
          <p style={{ fontSize:"0.875rem", color:"#09090B", lineHeight:1.55, marginBottom:12 }}>{tweet.text}</p>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.75rem", fontWeight:600, color:"#EF4444" }}>
              <Heart style={{ width:13, height:13 }} />{tweet.likes}
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.75rem", fontWeight:600, color:"#6366F1" }}>
              <MessageCircle style={{ width:13, height:13 }} />{tweet.replies}
            </span>
            <span style={{ marginLeft:"auto", fontSize:"0.6875rem", color:"#A1A1AA" }}>{tweet.date}</span>
          </div>
        </div>
      </a>
    )
  }

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Hero — followers */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <p className="hero-label" style={{ marginBottom:6 }}>X Followers</p>
          <p className="hero-number">{fmtF}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:"2rem", fontWeight:800, letterSpacing:"-0.04em", color:"#10B981", lineHeight:1 }}>
            {engagement.toFixed(1)}%
          </p>
          <p className="hero-label">Engagement</p>
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"#FFFBEB", borderRadius:12, padding:"10px 14px" }}>
          <Flame style={{ width:16, height:16, color:"#F59E0B" }} />
          <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"#92400E" }}>{streak}-day posting streak</span>
          <span style={{ marginLeft:"auto" }}>🔥</span>
        </div>
      )}

      {/* Best tweet preview — premium mini card */}
      {s?.best_tweet_week && (
        <div style={{
          borderRadius:14, border:"1px solid rgba(245,166,35,0.12)",
          background:"rgba(245,166,35,0.03)", padding:"14px 16px",
          position:"relative", overflow:"hidden",
        }}>
          {/* Twitter blue left accent */}
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"#F5A623", borderRadius:"99px 0 0 99px" }} />
          <div style={{ paddingLeft:8 }}>
            {/* Author */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="67" width={18} height={18}
                style={{ width:18, height:18, borderRadius:"50%", objectFit:"cover" }} />
              <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#09090B" }}>The Official 67 Coin</span>
              <span style={{ fontSize:"0.6875rem", color:"#A1A1AA" }}>@67coinX</span>
            </div>
            <p style={{
              fontSize:"0.8125rem", color:"#09090B", lineHeight:1.55, marginBottom:10,
              display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
            }}>
              {s.best_tweet_week.text}
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.6875rem", fontWeight:600, color:"#A1A1AA" }}>
                <Heart style={{ width:11, height:11, color:"#F43F5E" }} />{s.best_tweet_week.likes}
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.6875rem", fontWeight:600, color:"#A1A1AA" }}>
                <MessageCircle style={{ width:11, height:11, color:"#8E8E93" }} />{s.best_tweet_week.replies}
              </span>
              <span style={{ marginLeft:"auto", fontSize:"0.6875rem", color:"#D4D4D8" }}>{s.best_tweet_week.date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        <div className="inset-cell">
          <p className="metric-xl">{fmtF}</p>
          <p className="metric-label">Followers</p>
        </div>
        <div className="inset-cell">
          <p className="metric-xl" style={{ color:"#10B981" }}>{engagement.toFixed(1)}%</p>
          <p className="metric-label">Engagement</p>
        </div>
        <div style={{ background:"#FFFBEB", borderRadius:12, padding:"14px 16px" }}>
          <p className="metric-xl" style={{ color:"#D97706" }}>{streak}d</p>
          <p className="metric-label" style={{ color:"#92400E" }}>🔥 Streak</p>
        </div>
      </div>

      {/* Content type stats */}
      {s?.content_type_stats && (
        <div className="inset-cell">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <p className="hero-label">Content Performance</p>
            {s.best_content_type && (
              <span className="badge-gold">Best: {s.best_content_type.replace("_"," ")}</span>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Object.entries(s.content_type_stats).map(([type, st]) => (
              <div key={type} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#3F3F46", width:100, textTransform:"capitalize" }}>{type.replace("_"," ")}</span>
                <span style={{ fontSize:"0.75rem", color:"#A1A1AA", width:50 }}>{st.count} posts</span>
                <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"#09090B", marginLeft:"auto" }}>{st.avg_eng.toFixed(0)} avg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best tweet this week */}
      {s?.best_tweet_week && (
        <div>
          <p className="hero-label" style={{ marginBottom:10 }}>Best This Week</p>
          <TweetCard tweet={s.best_tweet_week} />
        </div>
      )}

      {/* Trending 48h */}
      {s?.best_tweet_2d && (
        <div>
          <p className="hero-label" style={{ marginBottom:10 }}>Trending 48h</p>
          <TweetCard tweet={s.best_tweet_2d} />
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Social Pulse"
      subtitle="@67coinX"
      icon={<BarChart2 style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      onOpen={handleOpen}
    />
  )
}
