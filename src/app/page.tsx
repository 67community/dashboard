"use client"


import { TokenHealthCard }     from "@/components/cards/token-health"
import { SocialPulseCard }     from "@/components/cards/social-pulse"
import { CommunityCard }       from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
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
      <div className="enter-1" style={{
        position:"relative", borderRadius:24, overflow:"hidden",
        marginBottom:36, padding:"44px 48px 52px",
        background:"#0A0A0A",
        minHeight:180,
      }}>
        {/* Multi-layer gradient — dark navy → gold, diagonal */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          {/* Base gradient */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(115deg, #0D0D14 0%, #1A1028 30%, #2D1A0E 60%, #7A3D00 80%, #C8820A 100%)",
          }} />
          {/* Gold flare right */}
          <div style={{
            position:"absolute", inset:0,
            background:"radial-gradient(ellipse at 90% 50%, rgba(245,166,35,0.65) 0%, transparent 55%)",
          }} />
          {/* Purple/dark flare left */}
          <div style={{
            position:"absolute", inset:0,
            background:"radial-gradient(ellipse at 5% 60%, rgba(80,40,160,0.5) 0%, transparent 45%)",
          }} />
          {/* Diagonal ray lines — exact Stripe technique */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:`repeating-linear-gradient(
              112deg,
              transparent,
              transparent 28px,
              rgba(255,255,255,0.025) 28px,
              rgba(255,255,255,0.025) 29px
            )`,
          }} />
          {/* Noise overlay for texture */}
          <div style={{
            position:"absolute", inset:0, opacity:0.04,
            backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }} />
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

      {/* ══ Hero Stats Row — Apple style, breathable ══════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:32 }}
        className="hero-stats-grid enter-2">
        {([
          {
            label: "Live Price",
            raw:   livePrice ?? data?.token_health?.price ?? 0,
            fmt:   (n: number) => n > 0 ? `$${n < 0.001 ? n.toFixed(6) : n.toFixed(5)}` : "—",
            sub:   `${up ? "▲" : "▼"} ${Math.abs(liveChange24h ?? data?.token_health?.price_change_24h ?? 0).toFixed(2)}% today`,
            upState: up,
          },
          {
            label: "Market Cap",
            raw:   data?.token_health?.market_cap ?? 0,
            fmt:   (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : n > 0 ? `$${n}` : "—",
            sub:   `Rank #${data?.token_health?.cmc_rank ?? "—"} on CMC`,
            upState: null,
          },
          {
            label: "Discord",
            raw:   data?.community?.discord_members ?? 0,
            fmt:   (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : n > 0 ? String(Math.round(n)) : "—",
            sub:   "113 online now",
            upState: null,
          },
          {
            label: "X Followers",
            raw:   data?.social_pulse?.twitter_followers ?? 0,
            fmt:   (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : n > 0 ? String(Math.round(n)) : "—",
            sub:   `${(data?.social_pulse?.engagement_rate ?? 0).toFixed(1)}% engagement`,
            upState: null,
          },
        ] as const).map(s => (
          <div key={s.label} className="mc-card" style={{ padding:"24px 26px 22px" }}>
            <p style={{ fontSize:"0.75rem", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"#8E8E93", marginBottom:12 }}>
              {s.label}
            </p>
            <AnimatedNumber
              value={s.raw}
              format={s.fmt as (n: number) => string}
              duration={1200}
              style={{ display:"block", fontSize:"2.25rem", fontWeight:800, letterSpacing:"-0.05em", color:"#1D1D1F", lineHeight:1, marginBottom:10, fontVariantNumeric:"tabular-nums" }}
            />
            <p style={{ fontSize:"0.875rem", fontWeight:600, color: s.upState === true ? "#1A8343" : s.upState === false ? "#C0392B" : "#8E8E93" }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px)  { .hero-stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
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
        <div className="enter-3"><TokenHealthCard /></div>
        <div className="enter-4"><SocialPulseCard /></div>
        <div className="enter-5"><CommunityCard /></div>
        <div className="enter-6"><ContentPipelineCard /></div>
        <div className="enter-7"><AgentStatusCard /></div>
        <div className="enter-8"><MilestonesCard /></div>
      </div>

      {/* ══ Season 2 Banner — Stripe gradient, same as hero ══ */}
      <div className="enter-9" style={{
        marginTop:24, borderRadius:24, overflow:"hidden",
        position:"relative", minHeight:200,
      }}>
        {/* ── Background layers ── */}
        {/* Base: dark left → warm mid → gold right */}
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(115deg, #08080F 0%, #150D28 25%, #1E0D00 55%, #6B3000 80%, #B87010 100%)" }} />
        {/* Gold flare — stronger, centered-right */}
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 85% 50%, rgba(245,166,35,0.75) 0%, transparent 50%)" }} />
        {/* Cyan/teal accent — season 2 feels futuristic */}
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 15% 80%, rgba(56,189,248,0.22) 0%, transparent 40%)" }} />
        {/* Purple depth left */}
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 0% 20%, rgba(120,60,200,0.45) 0%, transparent 40%)" }} />
        {/* Diagonal rays */}
        <div style={{ position:"absolute", inset:0,
          backgroundImage:`repeating-linear-gradient(112deg, transparent, transparent 28px, rgba(255,255,255,0.03) 28px, rgba(255,255,255,0.03) 29px)` }} />
        {/* Top shimmer line */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg, transparent 0%, rgba(245,166,35,0.6) 40%, rgba(255,255,255,0.2) 60%, transparent 100%)" }} />

        {/* ── Content ── */}
        <div style={{ position:"relative", zIndex:1,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"44px 52px" }}>
          <div>
            {/* Pill badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:6,
              background:"rgba(245,166,35,0.15)", border:"1px solid rgba(245,166,35,0.3)",
              borderRadius:99, padding:"4px 12px", marginBottom:18 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#F5A623",
                boxShadow:"0 0 6px rgba(245,166,35,0.8)", display:"inline-block" }} />
              <span style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em",
                textTransform:"uppercase", color:"#F5A623" }}>Coming Soon</span>
            </div>

            <h2 style={{ fontSize:"clamp(2rem, 4vw, 2.75rem)", fontWeight:900,
              color:"#FFFFFF", letterSpacing:"-0.05em", lineHeight:1.05,
              margin:"0 0 14px 0" }}>
              Season 2 is Loading…
            </h2>
            <p style={{ fontSize:"1.0625rem", color:"rgba(255,255,255,0.5)",
              fontWeight:500, lineHeight:1.6, margin:0, letterSpacing:"-0.01em" }}>
              Unstoppable momentum.
            </p>

            {/* Hashtag */}
            <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.2)",
              fontWeight:800, letterSpacing:"0.12em", marginTop:20,
              textTransform:"uppercase" }}>
              #67to67Billion
            </p>
          </div>

          {/* Logo with glow ring */}
          <div className="hidden-mobile" style={{ flexShrink:0, position:"relative" }}>
            {/* Glow ring */}
            <div style={{ position:"absolute", inset:-20,
              background:"radial-gradient(circle, rgba(245,166,35,0.4) 0%, transparent 65%)",
              borderRadius:"50%" }} />
            <div style={{ width:120, height:120, borderRadius:"50%", overflow:"hidden",
              position:"relative", zIndex:1,
              boxShadow:"0 0 0 1.5px rgba(245,166,35,0.4), 0 0 40px rgba(245,166,35,0.5)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://raw.githubusercontent.com/67coin/67/main/logo.png" alt="67"
                style={{ width:120, height:120, objectFit:"cover", display:"block" }} />
            </div>
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
