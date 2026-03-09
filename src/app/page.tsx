"use client"
import React from "react"
import ReactDOM from "react-dom"


import { TokenHealthCard }     from "@/components/cards/token-health"
import { CommunityCard }       from "@/components/cards/community"
// ContentPipelineCard → Calendar page
// ContentCreatorCard removed (saved at workspace/CONTENT_CREATOR_BACKUP.tsx)
import { PostTimingCard }        from "@/components/cards/post-timing"
import { TikTokSpotlightCard }       from "@/components/cards/tiktok-spotlight"
import { SocialMediaSpotlightCard }  from "@/components/cards/social-media-spotlight"
import { YouTubeSpotlightCard }      from "@/components/cards/youtube-spotlight"
import { InstagramSpotlightCard }    from "@/components/cards/instagram-spotlight"
import { XLiveFeedCard }             from "@/components/cards/x-live-feed"
// AgentStatusCard removed
import { EmailInboxCard }       from "@/components/cards/email-inbox"
import { MilestonesCard }       from "@/components/cards/milestones"
import { FeatureRequestCard, FeatureRequestSection }   from "@/components/cards/feature-request"
import { OutreachCard }         from "@/components/cards/outreach"
import { MapWidgetCard }        from "@/components/cards/map-widget"
import { MapBackground }        from "@/components/cards/map-background"
import { RaidCoordinatorCard }  from "@/components/cards/raid-coordinator"
import { DailyBriefingCard }    from "@/components/cards/daily-briefing"
import { TeamNotesCard }          from "@/components/cards/team-notes"
// CommunityEventsCard → Calendar page
import { AnnouncementsCard }      from "@/components/cards/announcements"

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
    <div style={{ width:"100%", maxWidth:"100%", padding:"0 24px", boxSizing:"border-box" }}>
      {/* ══ Slim identity strip ═════════════════════════════════ */}
      <div className="enter-1" style={{
        display:"flex", alignItems:"center", gap:8,
        marginBottom:20, paddingBottom:14,
        borderBottom:"1px solid rgba(0,0,0,0.07)",
      }}>
        {/* $67 live price pill with logo */}
        {(livePrice ?? 0) > 0 && (
          <span style={{
            display:"inline-flex", alignItems:"center", gap:6,
            fontSize:"0.6875rem", fontWeight:700,
            color: up ? "#059669" : "#EF4444",
            background: up ? "rgba(5,150,105,0.09)" : "rgba(239,68,68,0.09)",
            border: `1.5px solid ${up ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.15)"}`,
            padding:"3px 9px 3px 5px", borderRadius:99,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://raw.githubusercontent.com/67coin/67/main/logo.png" alt="67"
              style={{ width:18, height:18, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
            ${(livePrice ?? 0).toFixed(6)}
            <span style={{ opacity:0.85 }}>
              {up ? "▲" : "▼"}{Math.abs(liveChange24h ?? 0).toFixed(1)}%
            </span>
          </span>
        )}

        {/* Market pills — logo + price, scrollable */}
        <div style={{ display:"flex", flexWrap:"nowrap", gap:4, flex:1, overflowX:"auto", scrollbarWidth:"none" }}>
          {market.map((m, i) => {
            const mUp = m.change_pct >= 0
            const sym = m.symbol.replace("-USD","").replace("=F","").toUpperCase()
            const logo = sym === "BTC"
              ? <svg width="13" height="13" viewBox="0 0 32 32" style={{flexShrink:0}}><circle cx="16" cy="16" r="16" fill="#F7931A"/><path d="M22.5 14.2c.3-2.1-1.3-3.2-3.5-4l.7-2.8-1.7-.4-.7 2.7-1.3-.3.7-2.7-1.7-.4-.7 2.8-1.1-.3-2.4-.6-.4 1.8s1.3.3 1.2.3c.7.2.8.6.8 1l-2 7.9c-.1.2-.4.5-.9.4 0 .1-1.3-.3-1.3-.3l-.9 1.9 2.2.6 1.2.3-.7 2.8 1.7.4.7-2.8 1.3.3-.7 2.8 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2-.1-3.2-1.5-3.9 1-.3 1.8-1.1 2-2.7zm-3.6 5c-.5 2-3.9.9-5 .7l.9-3.5c1.1.3 4.7.8 4.1 2.8zm.5-5c-.5 1.8-3.3.9-4.3.7l.8-3.2c1 .2 4.1.7 3.5 2.5z" fill="white"/></svg>
              : sym === "ETH"
              ? <svg width="13" height="13" viewBox="0 0 32 32" style={{flexShrink:0}}><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16.5 4v8.87l7.5 3.35L16.5 4z" fill="white" fillOpacity=".6"/><path d="M16.5 4L9 16.22l7.5-3.35V4z" fill="white"/><path d="M16.5 21.97v6.03L24 17.62 16.5 21.97z" fill="white" fillOpacity=".6"/><path d="M16.5 28v-6.03L9 17.62 16.5 28z" fill="white"/></svg>
              : sym === "SOL"
              ? <svg width="13" height="13" viewBox="0 0 32 32" style={{flexShrink:0}}><defs><linearGradient id="solG2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#9945FF"/><stop offset="100%" stopColor="#00FFA3"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="#000"/><path d="M8 21.5h13.5l-2.5 2.5H5.5L8 21.5zm0-6h13.5l-2.5 2.5H5.5L8 15.5zm2.5-6h13.5l-2.5 2.5H8L10.5 9.5z" fill="url(#solG2)"/></svg>
              : <span style={{fontSize:"0.65rem"}}>{m.emoji}</span>
            return (
              <span key={i} style={{
                display:"inline-flex", alignItems:"center", gap:3,
                fontSize:"0.5625rem", fontWeight:600,
                background: mUp ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${mUp ? "rgba(5,150,105,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: mUp ? "#34D399" : "#F87171",
                padding:"2px 6px", borderRadius:99,
                whiteSpace:"nowrap", flexShrink:0,
              }}>
                {logo}
                <span style={{ fontVariantNumeric:"tabular-nums" }}>
                  ${fmtP(m.price, m.kind)}
                </span>
                <span style={{ fontWeight:700 }}>
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
        @media (max-width: 640px)  {
          .market-pills { flex: unset; min-width: 0; gap: 3px !important; }
          .market-pill { font-size: 0.5rem !important; padding: 2px 5px !important; gap: 2px !important; }
        }
      `}</style>

      {/* ══ Main Layout: Left + Right ══════════════════════════ */}
      <div className="main-layout" style={{ display:"flex", gap:20, alignItems:"flex-start" }}>

        {/* ── Left Section (2 cols) ── */}
        <div className="left-section" style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:20 }}>

          {/* Row 1: Community | CoinHealth */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div className="mob-order-1" style={{ display:"flex", minWidth:0 }}><CommunityCard /></div>
            <div className="mob-order-2" style={{ display:"flex", minWidth:0 }}><TokenHealthCard /></div>
          </div>

          {/* Row 2: Social — full width */}
          <div className="mob-order-5" style={{ display:"flex", minWidth:0, minHeight:420 }}><SocialMediaSpotlightCard /></div>

          {/* Row 3: Team Notes */}
          <div className="mob-order-4" style={{ display:"flex", minWidth:0, marginBottom:24 }}><TeamNotesCard /></div>

        </div>

        {/* ── Right Section ── */}
        <div className="right-section" style={{ width:320, flexShrink:0, display:"flex", flexDirection:"column", gap:20 }}>
          <div className="mob-order-0"><AnnouncementsCard /></div>
          <div className="mob-order-3"><XRaidCard /></div>
          <div className="mob-order-7"><WalletTrackerCard /></div>
          <div style={{ borderRadius:18, overflow:"hidden", background:"#111", minHeight:280, maxHeight:400 }}><MapWidgetCard /></div>
        </div>
      </div>

      {/* ══ Season 2 Banner ════════════════════════════════════ */}
      <div style={{ marginTop:40, borderRadius:"20px 20px 0 0", position:"relative", overflow:"hidden", clear:"both" }}>
        {/* Map as background */}
        <div style={{ position:"absolute", inset:0, zIndex:0 }}>
          <MapBackground />
        </div>
        {/* Gradient overlays on top of map */}
        <div style={{ position:"absolute", inset:0, zIndex:1, background:"linear-gradient(115deg, rgba(10,10,10,0.75) 0%, rgba(17,17,8,0.6) 40%, rgba(42,26,0,0.45) 70%, rgba(122,69,0,0.3) 90%, rgba(200,130,10,0.2) 100%)" }} />
        <div style={{ position:"absolute", inset:0, zIndex:1, background:"radial-gradient(ellipse at 5% 50%, rgba(245,166,35,0.18) 0%, transparent 40%)" }} />
        <div style={{ position:"absolute", inset:0, zIndex:1, backgroundImage:`repeating-linear-gradient(112deg, transparent, transparent 28px, rgba(255,255,255,0.022) 28px, rgba(255,255,255,0.022) 29px)` }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, zIndex:2, background:"linear-gradient(90deg, transparent 0%, rgba(245,166,35,0.4) 50%, transparent 100%)" }} />
        <div className="season-banner-inner" style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"28px 48px 32px" }}>
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

        @media (max-width: 768px) {
          /* Flatten main layout to single column */
          .main-layout { flex-direction: column !important; }
          .left-section { width: 100% !important; display: contents !important; }
          .right-section { width: 100% !important; flex-shrink: unset !important; display: contents !important; }

          /* Flatten all inner grids to single column */
          .main-layout div[style*="grid-template-columns"] { display: flex !important; flex-direction: column !important; }

          /* All cards full width on mobile */
          .main-layout div[style*="minWidth"] { width: 100% !important; min-width: 0 !important; }

          /* Mobile ordering */
          .main-layout .mob-order-0  { order: 0; }
          .main-layout .mob-order-1  { order: 1; }
          .main-layout .mob-order-2  { order: 2; }
          .main-layout .mob-order-3  { order: 3; }
          .main-layout .mob-order-4  { order: 4; }
          .main-layout .mob-order-5  { order: 5; }
          .main-layout .mob-order-6  { order: 6; }
          .main-layout .mob-order-7  { order: 7; }
          .main-layout .mob-order-8  { order: 8; }
          .main-layout .mob-order-9  { order: 9; }
        }
      `}</style>
    </div>
  )
}
