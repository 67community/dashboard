"use client"

import { ExternalLink, Eye, Clock, RefreshCw, Play, BarChart2, Globe, TrendingUp, Users } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { YoutubeVideo, YoutubeAnalytics } from "@/lib/use-data"

// ── YouTube logo ──────────────────────────────────────────────────────────────

function YTLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000" />
      <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
    </svg>
  )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
      <span style={{ color:"var(--secondary)", display:"flex" }}>{icon}</span>
      <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--secondary)", letterSpacing:"0.06em", textTransform:"uppercase", margin:0 }}>{label}</p>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 30) return `${d}d ago`
    return `${Math.floor(d / 30)}mo ago`
  } catch { return "recently" }
}

function fmtSecs(s: number): string {
  const m = Math.floor(s / 60), rem = s % 60
  return `${m}:${String(rem).padStart(2,"0")}`
}

// ── Video tile ────────────────────────────────────────────────────────────────

function VideoTile({ v, large = false }: { v: YoutubeVideo; large?: boolean }) {
  const thumbH = large ? 160 : 100
  return (
    <a href={v.video_url} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{ textDecoration:"none", display:"block" }}>
      <div style={{ borderRadius:12, overflow:"hidden", border:"1.5px solid var(--separator)", minWidth:200, flexShrink:0, background:"var(--card)", transition:"transform 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.transform="scale(1.02)")}
        onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}>

        {/* Thumbnail */}
        <div style={{ width:"100%", height:thumbH, background:"#1A1A1A", position:"relative", overflow:"hidden" }}>
          {v.thumbnail_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={v.thumbnail_url} alt={v.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).style.display="none" }} />
            : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><YTLogo size={28} /></div>
          }
          {/* Duration */}
          {v.duration && (
            <div style={{ position:"absolute", bottom:5, right:5, background:"rgba(0,0,0,0.85)", borderRadius:3, padding:"1px 4px", fontSize:"0.5625rem", fontWeight:700, color:"#fff" }}>{v.duration}</div>
          )}
          {/* NEW badge */}
          {v.video_type === "recent" && (
            <div style={{ position:"absolute", top:5, right:5, background:"#10B981", borderRadius:4, padding:"1px 5px", fontSize:"0.5rem", fontWeight:800, color:"#fff", textTransform:"uppercase", letterSpacing:"0.05em" }}>NEW</div>
          )}
          {/* Play */}
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Play style={{ width:12, height:12, fill:"#fff", color:"#fff", marginLeft:2 }} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding:"8px 10px" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#09090B", marginBottom:2, lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:large?2:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{v.title}</p>
          <p style={{ fontSize:"0.625rem", color:"var(--secondary)", marginBottom:4, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
            {v.channel} {v.channel_subs_text && `· ${v.channel_subs_text} subs`}
          </p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4 }}>
            <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:"0.625rem", color:"var(--secondary)" }}>
              <Eye style={{ width:9, height:9 }} />{v.views_text}
            </span>
            {v.engagement_rate && (
              <span style={{ fontSize:"0.625rem", color:"#059669", fontWeight:600 }}>{v.engagement_rate}% eng</span>
            )}
            <span style={{ fontSize:"0.625rem", color:"var(--tertiary)" }}>{timeAgo(v.published_at)}</span>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Analytics sections ────────────────────────────────────────────────────────

function DailyViewsChart({ data }: { data: { date: string; views: number }[] }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.views), 1)
  const last7 = data.slice(-7)
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:50 }}>
        {last7.map((d, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <div style={{
              width:"100%", borderRadius:"3px 3px 0 0",
              height: Math.max(4, (d.views / max) * 46),
              background: i === last7.length-1 ? "#FF0000" : "rgba(255,0,0,0.3)",
              transition:"height 0.3s",
            }} />
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        <span style={{ fontSize:"0.5625rem", color:"var(--tertiary)" }}>
          {last7[0]?.date ? new Date(last7[0].date).toLocaleDateString("en",{month:"short",day:"numeric"}) : ""}
        </span>
        <span style={{ fontSize:"0.5625rem", color:"#FF0000", fontWeight:700 }}>
          {last7[last7.length-1]?.views?.toLocaleString()} today
        </span>
      </div>
    </div>
  )
}

function TrafficSources({ sources }: { sources: { source: string; views: number; pct: number }[] }) {
  if (!sources?.length) return null
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {sources.slice(0, 30).map((s, i) => (
        <div key={i}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)" }}>{s.source}</span>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#FF0000" }}>{s.pct}%</span>
          </div>
          <div style={{ height:4, background:"#F3F4F6", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${s.pct}%`, background:"linear-gradient(90deg,#FF4444,#FF0000)", borderRadius:99 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TopCountries({ countries }: { countries: { country: string; code?: string; flag?: string; views: number; pct: number }[] }) {
  if (!countries?.length) return null
  const FLAGS: Record<string,string> = { US:"🇺🇸",GB:"🇬🇧",CA:"🇨🇦",AU:"🇦🇺",TR:"🇹🇷",DE:"🇩🇪",FR:"🇫🇷",BR:"🇧🇷",IN:"🇮🇳",NG:"🇳🇬",PH:"🇵🇭",MX:"🇲🇽",AR:"🇦🇷",VN:"🇻🇳",ID:"🇮🇩",KR:"🇰🇷",JP:"🇯🇵",RU:"🇷🇺",UA:"🇺🇦",PL:"🇵🇱" }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {countries.slice(0, 30).map((c, i) => {
        const flag = (c as { flag?: string }).flag ?? FLAGS[c.code ?? c.country] ?? "🌐"
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"0.875rem", width:20, flexShrink:0 }}>{flag}</span>
            <span style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)", flex:1 }}>{c.country}</span>
            <span style={{ fontSize:"0.6875rem", color:"var(--secondary)" }}>{c.views?.toLocaleString()}</span>
            <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#FF0000", minWidth:32, textAlign:"right" }}>{c.pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Public aggregate stats (no OAuth needed) ─────────────────────────────────

function PublicAggregateStats({ videos }: { videos: YoutubeVideo[] }) {
  if (!videos.length) return null
  const totalViews    = videos.reduce((s,v) => s + (v.views ?? 0), 0)
  const totalLikes    = videos.reduce((s,v) => s + (v.likes ?? 0), 0)
  const totalComments = videos.reduce((s,v) => s + (v.comments ?? 0), 0)
  const avgEngagement = videos.filter(v => v.engagement_rate).reduce((s,v,_,a) => s + (v.engagement_rate ?? 0) / a.length, 0)

  // Unique channels
  const channels = [...new Map(videos.map(v => [v.channel_id, v])).values()]

  // Sort videos by views for bar chart
  const sorted = [...videos].sort((a,b) => (b.views??0) - (a.views??0)).slice(0, 30)
  const maxViews = sorted[0]?.views ?? 1

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Aggregate stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
        {[
          { label:"Total Views",    value: totalViews >= 1_000_000 ? `${(totalViews/1_000_000).toFixed(1)}M` : `${Math.round(totalViews/1_000)}K`, color:"#FF0000" },
          { label:"Total Likes",    value: totalLikes >= 1_000 ? `${(totalLikes/1_000).toFixed(1)}K` : String(totalLikes), color:"#F5A623" },
          { label:"Comments",       value: totalComments >= 1_000 ? `${(totalComments/1_000).toFixed(1)}K` : String(totalComments), color:"#5865F2" },
          { label:"Avg Engagement", value: `${avgEngagement.toFixed(2)}%`, color:"#10B981" },
        ].map(s => (
          <div key={s.label} className="inset-cell" style={{ textAlign:"center" }}>
            <p style={{ fontSize:"1.125rem", fontWeight:800, color:s.color, margin:0, letterSpacing:"-0.03em" }}>{s.value}</p>
            <p style={{ fontSize:"0.5625rem", color:"var(--tertiary)", marginTop:3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Views bar chart per video */}
      <div className="inset-cell">
        <SectionLabel icon={<BarChart2 style={{ width:12, height:12 }} />} label="Views by Video" />
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {sorted.map((v, i) => (
            <div key={v.video_id}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, alignItems:"center" }}>
                <a href={v.video_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                  style={{ fontSize:"0.6875rem", fontWeight:600, color:"var(--foreground)", textDecoration:"none",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"70%" }}>
                  {v.title}
                </a>
                <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#FF0000", flexShrink:0 }}>{v.views_text}</span>
              </div>
              <div style={{ height:5, background:"#F3F4F6", borderRadius:99, overflow:"hidden" }}>
                <div style={{
                  height:"100%",
                  width:`${Math.max(4, ((v.views ?? 0) / maxViews) * 100)}%`,
                  background: i === 0 ? "#FF0000" : `rgba(255,${Math.max(0,100-i*15)},${Math.max(0,100-i*15)},0.7)`,
                  borderRadius:99,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channels covering $67coin */}
      <div className="inset-cell">
        <SectionLabel icon={<Users style={{ width:12, height:12 }} />} label={`Channels Covering $67coin (${channels.length})`} />
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {channels.slice(0, 30).map((v) => (
            <div key={v.channel_id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <a href={v.channel_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", textDecoration:"none",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                📺 {v.channel}
              </a>
              {v.channel_subs_text && (
                <span style={{ fontSize:"0.6875rem", color:"var(--secondary)", flexShrink:0, marginLeft:8 }}>
                  {v.channel_subs_text} subs
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export function YouTubeSpotlightCard() {
  const { data } = useAppData()
  const videos: YoutubeVideo[]  = (data?.youtube_spotlight ?? []) as YoutubeVideo[]
  const analytics               = data?.youtube_analytics as YoutubeAnalytics | undefined

  const popularVideos  = videos.filter(v => v.video_type === "popular")
  const recentVideos   = videos.filter(v => v.video_type === "recent")
  const totalViews     = videos.reduce((s, v) => s + (v.views ?? 0), 0)
  const hasAnalytics   = analytics?.has_data === true
  const topVideo       = popularVideos[0]

  // ── Collapsed ──────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div>
        <p className="hero-label" style={{ marginBottom:8 }}>YouTube Videos</p>
        <p className="hero-number">
          {totalViews >= 1_000_000
            ? `${(totalViews/1_000_000).toFixed(1)}M`
            : totalViews >= 1_000 ? `${Math.round(totalViews/1_000)}K` : totalViews > 0 ? String(totalViews) : "—"}
        </p>
        <p style={{ fontSize:"0.875rem", color:"var(--tertiary)", marginTop:6 }}>
          {videos.length > 0 ? `${videos.length} videos · combined views` : "waiting for YOUTUBE_API_KEY"}
        </p>
      </div>

      {/* Preview grid */}
      {popularVideos.length > 0 ? (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {popularVideos.slice(0, 30).map((v,i) => <VideoTile key={i} v={v} />)}
        </div>
      ) : (
        <div style={{ display:"flex", alignItems:"center", gap:10, borderTop:"1px solid var(--separator)", paddingTop:14 }}>
          <YTLogo size={20} />
          <p style={{ fontSize:"0.875rem", color:"var(--secondary)", fontWeight:500 }}>$67coin on YouTube</p>
        </div>
      )}

      {/* Analytics pill if available */}
      {hasAnalytics && analytics && (
        <div style={{ display:"flex", gap:8 }}>
          <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
            <p style={{ fontSize:"1rem", fontWeight:800, color:"#FF0000", margin:0 }}>{(analytics.total_views_30d??0).toLocaleString()}</p>
            <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", marginTop:2 }}>Views 30d</p>
          </div>
          <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
            <p style={{ fontSize:"1rem", fontWeight:800, color:"var(--foreground)", margin:0 }}>+{analytics.subscriber_gains_30d ?? 0}</p>
            <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", marginTop:2 }}>New Subs</p>
          </div>
        </div>
      )}
    </div>
  )

  // ── Expanded ───────────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--secondary)", letterSpacing:"0.06em", textTransform:"uppercase" }}>YouTube Spotlight</p>
          <p style={{ fontSize:"0.75rem", color:"var(--tertiary)", marginTop:2 }}>$67coin · 67 coin solana · maverick 67 coin</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {hasAnalytics
            ? <span style={{ background:"#DCFCE7", color:"#16A34A", borderRadius:99, padding:"3px 8px", fontSize:"0.6875rem", fontWeight:700 }}>Channel Analytics ✓</span>
            : <span style={{ background:"#F3F4F6", color:"var(--secondary)", borderRadius:99, padding:"3px 8px", fontSize:"0.6875rem", fontWeight:700 }}>Public Stats</span>
          }
          <div style={{ background:"#FFF0F0", borderRadius:8, padding:"4px 10px", fontSize:"0.75rem", fontWeight:600, color:"#FF0000", display:"flex", alignItems:"center", gap:4 }}>
            <YTLogo size={12} />{videos.length} videos
          </div>
        </div>
      </div>

      {/* ── Analytics section (if OAuth set up) ─────────────────────────────── */}
      {hasAnalytics && analytics ? (
        <>
          {/* Channel hero */}
          <div style={{ background:"linear-gradient(135deg,#FF0000,#CC0000)", borderRadius:16, padding:"18px 20px" }}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"rgba(255,255,255,0.6)", letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>
              {analytics.channel_name || "YouTube Channel"}
            </p>
            <div style={{ display:"flex", alignItems:"baseline", gap:12, marginTop:6, marginBottom:12 }}>
              <div>
                <p style={{ fontSize:"0.6875rem", color:"rgba(255,255,255,0.55)", margin:0 }}>Subscribers</p>
                <p style={{ fontSize:"1.75rem", fontWeight:900, color:"#fff", lineHeight:1, margin:0 }}>
                  {analytics.subscribers >= 1000 ? `${(analytics.subscribers/1000).toFixed(1)}K` : analytics.subscribers.toLocaleString()}
                </p>
              </div>
            </div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {[
                { v: (analytics.total_views_30d??0).toLocaleString(), l:"Views (30d)" },
                { v: `${analytics.watch_time_hours_30d?.toLocaleString()}h`, l:"Watch Time" },
                { v: fmtSecs(analytics.avg_view_duration_s ?? 0), l:"Avg Duration" },
                { v: `+${analytics.subscriber_gains_30d ?? 0}`, l:"New Subs 30d" },
              ].map(s => (
                <div key={s.l} style={{ background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"8px 12px" }}>
                  <p style={{ fontSize:"1rem", fontWeight:800, color:"#fff", margin:0, lineHeight:1 }}>{s.v}</p>
                  <p style={{ fontSize:"0.625rem", fontWeight:600, color:"rgba(255,255,255,0.7)", marginTop:3 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily views chart */}
          {(analytics.daily_views?.length ?? 0) > 0 && (
            <div className="inset-cell">
              <SectionLabel icon={<BarChart2 style={{ width:12, height:12 }} />} label="Daily Views — Last 7 Days" />
              <DailyViewsChart data={analytics.daily_views} />
            </div>
          )}

          {/* Traffic sources + Countries side by side */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {(analytics.traffic_sources?.length ?? 0) > 0 && (
              <div className="inset-cell">
                <SectionLabel icon={<TrendingUp style={{ width:12, height:12 }} />} label="Traffic Sources" />
                <TrafficSources sources={analytics.traffic_sources} />
              </div>
            )}
            {(analytics.top_countries?.length ?? 0) > 0 && (
              <div className="inset-cell">
                <SectionLabel icon={<Globe style={{ width:12, height:12 }} />} label="Top Countries" />
                <TopCountries countries={analytics.top_countries} />
              </div>
            )}
          </div>
        </>
      ) : (
        <PublicAggregateStats videos={videos} />
      )}

      {/* ── Public stats: top video spotlight ── */}
      {topVideo && (
        <div className="inset-cell">
          <SectionLabel icon={<TrendingUp style={{ width:12, height:12 }} />} label="Top Video" />
          <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            {/* Thumb */}
            <a href={topVideo.video_url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ flexShrink:0 }}>
              <div style={{ width:100, height:60, borderRadius:8, overflow:"hidden", background:"#1A1A1A", position:"relative" }}>
                {topVideo.thumbnail_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={topVideo.thumbnail_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><YTLogo size={20} /></div>
                }
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(255,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Play style={{ width:9, height:9, fill:"#fff", color:"#fff", marginLeft:1 }} />
                  </div>
                </div>
              </div>
            </a>
            {/* Stats */}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", margin:0, lineHeight:1.3, marginBottom:6,
                overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{topVideo.title}</p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {[
                  { icon:<Eye style={{ width:10, height:10 }} />, val: topVideo.views_text, label:"views" },
                  { icon:"👍", val: topVideo.likes?.toLocaleString() ?? "—", label:"likes" },
                  { icon:"💬", val: topVideo.comments?.toLocaleString() ?? "—", label:"comments" },
                  { icon:<Users style={{ width:10, height:10 }} />, val: topVideo.channel_subs_text ?? "—", label:"channel subs" },
                ].map((s,i) => (
                  <div key={i} style={{ textAlign:"center" }}>
                    <p style={{ fontSize:"0.875rem", fontWeight:800, color:"var(--foreground)", margin:0, display:"flex", alignItems:"center", gap:3 }}>
                      {s.icon}{s.val}
                    </p>
                    <p style={{ fontSize:"0.5625rem", color:"var(--secondary)", margin:0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {topVideo.engagement_rate && (
                <div style={{ marginTop:6, display:"inline-flex", alignItems:"center", gap:4,
                  background:"#DCFCE7", borderRadius:99, padding:"2px 8px" }}>
                  <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#16A34A" }}>
                    {topVideo.engagement_rate}% engagement rate
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Video grid: Popular + Recent ── */}
      {popularVideos.length > 0 && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
            <span style={{ fontSize:"0.75rem" }}>🔥</span>
            <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--secondary)", letterSpacing:"0.05em", textTransform:"uppercase" }}>Most Viewed</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {popularVideos.map((v,i) => <VideoTile key={i} v={v} large />)}
          </div>
        </div>
      )}

      {recentVideos.length > 0 && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
            <span style={{ fontSize:"0.75rem" }}>🕐</span>
            <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--secondary)", letterSpacing:"0.05em", textTransform:"uppercase" }}>Recently Uploaded</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {recentVideos.map((v,i) => <VideoTile key={i} v={v} large />)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {["$67coin solana","67coin crypto","maverick 67 coin"].map(q => (
          <a key={q} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
            target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
            style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:"0.6875rem", fontWeight:600,
              color:"var(--secondary)", background:"#F3F4F6", borderRadius:99, padding:"4px 10px", textDecoration:"none" }}>
            <Clock style={{ width:10, height:10 }} />{q}<ExternalLink style={{ width:8, height:8, opacity:0.5 }} />
          </a>
        ))}
      </div>

      {/* Refresh note */}
      <div style={{ display:"flex", alignItems:"center", gap:6, color:"var(--secondary)" }}>
        <RefreshCw style={{ width:11, height:11 }} />
        <span style={{ fontSize:"0.6875rem" }}>Data refreshes every hour via YouTube Data API v3</span>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="YouTube Spotlight"
      subtitle={hasAnalytics ? "Videos · Analytics · Live" : "Trend videos · Public stats · Live"}
      icon={<span style={{ display:"flex" }}><YTLogo size={16} /></span>}
      accentColor="#FF0000"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
