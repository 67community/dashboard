"use client"


import { TokenHealthCard }     from "@/components/cards/token-health"
import { SocialPulseCard }     from "@/components/cards/social-pulse"
import { CommunityCard }       from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
import { ContentCreatorCard }  from "@/components/cards/content-creator"
import { PostTimingCard }      from "@/components/cards/post-timing"
import { AgentStatusCard }     from "@/components/cards/agent-status"
import { MilestonesCard }      from "@/components/cards/milestones"
import { useAppData }          from "@/lib/data-context"
import { AnimatedNumber }      from "@/components/ui/animated-number"

export default function Dashboard() {
  const { data, livePrice, liveChange24h } = useAppData()
  const up = (liveChange24h ?? data?.token_health?.price_change_24h ?? 0) >= 0

  return (
    <div>
      {/* ══ Stripe-style hero band ══════════════════════════════ */}
      <div className="enter-1 hero-band" style={{
        position:"relative", borderRadius:24, overflow:"hidden",
        marginBottom:36, padding:"44px 48px 52px",
        background:"#0A0A0A",
        minHeight:180,
      }}>
        {/* Dark → gold gradient — single brand color, clean */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          {/* Base: pure dark to warm dark */}
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(115deg, #0A0A0A 0%, #111108 40%, #2A1A00 70%, #7A4500 90%, #C8820A 100%)" }} />
          {/* Gold flare right */}
          <div style={{ position:"absolute", inset:0,
            background:"radial-gradient(ellipse at 95% 50%, rgba(245,166,35,0.70) 0%, transparent 50%)" }} />
          {/* Subtle warm center */}
          <div style={{ position:"absolute", inset:0,
            background:"radial-gradient(ellipse at 55% 100%, rgba(245,166,35,0.12) 0%, transparent 50%)" }} />
          {/* Diagonal rays */}
          <div style={{ position:"absolute", inset:0,
            backgroundImage:`repeating-linear-gradient(112deg, transparent, transparent 28px, rgba(255,255,255,0.022) 28px, rgba(255,255,255,0.022) 29px)` }} />
        </div>

        {/* Content */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://raw.githubusercontent.com/67coin/67/main/logo.png" alt="67"
              style={{ width:48, height:48, borderRadius:"50%", objectFit:"cover",
                boxShadow:"0 0 24px rgba(245,166,35,0.6)" }} />
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.12em",
              textTransform:"uppercase", color:"rgba(245,166,35,0.85)" }}>
              The Official 67 Coin · Operations
            </p>
          </div>
          <h1 style={{
            fontSize:"clamp(2rem, 4.5vw, 3rem)", fontWeight:900,
            letterSpacing:"-0.05em", color:"#FFFFFF", lineHeight:1.05, margin:0,
          }}>
            Mission Control
          </h1>
          <p style={{ fontSize:"1rem", color:"rgba(255,255,255,0.45)", marginTop:10,
            fontWeight:500, letterSpacing:"-0.01em" }}>
            Everything $67 in one place — tap any card to expand.
          </p>
        </div>
      </div>

      {/* Old page header hidden */}
      {false && <div style={{ marginBottom:40 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:24 }}>
          {/* Left */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:18 }}>
            {/* Logo */}
            <div style={{ width:56, height:56, borderRadius:"50%", overflow:"hidden", flexShrink:0, boxShadow:"0 4px 20px rgba(245,166,35,0.35)", marginTop:4 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://raw.githubusercontent.com/67coin/67/main/logo.png" alt="67" width={56} height={56} style={{ width:56, height:56, objectFit:"cover", borderRadius:"50%", display:"block" }} />
            </div>
            <div>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"#C8820A", marginBottom:10 }}>
                The Official 67 Coin · Operations
              </p>
              <h1 style={{
                fontSize:"clamp(1.75rem, 4vw, 2.375rem)",
                fontWeight:900,
                letterSpacing:"-0.045em",
                color:"#09090B",
                lineHeight:1.05,
                margin:0,
              }}>
                Mission Control
              </h1>
              <p style={{ fontSize:"0.9375rem", color:"#71717A", fontWeight:500, marginTop:8, lineHeight:1.5 }}>
                Everything $67 in one place — tap any card to expand.
              </p>
            </div>
          </div>

          {/* spacing */}
          <div />
        </div>

        {/* Divider */}
        <div className="divider" style={{ marginTop:32 }} />
      </div>}
      <style>{`
        @media (max-width: 500px)  { .hero-stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ══ Cards Grid ═════════════════════════════════════════ */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3, 1fr)",
        gap:20,
      }}
        className="cards-grid"
      >
        <div className="enter-3" style={{ display:"flex" }}><TokenHealthCard /></div>
        <div className="enter-4" style={{ display:"flex" }}><SocialPulseCard /></div>
        <div className="enter-5" style={{ display:"flex" }}><CommunityCard /></div>
        <div className="enter-6" style={{ display:"flex" }}><ContentPipelineCard /></div>
        <div className="enter-7" style={{ display:"flex" }}><AgentStatusCard /></div>
        <div className="enter-8" style={{ display:"flex" }}><MilestonesCard /></div>
        <div className="enter-9" style={{ display:"flex" }}><ContentCreatorCard /></div>
        <div className="enter-9" style={{ display:"flex" }}><PostTimingCard /></div>
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
