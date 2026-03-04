"use client"

import { useState } from "react"
import { ExternalLink, Eye, Heart, Play, Newspaper, TrendingUp, TrendingDown } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { NewsItem } from "@/lib/use-data"

const proxyThumb = (url?: string) => url ? `/api/thumb-proxy?url=${encodeURIComponent(url)}` : ""


function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  } catch { return "" }
}

function fmt(n: number): string {
  if (!n) return "0"
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n/1000).toFixed(1)}K`
  return String(n)
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3 6.34 6.34 0 009.49 21.64a6.34 6.34 0 006.34-6.34V9.01a8.16 8.16 0 004.77 1.52V7.07a4.85 4.85 0 01-1.01-.38z"/>
    </svg>
  )
}

function YouTubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function InstaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function GoogleNewsIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function RSSIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#F97316"/>
      <circle cx="7" cy="17" r="2" fill="white"/>
      <path d="M4 11a9 9 0 0 1 9 9" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M4 4a16 16 0 0 1 16 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function SentimentBadge({ s }: { s?: string }) {
  if (!s || s === "neutral") return null
  const cfg = s === "positive"
    ? { color: "#059669", bg: "#DCFCE7", icon: <TrendingUp style={{ width: 9, height: 9 }} />, label: "Bullish" }
    : { color: "#DC2626", bg: "#FEE2E2", icon: <TrendingDown style={{ width: 9, height: 9 }} />, label: "Bearish" }
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:"0.5625rem", fontWeight:700, color:cfg.color, background:cfg.bg, borderRadius:99, padding:"2px 6px" }}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

function NewsRow({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
  const isCP = item.kind === "crypto_rss"
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ textDecoration:"none", display:"block" }}>
      <div style={{ borderRadius:10, border:"1.5px solid var(--separator)", background:"var(--card)", padding: compact ? "8px 10px" : "10px 12px", transition:"box-shadow 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
          <div style={{ flexShrink:0, marginTop:2 }}>
            {isCP ? <RSSIcon size={16} /> : <GoogleNewsIcon size={16} />}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize: compact ? "0.6875rem" : "0.8125rem", fontWeight:700, color:"var(--foreground)", margin:0, lineHeight:1.4,
              display:"-webkit-box", WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient:"vertical" as any, overflow:"hidden", marginBottom:5 }}>
              {item.title}
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:"0.625rem", fontWeight:600, color: isCP ? "#6366F1" : "#2563EB", background: isCP ? "rgba(99,102,241,0.08)" : "rgba(37,99,235,0.07)", borderRadius:99, padding:"1px 6px" }}>
                {item.source}
              </span>
              <span style={{ fontSize:"0.625rem", color:"var(--tertiary)" }}>{item.time_ago}</span>
              <SentimentBadge s={item.sentiment} />
              <ExternalLink style={{ width:9, height:9, color:"var(--tertiary)", marginLeft:"auto" }} />
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

type Tab = "tiktok" | "youtube" | "instagram" | "news"

export function SocialMediaSpotlightCard() {
  const { data } = useAppData()
  const [tab, setTab] = useState<Tab>("tiktok")

  const tiktoks  = (data?.tiktok_spotlight   ?? []) as any[]
  const youtubes = (data?.youtube_spotlight  ?? []) as any[]
  const instas   = (data?.instagram_spotlight ?? []) as any[]
  const news     = (data?.news_feed ?? []) as NewsItem[]

  const tabs = [
    { id: "tiktok" as Tab,     label: "TikTok",    icon: <TikTokIcon />,                                         count: tiktoks.length,  color: "#000000" },
    { id: "youtube" as Tab,    label: "YouTube",   icon: <YouTubeIcon />,                                        count: youtubes.length, color: "#FF0000" },
    { id: "instagram" as Tab,  label: "Instagram", icon: <InstaIcon />,                                          count: instas.length,   color: "#E1306C" },
    { id: "news" as Tab,       label: "News",      icon: <Newspaper style={{ width:16, height:16 }} />,          count: news.length,     color: "#2563EB" },
  ]

  const ttViews = tiktoks.reduce((a, v) => a + (v.plays || v.views || 0), 0)
  const ytViews = youtubes.reduce((a, v) => a + (v.views || v.view_count || 0), 0)
  const igLikes = instas.reduce((a, v) => a + (v.likes || v.like_count || 0), 0)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

      {/* ── Stats row ── */}
      <div style={{ display:"flex", gap:8 }}>
        {[
          { icon: <TikTokIcon size={11} />, label:"TikTok", val: fmt(ttViews), sub:"views", bg:"rgba(0,0,0,0.05)" },
          { icon: <YouTubeIcon size={11} />, label:"YouTube", val: fmt(ytViews), sub:"views", bg:"rgba(255,0,0,0.05)" },
          { icon: <InstaIcon size={11} />, label:"Instagram", val: igLikes > 0 ? fmt(igLikes) : "—", sub:"likes", bg:"rgba(225,48,108,0.05)" },
        ].map((s, i) => (
          <div key={i} style={{ flex:1, background:s.bg, borderRadius:10, padding:"8px 10px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>
              {s.icon}
              <span style={{ fontSize:"0.5rem", fontWeight:700, color:"var(--secondary)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</span>
            </div>
            <p style={{ fontSize:"1.1rem", fontWeight:800, color:"var(--foreground)", letterSpacing:"-0.03em", margin:0, lineHeight:1 }}>{s.val}</p>
            <p style={{ fontSize:"0.5rem", color:"var(--tertiary)", margin:"2px 0 0" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Media grid ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6 }}>
        {/* TikTok — tall portrait, spans 2 rows */}
        {tiktoks[0] && (
          <a href={tiktoks[0].video_url} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration:"none", gridRow:"1 / 3", gridColumn:"1 / 2" }}>
            <div style={{ position:"relative", borderRadius:10, overflow:"hidden", height:"100%", minHeight:160, background:"#111" }}>
              {tiktoks[0].thumbnail_url && <img src={proxyThumb(tiktoks[0].thumbnail_url)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 45%)" }} />
              <div style={{ position:"absolute", top:6, left:6 }}><TikTokIcon size={11} /></div>
              <div style={{ position:"absolute", bottom:6, left:6, right:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                  <Eye size={9} color="white" />
                  <span style={{ fontSize:"0.5625rem", color:"white", fontWeight:700 }}>{fmt(tiktoks[0].plays||0)}</span>
                </div>
              </div>
            </div>
          </a>
        )}

        {/* TikTok 2 — top right small */}
        {tiktoks[1] && (
          <a href={tiktoks[1].video_url} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration:"none", gridColumn:"2 / 3", gridRow:"1 / 2" }}>
            <div style={{ position:"relative", borderRadius:10, overflow:"hidden", height:76, background:"#111" }}>
              {tiktoks[1].thumbnail_url && <img src={proxyThumb(tiktoks[1].thumbnail_url)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
              <div style={{ position:"absolute", top:5, left:5 }}><TikTokIcon size={9} /></div>
              <div style={{ position:"absolute", bottom:4, left:5 }}>
                <span style={{ fontSize:"0.5rem", color:"white", fontWeight:700 }}>{fmt(tiktoks[1].plays||0)}</span>
              </div>
            </div>
          </a>
        )}

        {/* YouTube — wide landscape */}
        {youtubes[0] && (
          <a href={(youtubes[0] as any).url||"#"} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration:"none", gridColumn:"2 / 4", gridRow:"2 / 3" }}>
            <div style={{ position:"relative", borderRadius:10, overflow:"hidden", height:76, background:"#111" }}>
              {(youtubes[0] as any).thumbnail_url ?? (youtubes[0] as any).thumbnail && <img src={(youtubes[0] as any).thumbnail_url ?? (youtubes[0] as any).thumbnail} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:20, height:20, background:"rgba(255,0,0,0.85)", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Play size={8} color="white" fill="white" />
                </div>
              </div>
              <div style={{ position:"absolute", bottom:4, left:6 }}>
                <span style={{ fontSize:"0.5rem", color:"white", fontWeight:700 }}>{fmt((youtubes[0] as any).views||0)} views</span>
              </div>
            </div>
          </a>
        )}

        {/* TikTok 3 — top far right */}
        {tiktoks[2] && (
          <a href={tiktoks[2].video_url} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration:"none", gridColumn:"4 / 5", gridRow:"1 / 2" }}>
            <div style={{ position:"relative", borderRadius:10, overflow:"hidden", height:76, background:"#111" }}>
              {tiktoks[2].thumbnail_url && <img src={proxyThumb(tiktoks[2].thumbnail_url)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
              <div style={{ position:"absolute", top:5, left:5 }}><TikTokIcon size={9} /></div>
              <div style={{ position:"absolute", bottom:4, left:5 }}>
                <span style={{ fontSize:"0.5rem", color:"white", fontWeight:700 }}>{fmt(tiktoks[2].plays||0)}</span>
              </div>
            </div>
          </a>
        )}

        {/* Instagram or TikTok 4 — bottom far right */}
        {(instas[0] || tiktoks[3]) && (() => {
          const v = instas[0] || tiktoks[3]
          const isInsta = !!instas[0]
          const href = isInsta ? (v.url||v.post_url||"#") : v.video_url
          const thumb = isInsta ? (v.image_url||v.thumbnail) : proxyThumb(v.thumbnail_url)
          return (
            <a href={href} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration:"none", gridColumn:"4 / 5", gridRow:"2 / 3" }}>
              <div style={{ position:"relative", borderRadius:10, overflow:"hidden", height:76, background:"#111" }}>
                {thumb && <img src={thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
                <div style={{ position:"absolute", top:5, left:5 }}>{isInsta ? <InstaIcon size={9} /> : <TikTokIcon size={9} />}</div>
              </div>
            </a>
          )
        })()}
      </div>

      {/* ── News strip ── */}
      {news.length > 0 && (
        <div style={{ borderTop:"1px solid var(--separator)", paddingTop:10, display:"flex", flexDirection:"column", gap:6 }}>
          <p style={{ fontSize:"0.5625rem", fontWeight:700, color:"var(--secondary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>
            📰 Latest News
          </p>
          {news.slice(0, 2).map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ textDecoration:"none", display:"flex", alignItems:"flex-start", gap:7,
                background:"rgba(0,0,0,0.03)", borderRadius:8, padding:"7px 9px" }}>
              <GoogleNewsIcon size={13} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:"0.6875rem", fontWeight:600, color:"var(--foreground)", margin:0, lineHeight:1.35,
                  overflow:"hidden", display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical" as any }}>
                  {item.title}
                </p>
                <span style={{ fontSize:"0.5625rem", color:"var(--tertiary)" }}>{item.source} · {item.time_ago}</span>
              </div>
              <ExternalLink style={{ width:9, height:9, color:"var(--tertiary)", flexShrink:0, marginTop:2 }} />
            </a>
          ))}
        </div>
      )}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", gap:6, background:"rgba(0,0,0,0.04)", borderRadius:12, padding:4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            padding:"8px 12px", borderRadius:9, border:"none", cursor:"pointer",
            background: tab === t.id ? "var(--card)" : "transparent",
            color: tab === t.id ? t.color : "var(--secondary)",
            fontWeight: tab === t.id ? 700 : 500, fontSize:"0.8125rem",
            boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            transition:"all 0.15s"
          }}>
            {t.icon}{t.label}
            <span style={{ fontSize:"0.5625rem", background:"rgba(0,0,0,0.08)", padding:"2px 5px", borderRadius:99 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "tiktok" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {tiktoks.map((v, i) => (
            <a key={i} href={v.video_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
              <div style={{ position:"relative", borderRadius:10, overflow:"hidden", aspectRatio:"9/16", background:"#000" }}>
                {v.thumbnail_url && <img src={proxyThumb(v.thumbnail_url)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />
                <div style={{ position:"absolute", bottom:8, left:8, right:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                    <Eye size={10} color="white" /><span style={{ fontSize:"0.5625rem", color:"white", fontWeight:700 }}>{fmt(v.plays||0)}</span>
                    <Heart size={10} color="white" style={{ marginLeft:4 }} /><span style={{ fontSize:"0.5625rem", color:"white", fontWeight:700 }}>{fmt(v.likes||0)}</span>
                  </div>
                  <p style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.8)", lineHeight:1.3, margin:0, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any }}>{v.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {tab === "youtube" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {youtubes.map((v: any, i) => (
            <a key={i} href={v.url||"#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ position:"relative", borderRadius:8, overflow:"hidden", width:140, flexShrink:0, aspectRatio:"16/9", background:"#000" }}>
                {v.thumbnail_url ?? v.thumbnail ? <img src={v.thumbnail_url ?? v.thumbnail} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:28, height:28, background:"rgba(255,0,0,0.85)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Play size={12} color="white" fill="white" />
                  </div>
                </div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", margin:"0 0 4px", lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any }}>{v.title}</p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <span style={{ fontSize:"0.625rem", color:"var(--secondary)" }}>{fmt(v.views||0)} views</span>
                  <span style={{ fontSize:"0.625rem", color:"var(--tertiary)" }}>{v.channel||"@67coin"}</span>
                  {v.published_at && <span style={{ fontSize:"0.625rem", color:"var(--tertiary)" }}>{timeAgo(v.published_at)}</span>}
                </div>
              </div>
            </a>
          ))}
          {youtubes.length === 0 && <p style={{ textAlign:"center", color:"var(--tertiary)", padding:"20px 0", fontSize:"0.875rem" }}>No YouTube data yet</p>}
        </div>
      )}

      {tab === "news" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {news.length > 0 ? news.map((item, i) => <NewsRow key={i} item={item} />) : (
            <div style={{ textAlign:"center", padding:"32px 20px" }}>
              <Newspaper style={{ width:40, height:40, color:"var(--tertiary)", margin:"0 auto 12px" }} />
              <p style={{ fontSize:"0.875rem", color:"var(--secondary)", fontWeight:600 }}>No news yet</p>
              <p style={{ fontSize:"0.75rem", color:"var(--secondary)", marginTop:4 }}>Refreshes every 2 hours</p>
            </div>
          )}
        </div>
      )}

      {tab === "instagram" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {instas.map((v: any, i) => (
            <a key={i} href={v.url||v.post_url||"#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
              <div style={{ position:"relative", borderRadius:10, overflow:"hidden", aspectRatio:"1/1", background:"#222" }}>
                {(v.image_url||v.thumbnail) && <img src={v.image_url||v.thumbnail} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
                <div style={{ position:"absolute", bottom:6, left:6, display:"flex", alignItems:"center", gap:3 }}>
                  <Heart size={10} color="white" fill="white" /><span style={{ fontSize:"0.5625rem", color:"white", fontWeight:700 }}>{fmt(v.likes||0)}</span>
                </div>
              </div>
            </a>
          ))}
          {instas.length === 0 && <p style={{ fontSize:"0.875rem", color:"var(--tertiary)", textAlign:"center", padding:"20px 0", gridColumn:"1/-1" }}>Fetching Instagram posts…</p>}
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Social Media Spotlight"
      subtitle="TikTok · YouTube · Instagram · News"
      liveTag="Live"
      icon={
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ display:"flex", gap:4 }}>
            <TikTokIcon size={12} />
            <YouTubeIcon size={12} />
          </div>
          <InstaIcon size={12} />
        </div>
      }
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
