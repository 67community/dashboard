"use client"
import React from "react"
import ReactDOM from "react-dom"


import { TokenHealthCard }     from "@/components/cards/token-health"
import { CommunityCard }       from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
import { ContentCreatorCard }  from "@/components/cards/content-creator"
import { PostTimingCard }        from "@/components/cards/post-timing"
import { TikTokSpotlightCard }       from "@/components/cards/tiktok-spotlight"
import { SocialMediaSpotlightCard }  from "@/components/cards/social-media-spotlight"
import { YouTubeSpotlightCard }      from "@/components/cards/youtube-spotlight"
import { InstagramSpotlightCard }    from "@/components/cards/instagram-spotlight"
import { XLiveFeedCard }             from "@/components/cards/x-live-feed"
import { AgentStatusCard }      from "@/components/cards/agent-status"
import { EmailInboxCard }       from "@/components/cards/email-inbox"
import { MilestonesCard }       from "@/components/cards/milestones"
import { FeatureRequestCard, FeatureRequestSection }   from "@/components/cards/feature-request"
import { OutreachCard }         from "@/components/cards/outreach"
import { SightingsCard }        from "@/components/cards/sightings"
import { RaidCoordinatorCard }  from "@/components/cards/raid-coordinator"
import { DailyBriefingCard }    from "@/components/cards/daily-briefing"
import { CommunityEventsCard }  from "@/components/cards/events"
import { TeamNotesCard }          from "@/components/cards/team-notes"
import { AnnouncementsCard }      from "@/components/cards/announcements"
import { CommunityLeaderboardCard } from "@/components/cards/leaderboard"
import { XRaidCard } from "@/components/cards/x-raid"
import { WalletTrackerCard }       from "@/components/cards/wallet-tracker"
import { useAppData }          from "@/lib/data-context"
import { AnimatedNumber }      from "@/components/ui/animated-number"
import { McProgressBar }       from "@/components/mc-progress-bar"


function FeatureRequestMini() {
  const [open, setOpen] = React.useState(false)
  const [what, setWhat] = React.useState("")
  const [why,  setWhy]  = React.useState("")
  const [sent, setSent] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!what.trim() || !why.trim()) return
    setSent(true)
    try { await fetch("/api/feature-request", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ what, why }) }) } catch {}
    setTimeout(() => { setSent(false); setWhat(""); setWhy(""); setOpen(false) }, 1800)
  }
  const dropdown = (
    <>
      <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:99998 }} />
      <div onClick={e=>e.stopPropagation()}
        style={{ position:"fixed", top:56, right:20, zIndex:99999,
          background:"var(--card)", borderRadius:14, boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
          padding:16, width:280, display:"flex", flexDirection:"column", gap:10,
          border:"1px solid rgba(0,0,0,0.08)" }}>
        <p style={{ fontSize:"0.6875rem", fontWeight:800, color:"var(--foreground)", margin:0 }}>⚡ Feature Request</p>
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <input value={what} onChange={e=>setWhat(e.target.value)} placeholder="What to build?"
            style={{ fontSize:"0.75rem", padding:"7px 10px", borderRadius:8, border:"1.5px solid #E5E7EB", fontFamily:"inherit", background:"#F9F9F9", outline:"none", width:"100%", boxSizing:"border-box" }}
            onFocus={e=>e.currentTarget.style.borderColor="#F5A623"} onBlur={e=>e.currentTarget.style.borderColor="#E5E7EB"} />
          <input value={why} onChange={e=>setWhy(e.target.value)} placeholder="Why? (value / problem)"
            style={{ fontSize:"0.75rem", padding:"7px 10px", borderRadius:8, border:"1.5px solid #E5E7EB", fontFamily:"inherit", background:"#F9F9F9", outline:"none", width:"100%", boxSizing:"border-box" }}
            onFocus={e=>e.currentTarget.style.borderColor="#F5A623"} onBlur={e=>e.currentTarget.style.borderColor="#E5E7EB"} />
          <button type="submit" disabled={!what.trim()||!why.trim()||sent}
            style={{ padding:"8px 12px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:700, fontSize:"0.75rem",
              background: sent ? "#059669" : (!what.trim()||!why.trim()) ? "#D1D5DB" : "#F5A623", color:"#fff" }}>
            {sent ? "✓ Submitted!" : "Submit"}
          </button>
        </form>
      </div>
    </>
  )
  return (
    <div style={{ position:"relative", flexShrink:0 }}>
      <button onClick={e=>{ e.stopPropagation(); setOpen(o=>!o) }}
        style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:"0.6875rem", fontWeight:700,
          padding:"4px 10px", borderRadius:99, border:"1.5px solid rgba(245,166,35,0.3)",
          background:"rgba(245,166,35,0.08)", color:"#D97706", cursor:"pointer", whiteSpace:"nowrap" }}>
        ⚡ Feature Request
      </button>
      {open && mounted && ReactDOM.createPortal(dropdown, document.body)}
    </div>
  )
}

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

        {/* Market pills — compact */}
        <div style={{ display:"flex", flexWrap:"nowrap", gap:4, flex:1, overflowX:"auto", scrollbarWidth:"none" }}>
          {market.map((m, i) => {
            const mUp = m.change_pct >= 0
            return (
              <span key={i} style={{
                display:"inline-flex", alignItems:"center", gap:3,
                fontSize:"0.5625rem", fontWeight:600,
                background:"rgba(0,0,0,0.04)",
                border:"1px solid rgba(0,0,0,0.06)",
                padding:"2px 6px", borderRadius:99,
                whiteSpace:"nowrap",
              }}>
                <span style={{ fontSize:"0.6rem" }}>{m.emoji}</span>
                <span style={{ fontWeight:800, color:"var(--foreground)" }}>
                  {m.symbol.replace("-USD","").replace("=F","")}
                </span>
                <span style={{ color:"var(--foreground)", fontVariantNumeric:"tabular-nums" }}>
                  ${fmtP(m.price, m.kind)}
                </span>
                <span style={{ fontWeight:700, color: mUp ? "#059669" : "#DC2626" }}>
                  {mUp ? "▲" : "▼"}{Math.abs(m.change_pct).toFixed(1)}%
                </span>
              </span>
            )
          })}
        </div>

        {/* Feature Request mini form */}
        <FeatureRequestMini />
      </div>


      <style>{`
        @media (max-width: 500px)  { .hero-stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ══ Main Layout: Left + Right ══════════════════════════ */}
      <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>

        {/* ── Left Section (2 cols) ── */}
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:20 }}>

          {/* Row 1: Community | CoinHealth */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div style={{ display:"flex", minWidth:0 }}><CommunityCard /></div>
            <div style={{ display:"flex", minWidth:0 }}><TokenHealthCard /></div>
          </div>

          {/* Row 2: Team Notes */}
          <div style={{ display:"flex", minWidth:0 }}><TeamNotesCard /></div>

          {/* Row 3: Social Media | Content Creator */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div style={{ display:"flex", minWidth:0 }}><SocialMediaSpotlightCard /></div>
            <div style={{ display:"flex", minWidth:0, overflow:"hidden" }}><ContentCreatorCard /></div>
          </div>

          {/* Row 4: Cards Grid */}
          <div className="cards-grid" style={{ display:"grid", gap:20 }}>
            <div className="enter-4" style={{ display:"flex", minWidth:0 }}><ContentPipelineCard /></div>
            <div className="enter-6" style={{ display:"flex", minWidth:0 }}><SightingsCard /></div>
            <div className="enter-7" style={{ display:"flex", minWidth:0 }}><CommunityEventsCard /></div>
          </div>
        </div>

        {/* ── Right Section ── */}
        <div style={{ width:320, flexShrink:0, display:"flex", flexDirection:"column", gap:20 }}>
          <AnnouncementsCard />
          <XRaidCard />
          <WalletTrackerCard />
          <AgentStatusCard />
          <CommunityLeaderboardCard />
        </div>
      </div>

      {/* ══ Season 2 Banner ════════════════════════════════════ */}
      <div style={{ marginTop:8, borderRadius:20, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(115deg, #0A0A0A 0%, #111108 40%, #2A1A00 70%, #7A4500 90%, #C8820A 100%)" }} />
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 5% 50%, rgba(245,166,35,0.18) 0%, transparent 40%)" }} />
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 95% 50%, rgba(245,166,35,0.75) 0%, transparent 48%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:`repeating-linear-gradient(112deg, transparent, transparent 28px, rgba(255,255,255,0.022) 28px, rgba(255,255,255,0.022) 29px)` }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg, transparent 0%, rgba(245,166,35,0.4) 50%, transparent 100%)" }} />
        <div className="season-banner-inner" style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"28px 48px 32px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(245,166,35,0.12)", border:"1px solid rgba(245,166,35,0.28)", borderRadius:99, padding:"4px 11px", marginBottom:12 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"#F5A623", boxShadow:"0 0 6px rgba(245,166,35,0.9)", display:"inline-block" }} />
            <span style={{ fontSize:"0.625rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5A623" }}>Coming Soon</span>
          </div>
          <h2 style={{ fontSize:"clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight:900, color:"#FFFFFF", letterSpacing:"-0.045em", lineHeight:1.05, margin:"0 0 6px 0" }}>Season 2 is Loading…</h2>
          <p style={{ fontSize:"0.9375rem", color:"rgba(255,255,255,0.4)", fontWeight:500, letterSpacing:"-0.01em", maxWidth:440, lineHeight:1.5 }}>Unstoppable momentum.</p>
          <div style={{ width:"100%", maxWidth:"100%", marginTop:4 }}>
            <McProgressBar mcap={liveMcap ?? data?.token_health?.market_cap ?? null} />
          </div>
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
