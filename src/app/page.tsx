"use client"


import { TokenHealthCard }     from "@/components/cards/token-health"
import { SocialPulseCard }     from "@/components/cards/social-pulse"
import { CommunityCard }       from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
import { ContentCreatorCard }  from "@/components/cards/content-creator"
import { PostTimingCard }        from "@/components/cards/post-timing"
import { TikTokSpotlightCard }       from "@/components/cards/tiktok-spotlight"
import { YouTubeSpotlightCard }      from "@/components/cards/youtube-spotlight"
import { InstagramSpotlightCard }    from "@/components/cards/instagram-spotlight"
import { XLiveFeedCard }             from "@/components/cards/x-live-feed"
import { NewsFeedCard }              from "@/components/cards/news-feed"
import { AgentStatusCard }      from "@/components/cards/agent-status"
import { MilestonesCard }       from "@/components/cards/milestones"
import { FeatureRequestCard }   from "@/components/cards/feature-request"
import { OutreachCard }         from "@/components/cards/outreach"
import { SightingsCard }        from "@/components/cards/sightings"
import { RaidCoordinatorCard }  from "@/components/cards/raid-coordinator"
import { DailyBriefingCard }    from "@/components/cards/daily-briefing"
import { CommunityEventsCard }  from "@/components/cards/events"
import { TeamNotesCard }          from "@/components/cards/team-notes"
import { ExchangeTrackerCard }    from "@/components/cards/exchange-tracker"
import { AnnouncementsCard }      from "@/components/cards/announcements"
import { PriceMilestonesCard }    from "@/components/cards/price-milestones"
import { CommunityLeaderboardCard } from "@/components/cards/leaderboard"
import { WalletTrackerCard }       from "@/components/cards/wallet-tracker"
import { useAppData }          from "@/lib/data-context"
import { AnimatedNumber }      from "@/components/ui/animated-number"

export default function Dashboard() {
  const { data, livePrice, liveChange24h } = useAppData()
  const up     = (liveChange24h ?? data?.token_health?.price_change_24h ?? 0) >= 0
  const market = (data?.market_data ?? []) as { symbol:string; name:string; emoji:string; price:number; change_pct:number; kind:string }[]

  function fmtP(n: number, kind: string) {
    if (kind === "index") return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
    if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }

  return (
    <div>
      {/* ══ Slim identity strip ═════════════════════════════════ */}
      <div className="enter-1" style={{
        display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
        marginBottom:20, paddingBottom:14,
        borderBottom:"1px solid rgba(0,0,0,0.07)",
      }}>
        {/* Logo + title */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://raw.githubusercontent.com/67coin/67/main/logo.png" alt="67"
          style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
        <span style={{ fontSize:"0.8125rem", fontWeight:800, color:"#0A0A0A",
          letterSpacing:"-0.02em", marginRight:4 }}>
          Mission Control
        </span>

        {/* Divider */}
        <span style={{ width:1, height:14, background:"rgba(0,0,0,0.12)", flexShrink:0 }} />

        {/* $67 live price pill */}
        {(livePrice ?? 0) > 0 && (
          <span style={{
            display:"inline-flex", alignItems:"center", gap:5,
            fontSize:"0.6875rem", fontWeight:700,
            color: up ? "#059669" : "#EF4444",
            background: up ? "rgba(5,150,105,0.09)" : "rgba(239,68,68,0.09)",
            border: `1.5px solid ${up ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.15)"}`,
            padding:"3px 9px", borderRadius:99,
          }}>
            <span style={{ fontWeight:800 }}>$67</span>
            ${(livePrice ?? 0).toFixed(6)}
            <span style={{ opacity:0.85 }}>
              {up ? "▲" : "▼"}{Math.abs(liveChange24h ?? 0).toFixed(1)}%
            </span>
          </span>
        )}

        {/* Market pills */}
        {market.map((m, i) => {
          const mUp = m.change_pct >= 0
          return (
            <span key={i} style={{
              display:"inline-flex", alignItems:"center", gap:4,
              fontSize:"0.6875rem", fontWeight:600,
              color:"#374151",
              background:"#FFF",
              border:"1.5px solid rgba(0,0,0,0.07)",
              padding:"3px 8px", borderRadius:99,
              whiteSpace:"nowrap",
            }}>
              <span style={{ fontSize:"0.7rem" }}>{m.emoji}</span>
              <span style={{ fontWeight:700, color:"#1D1D1F" }}>
                {m.symbol.replace("-USD","").replace("=F","")}
              </span>
              <span style={{ fontVariantNumeric:"tabular-nums" }}>
                ${fmtP(m.price, m.kind)}
              </span>
              <span style={{
                fontSize:"0.625rem", fontWeight:700,
                color: mUp ? "#059669" : "#DC2626",
              }}>
                {mUp ? "▲" : "▼"}{Math.abs(m.change_pct).toFixed(1)}%
              </span>
            </span>
          )
        })}
      </div>


      <style>{`
        @media (max-width: 500px)  { .hero-stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ══ Cards Grid ═════════════════════════════════════════ */}
      <div
        className="cards-grid"
        style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20 }}
      >
        <div className="enter-2" style={{ display:"flex", minWidth:0 }}><DailyBriefingCard /></div>
        <div className="enter-3" style={{ display:"flex", minWidth:0 }}><TokenHealthCard /></div>
        <div className="enter-4" style={{ display:"flex", minWidth:0 }}><SocialPulseCard /></div>
        <div className="enter-5" style={{ display:"flex", minWidth:0 }}><CommunityCard /></div>
        <div className="enter-6" style={{ display:"flex", minWidth:0 }}><ContentPipelineCard /></div>
        <div className="enter-7" style={{ display:"flex", minWidth:0 }}><AgentStatusCard /></div>
        <div className="enter-8" style={{ display:"flex", minWidth:0 }}><MilestonesCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><ContentCreatorCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><PostTimingCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><TikTokSpotlightCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><YouTubeSpotlightCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><InstagramSpotlightCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><XLiveFeedCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><NewsFeedCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><WalletTrackerCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><FeatureRequestCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><OutreachCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><SightingsCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><RaidCoordinatorCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><CommunityEventsCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><TeamNotesCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><ExchangeTrackerCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><AnnouncementsCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><PriceMilestonesCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><CommunityLeaderboardCard /></div>
      </div>

      {/* ══ Season 2 Banner ════════════════════════════════════ */}
      <div className="enter-9" style={{
        marginTop:24, borderRadius:24,
        position:"relative", minHeight:220, overflow:"hidden",
      }}>
        {/* Base: dark → gold, same language as hero */}
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(115deg, #0A0A0A 0%, #111108 40%, #2A1A00 70%, #7A4500 90%, #C8820A 100%)" }} />
        {/* LEFT gold glow */}
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 5% 50%, rgba(245,166,35,0.18) 0%, transparent 40%)" }} />
        {/* RIGHT gold burst */}
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 95% 50%, rgba(245,166,35,0.75) 0%, transparent 48%)" }} />
        {/* Diagonal rays */}
        <div style={{ position:"absolute", inset:0,
          backgroundImage:`repeating-linear-gradient(112deg, transparent, transparent 28px, rgba(255,255,255,0.022) 28px, rgba(255,255,255,0.022) 29px)` }} />
        {/* Top shimmer */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg, transparent 0%, rgba(245,166,35,0.4) 50%, transparent 100%)" }} />

        {/* ── Content — centered ── */}
        <div className="season-banner-inner" style={{
          position:"relative", zIndex:1,
          display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", textAlign:"center",
          padding:"52px 60px",
        }}>
          {/* Pill badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:6,
            background:"rgba(245,166,35,0.12)", border:"1px solid rgba(245,166,35,0.28)",
            borderRadius:99, padding:"5px 14px", marginBottom:20 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#F5A623",
              boxShadow:"0 0 8px rgba(245,166,35,0.9)", display:"inline-block" }} />
            <span style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em",
              textTransform:"uppercase", color:"#F5A623" }}>Coming Soon</span>
          </div>

          <h2 style={{ fontSize:"clamp(2.25rem, 5vw, 3.5rem)", fontWeight:900,
            color:"#FFFFFF", letterSpacing:"-0.055em", lineHeight:1.05,
            margin:"0 0 16px 0" }}>
            Season 2 is Loading…
          </h2>
          <p style={{ fontSize:"1.125rem", color:"rgba(255,255,255,0.45)",
            fontWeight:500, letterSpacing:"-0.01em", maxWidth:480, lineHeight:1.6 }}>
            Unstoppable momentum.
          </p>
          <p style={{ fontSize:"0.6875rem", color:"rgba(255,255,255,0.18)",
            fontWeight:800, letterSpacing:"0.15em", marginTop:24,
            textTransform:"uppercase" }}>
            #67to67Billion
          </p>
        </div>
      </div>

      {/* Responsive grid styles */}
      <style>{`
        @media (max-width: 1024px) { .cards-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .cards-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px)  { .hidden-mobile { display: none !important; } }
      `}</style>
    </div>
  )
}
