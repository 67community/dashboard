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
import { EmailInboxCard }       from "@/components/cards/email-inbox"
import { MilestonesCard }       from "@/components/cards/milestones"
import { FeatureRequestCard }   from "@/components/cards/feature-request"
import { OutreachCard }         from "@/components/cards/outreach"
import { SightingsCard }        from "@/components/cards/sightings"
import { RaidCoordinatorCard }  from "@/components/cards/raid-coordinator"
import { DailyBriefingCard }    from "@/components/cards/daily-briefing"
import { CommunityEventsCard }  from "@/components/cards/events"
import { TeamNotesCard }          from "@/components/cards/team-notes"
import { AnnouncementsCard }      from "@/components/cards/announcements"
import { CommunityLeaderboardCard } from "@/components/cards/leaderboard"
import { WalletTrackerCard }       from "@/components/cards/wallet-tracker"
import { useAppData }          from "@/lib/data-context"
import { AnimatedNumber }      from "@/components/ui/animated-number"
import { McProgressBar }       from "@/components/mc-progress-bar"

export default function Dashboard() {
  const { data, livePrice, liveChange24h, liveMcap } = useAppData()
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

      {/* ══ Top Section — Community | Coin | Announcements+Raid ══════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20, marginBottom:0, alignItems:"start" }}>
        <div style={{ display:"flex", minWidth:0 }}><CommunityCard /></div>
        <div style={{ display:"flex", minWidth:0 }}><TokenHealthCard /></div>
        <div style={{ display:"flex", flexDirection:"column", gap:20, minWidth:0 }}>
          <AnnouncementsCard />
          <RaidCoordinatorCard />
        </div>
      </div>

      {/* ══ Cards Grid ═════════════════════════════════════════ */}
      <div
        className="cards-grid"
        style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20 }}
      >
        {/* Row: Content | Activities | X Spotlight */}
        <div className="enter-2" style={{ display:"flex", minWidth:0 }}><ContentPipelineCard /></div>
        <div className="enter-2" style={{ display:"flex", minWidth:0 }}><AgentStatusCard /></div>
        <div className="enter-2" style={{ display:"flex", minWidth:0 }}><SocialPulseCard /></div>
        {/* Row: TikTok | YouTube | Content Creator */}
        <div className="enter-3" style={{ display:"flex", minWidth:0 }}><TikTokSpotlightCard /></div>
        <div className="enter-3" style={{ display:"flex", minWidth:0 }}><YouTubeSpotlightCard /></div>
        <div className="enter-3" style={{ display:"flex", minWidth:0, maxHeight:280, overflow:"hidden" }}><ContentCreatorCard /></div>
        {/* Row: Wallet Tracker | Outreach | News Feed */}
        <div className="enter-4" style={{ display:"flex", minWidth:0, maxHeight:280, overflow:"hidden" }}><WalletTrackerCard /></div>
        <div className="enter-4" style={{ display:"flex", minWidth:0 }}><OutreachCard /></div>
        <div className="enter-4" style={{ display:"flex", minWidth:0 }}><NewsFeedCard /></div>
        {/* Row: X Live Feed | Post Timing | Daily Briefing */}
        <div className="enter-5" style={{ display:"flex", minWidth:0 }}><XLiveFeedCard /></div>
        <div className="enter-5" style={{ display:"flex", minWidth:0 }}><PostTimingCard /></div>
        <div className="enter-5" style={{ display:"flex", minWidth:0 }}><DailyBriefingCard /></div>
        <div className="enter-4" style={{ display:"flex", minWidth:0 }}><SocialPulseCard /></div>
        <div className="enter-6" style={{ display:"flex", minWidth:0 }}><PostTimingCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><EmailInboxCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><InstagramSpotlightCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><FeatureRequestCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><SightingsCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><CommunityEventsCard /></div>
        <div className="enter-9" style={{ display:"flex", minWidth:0 }}><CommunityLeaderboardCard /></div>
      </div>

      {/* ══ Top Section — Community | Coin | Announcements+Raid ══════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20, marginBottom:0, alignItems:"start" }}>
        <div style={{ display:"flex", minWidth:0 }}><CommunityCard /></div>
        <div style={{ display:"flex", minWidth:0 }}><TokenHealthCard /></div>
        <div style={{ display:"flex", flexDirection:"column", gap:20, minWidth:0 }}>
          <AnnouncementsCard />
          <RaidCoordinatorCard />
        </div>
      </div>

            {/* ══ Season 2 Banner ════════════════════════════════════ */}
      <div className="enter-9" style={{
        marginTop:24, borderRadius:20,
        position:"relative", overflow:"hidden",
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
          padding:"28px 48px 32px",
        }}>
          {/* Pill badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:5,
            background:"rgba(245,166,35,0.12)", border:"1px solid rgba(245,166,35,0.28)",
            borderRadius:99, padding:"4px 11px", marginBottom:12 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"#F5A623",
              boxShadow:"0 0 6px rgba(245,166,35,0.9)", display:"inline-block" }} />
            <span style={{ fontSize:"0.625rem", fontWeight:700, letterSpacing:"0.1em",
              textTransform:"uppercase", color:"#F5A623" }}>Coming Soon</span>
          </div>

          <h2 style={{ fontSize:"clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight:900,
            color:"#FFFFFF", letterSpacing:"-0.045em", lineHeight:1.05,
            margin:"0 0 6px 0" }}>
            Season 2 is Loading…
          </h2>
          <p style={{ fontSize:"0.9375rem", color:"rgba(255,255,255,0.4)",
            fontWeight:500, letterSpacing:"-0.01em", maxWidth:440, lineHeight:1.5 }}>
            Unstoppable momentum.
          </p>

          {/* Live MC Progress Bar */}
          <div style={{ width:"100%", maxWidth:"100%", marginTop:4 }}>
            <McProgressBar mcap={liveMcap ?? data?.token_health?.market_cap ?? null} />
          </div>
        </div>
      </div>

      {/* ══ Notes row ══════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20 }}>
        <div style={{ display:"flex", minWidth:0, maxHeight:300, overflow:"hidden" }}><TeamNotesCard /></div>
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
