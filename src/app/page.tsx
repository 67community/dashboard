"use client"


import { TokenHealthCard }     from "@/components/cards/token-health"
import { SocialPulseCard }     from "@/components/cards/social-pulse"
import { CommunityCard }       from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
import { AgentStatusCard }     from "@/components/cards/agent-status"
import { MilestonesCard }      from "@/components/cards/milestones"
import { useAppData }          from "@/lib/data-context"

export default function Dashboard() {
  const { data, livePrice, liveChange24h } = useAppData()
  const up = (liveChange24h ?? data?.token_health?.price_change_24h ?? 0) >= 0

  return (
    <div>
      {/* ══ Page Header ════════════════════════════════════════ */}
      <div style={{ marginBottom:40 }}>
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

          {/* Live price chip */}
          {livePrice ? (
            <div style={{ flexShrink:0 }}>
              <div style={{
                background:"#0A0A0A",
                borderRadius:14,
                padding:"14px 18px",
                minWidth:130,
              }}>
                <p style={{ fontSize:"0.625rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:6 }}>
                  Live Price
                </p>
                <p style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.05em", color:"#fff", lineHeight:1 }}>
                  ${livePrice < 0.001 ? livePrice.toFixed(6) : livePrice.toFixed(5)}
                </p>
                <span className={up ? "badge-up" : "badge-down"} style={{ marginTop:8, display:"inline-flex" }}>
                  {up ? "▲" : "▼"} {Math.abs(liveChange24h ?? 0).toFixed(2)}% 24h
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Divider */}
        <div className="divider" style={{ marginTop:32 }} />
      </div>

      {/* ══ Cards Grid ═════════════════════════════════════════ */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3, 1fr)",
        gap:20,
      }}
        className="cards-grid"
      >
        <TokenHealthCard />
        <SocialPulseCard />
        <CommunityCard />
        <ContentPipelineCard />
        <AgentStatusCard />
        <MilestonesCard />
      </div>

      {/* ══ Season 2 Banner ════════════════════════════════════ */}
      <div style={{
        marginTop:24,
        borderRadius:20,
        overflow:"hidden",
        background:"#0A0A0A",
        position:"relative",
      }}>
        {/* Glow */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse at 80% 50%, rgba(245,166,35,0.12) 0%, transparent 60%)",
        }} />

        <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"40px 48px" }}>
          <div>
            <p style={{ fontSize:"0.625rem", fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:"#F5A623", marginBottom:14 }}>
              Coming Soon
            </p>
            <h2 style={{ fontSize:"clamp(1.5rem, 3.5vw, 2.125rem)", fontWeight:900, color:"#fff", letterSpacing:"-0.04em", lineHeight:1.1, margin:"0 0 12px 0" }}>
              Season 2 is Loading…
            </h2>
            <p style={{ fontSize:"0.9375rem", color:"rgba(255,255,255,0.38)", fontWeight:500, lineHeight:1.6, margin:0 }}>
              More exchanges. Bigger community.<br />
              Unstoppable momentum.
            </p>
            <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.15)", fontWeight:800, letterSpacing:"0.1em", marginTop:18 }}>
              #67to67Billion
            </p>
          </div>

          {/* Logo */}
          <div className="hidden-mobile" style={{
            width:108, height:108, borderRadius:"50%", flexShrink:0, overflow:"hidden",
            boxShadow:"0 0 60px rgba(245,166,35,0.55), 0 0 130px rgba(245,166,35,0.18)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://raw.githubusercontent.com/67coin/67/main/logo.png" alt="67" width={108} height={108} style={{ width:108, height:108, objectFit:"cover", borderRadius:"50%", display:"block" }} />
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
