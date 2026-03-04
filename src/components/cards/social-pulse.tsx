"use client"

import { useEffect } from "react"
import { BarChart2, Flame, Heart, MessageCircle, TrendingUp, Users } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

declare global { interface Window { twttr?: { widgets?: { load: () => void } } } }

const LOGO = "/67logo.png"

function DeltaBadge({ value, inline }: { value?: number; inline?: boolean }) {
  if (value === undefined || value === null || value === 0) return null
  const pos = value > 0
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: inline ? "0.75rem" : "0.6875rem",
      fontWeight: 700,
      color: pos ? "#16A34A" : "#DC2626",
      background: pos ? "#DCFCE7" : "#FEE2E2",
      borderRadius: 99, padding: "2px 8px", marginLeft: 6,
    }}>
      {pos ? "+" : ""}{value.toLocaleString()}
    </span>
  )
}

export function SocialPulseCard() {
  const { data } = useAppData()
  const s = data?.social_pulse
  const followers       = s?.twitter_followers ?? 0
  const followerDelta   = s?.follower_change_24h ?? 0
  const engagement      = s?.engagement_rate ?? 0
  const streak          = s?.posting_streak_days ?? 0
  const communityM      = s?.x_community_members ?? 0
  const communityDelta  = s?.x_community_delta_24h ?? 0
  const mentions        = s?.mentions ?? []
  // Always show exact numbers — no K rounding
  const fmtF  = followers.toLocaleString()
  const fmtCM = communityM.toLocaleString()

  // 1d/3d/7d follower deltas — from API-computed values (snapshot-based)
  const history  = s?.follower_history ?? []
  const growth1d = (s as any)?.follower_change_24h ?? 0
  const growth3d = (s as any)?.follower_change_3d ?? (s?.follower_growth_7d !== undefined
    ? (history.length >= 4 ? (history[history.length-1]?.count ?? 0) - (history[Math.max(0,history.length-4)]?.count ?? 0) : 0)
    : 0)
  const growth7d = (s as any)?.follower_change_7d ?? s?.follower_growth_7d ?? 0
  const avgEng = s?.avg_engagement ?? 0

  useEffect(() => {
    const timers = [
      setTimeout(() => window.twttr?.widgets?.load(), 800),
      setTimeout(() => window.twttr?.widgets?.load(), 2500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [s?.best_tweet_week?.tweet_id, s?.best_tweet_2d?.tweet_id])

  const handleOpen = () => {
    [300, 800, 1800, 3500].forEach(ms =>
      setTimeout(() => window.twttr?.widgets?.load(), ms)
    )
  }

  const TweetCard = ({ tweet }: { tweet: NonNullable<typeof s>["best_tweet_week"] }) => {
    if (!tweet) return null
    return (
      <a href={tweet.tweet_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
        style={{ display:"block", textDecoration:"none" }}>
        <div style={{ borderRadius:14, border:"1px solid rgba(0,0,0,0.07)", background:"var(--card)", overflow:"hidden", cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 14px 8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="67" width={32} height={32} style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover" }} />
            <div>
              <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", lineHeight:1.2 }}>The Official 67 Coin</p>
              <p style={{ fontSize:"0.72rem", color:"var(--secondary)" }}>@67coinX · {tweet.date}</p>
            </div>
            <svg style={{ marginLeft:"auto", width:18, height:18, color:"var(--foreground)" }} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
          </div>
          <p style={{ fontSize:"0.875rem", color:"var(--foreground)", lineHeight:1.6, padding:"0 14px 10px", margin:0 }}>{tweet.text}</p>
          {tweet.img_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tweet.img_url} alt="tweet media"
              style={{ width:"100%", maxHeight:220, objectFit:"cover", display:"block", borderTop:"1px solid var(--separator)" }} />
          )}
          <div style={{ display:"flex", alignItems:"center", gap:16, padding:"10px 14px", borderTop:"1px solid var(--separator)", background:"rgba(0,0,0,0.02)" }}>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.75rem", fontWeight:600, color:"#EF4444" }}>
              <Heart style={{ width:13, height:13 }} />{tweet.likes}
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.75rem", fontWeight:600, color:"#6366F1" }}>
              <MessageCircle style={{ width:13, height:13 }} />{tweet.replies}
            </span>
          </div>
        </div>
      </a>
    )
  }

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Hero row — Followers exact + Engagement */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <p className="hero-label" style={{ marginBottom:6 }}>X Followers</p>
          <div style={{ display:"flex", alignItems:"center" }}>
            <p className="hero-number">{fmtF}</p>
            <DeltaBadge value={followerDelta} inline />
          </div>
          {/* 1d / 3d / 7d growth mini row */}
          <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
            {[["20h", growth1d], ["3d", growth3d], ["7d", growth7d]].map(([label, val]) => (
              <span key={label as string} style={{ fontSize:"0.6875rem", fontWeight:700,
                color: (val as number) > 0 ? "#059669" : (val as number) < 0 ? "#EF4444" : "#8E8E93",
                background: (val as number) > 0 ? "rgba(5,150,105,0.08)" : (val as number) < 0 ? "rgba(239,68,68,0.08)" : "rgba(0,0,0,0.05)",
                padding:"2px 7px", borderRadius:99 }}>
                {(val as number) > 0 ? "+" : ""}{val as number} / {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:"2rem", fontWeight:800, letterSpacing:"-0.04em", color:"#10B981", lineHeight:1 }}>
            {engagement.toFixed(1)}%
          </p>
          <p className="hero-label">Engagement</p>
          {avgEng > 0 && (
            <p style={{ fontSize:"0.72rem", color:"var(--tertiary)", marginTop:3 }}>{avgEng.toFixed(0)} avg/tweet</p>
          )}
        </div>
      </div>

      {/* X Community row */}
      {communityM > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(0,0,0,0.03)", borderRadius:12, padding:"10px 14px" }}>
          <Users style={{ width:15, height:15, color:"var(--tertiary)" }} />
          <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)" }}>
            X Community: {fmtCM}
          </span>
          <DeltaBadge value={communityDelta} />
        </div>
      )}

      {/* Streak */}
      {streak > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--fill-primary)", borderRadius:12, padding:"10px 14px" }}>
          <Flame style={{ width:16, height:16, color:"#F59E0B" }} />
          <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"#92400E" }}>{streak}-day posting streak</span>
          <span style={{ marginLeft:"auto" }}>🔥</span>
        </div>
      )}

      {/* Best tweet preview */}
      {s?.best_tweet_week && (
        <div style={{ borderRadius:14, border:"1px solid rgba(245,166,35,0.12)", background:"rgba(245,166,35,0.03)", padding:"14px 16px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"#F5A623", borderRadius:"99px 0 0 99px" }} />
          <div style={{ paddingLeft:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="67" width={18} height={18} style={{ width:18, height:18, borderRadius:"50%", objectFit:"cover" }} />
              <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)" }}>The Official 67 Coin</span>
              <span style={{ fontSize:"0.6875rem", color:"var(--secondary)" }}>@67coinX</span>
            </div>
            <p style={{ fontSize:"0.8125rem", color:"var(--foreground)", lineHeight:1.55, marginBottom:10, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {s.best_tweet_week.text}
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.6875rem", fontWeight:600, color:"var(--secondary)" }}>
                <Heart style={{ width:11, height:11, color:"#F43F5E" }} />{s.best_tweet_week.likes}
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.6875rem", fontWeight:600, color:"var(--secondary)" }}>
                <MessageCircle style={{ width:11, height:11, color:"var(--tertiary)" }} />{s.best_tweet_week.replies}
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
      {/* Stats row — exact numbers */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <div className="inset-cell">
          <div style={{ display:"flex", alignItems:"center" }}>
            <p className="metric-xl">{fmtF}</p>
            <DeltaBadge value={followerDelta} />
          </div>
          <p className="metric-label">X Followers</p>
          <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
            {[["20h", growth1d], ["3d", growth3d], ["7d", growth7d]].map(([label, val]) => (
              <span key={label as string} style={{ fontSize:"0.6875rem", fontWeight:700,
                color: (val as number) > 0 ? "#059669" : (val as number) < 0 ? "#EF4444" : "#8E8E93",
                background: (val as number) > 0 ? "rgba(5,150,105,0.08)" : (val as number) < 0 ? "rgba(239,68,68,0.08)" : "rgba(0,0,0,0.05)",
                padding:"2px 7px", borderRadius:99 }}>
                {(val as number) > 0 ? "+" : ""}{val as number} / {label}
              </span>
            ))}
          </div>
        </div>
        <div className="inset-cell">
          <p className="metric-xl" style={{ color:"#10B981" }}>{engagement.toFixed(1)}%</p>
          <p className="metric-label">Engagement Rate</p>
          {avgEng > 0 && (
            <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--secondary)", marginTop:4 }}>
              {avgEng.toFixed(1)} avg interactions/tweet
            </p>
          )}
        </div>
        {communityM > 0 && (
          <div className="inset-cell">
            <div style={{ display:"flex", alignItems:"center" }}>
              <p className="metric-xl">{fmtCM}</p>
              <DeltaBadge value={communityDelta} />
            </div>
            <p className="metric-label">X Community</p>
          </div>
        )}
        <div style={{ background:"var(--fill-primary)", borderRadius:12, padding:"14px 16px" }}>
          <p className="metric-xl" style={{ color:"#D97706" }}>{streak}d</p>
          <p className="metric-label" style={{ color:"#92400E" }}>🔥 Posting Streak</p>
        </div>
      </div>

      {/* Follower History Chart */}
      {s?.follower_history && s.follower_history.length > 1 && (
        <div className="inset-cell">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <p className="hero-label">Follower Growth</p>
            <div style={{ display:"flex", gap:12 }}>
              <span style={{ fontSize:"0.72rem", fontWeight:700, color: growth3d >= 0 ? "#10B981" : "#EF4444" }}>
                {growth1d >= 0 ? "+" : ""}{growth1d} / 20h
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:"0.72rem", fontWeight:700, color: growth3d >= 0 ? "#10B981" : "#EF4444" }}>
                {growth3d >= 0 ? "+" : ""}{growth3d} / 3d
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:"0.72rem", fontWeight:700, color: growth7d >= 0 ? "#10B981" : "#EF4444" }}>
                <TrendingUp style={{ width:11, height:11 }} />
                {growth7d >= 0 ? "+" : ""}{growth7d} / 7d
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={s.follower_history.slice(-14)} margin={{ top:2, right:0, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F5A623" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize:9, fill:"#C7C7CC" }} tickLine={false} axisLine={false}
                tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" />
              <Tooltip
                contentStyle={{ background:"var(--card)", border:"1px solid #F0F0F2", borderRadius:8, fontSize:12, padding:"6px 10px" }}
                formatter={(v: number | undefined) => [(v ?? 0).toLocaleString(), "Followers"]}
              />
              <Area type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} fill="url(#fGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* X Mentions Feed */}
      {mentions.length > 0 && (
        <div>
          <p className="hero-label" style={{ marginBottom:10 }}>X Mentions Feed</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {mentions.slice(0, 5).map((m, i) => (
              <a key={i} href={m.tweet_url} target="_blank" rel="noopener noreferrer"
                onClick={e=>e.stopPropagation()} style={{ textDecoration:"none" }}>
                <div className="inset-cell" style={{ cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)" }}>{m.author}</span>
                    <span style={{ fontSize:"0.6875rem", color:"var(--secondary)" }}>@{m.author_handle}</span>
                    <span style={{ marginLeft:"auto", fontSize:"0.6875rem", color:"#D4D4D8" }}>{m.date}</span>
                  </div>
                  <p style={{ fontSize:"0.8125rem", color:"var(--secondary)", lineHeight:1.5, marginBottom:8,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {m.text}
                  </p>
                  <div style={{ display:"flex", gap:12 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:"0.6875rem", color:"var(--secondary)" }}>
                      <Heart style={{ width:11, height:11, color:"#F43F5E" }} />{m.likes}
                    </span>
                    <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:"0.6875rem", color:"var(--secondary)" }}>
                      <MessageCircle style={{ width:11, height:11, color:"var(--tertiary)" }} />{m.replies}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

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
                <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--secondary)", width:100, textTransform:"capitalize" }}>{type.replace("_"," ")}</span>
                <span style={{ fontSize:"0.75rem", color:"var(--secondary)", width:50 }}>{st.count} posts</span>
                <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", marginLeft:"auto" }}>{st.avg_eng.toFixed(0)} avg</span>
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
