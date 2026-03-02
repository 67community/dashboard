"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

// ── Instagram SVG Logo ────────────────────────────────────────────────────────────

function IgLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-rg" cx="30%" cy="107%" r="150%">
          <stop offset="0%"  stopColor="#fdf497" />
          <stop offset="5%"  stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" ry="6" fill="url(#ig-rg)" />
      <circle cx="12" cy="12" r="4.8" stroke="white" strokeWidth="1.9" fill="none" />
      <circle cx="18" cy="6"   r="1.4" fill="white" />
    </svg>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────────

const X_DAYS = [
  { d:"Mon", slots:["9AM","7PM"],        heat:2 },
  { d:"Tue", slots:["9AM","5PM"],        heat:2 },
  { d:"Wed", slots:["9AM","12PM","7PM"], heat:3 },
  { d:"Thu", slots:["9AM","5PM","8PM"],  heat:3 },
  { d:"Fri", slots:["9AM","12PM"],       heat:2 },
  { d:"Sat", slots:["10AM","4PM"],       heat:1 },
  { d:"Sun", slots:["11AM","6PM"],       heat:1 },
]
const TIK_DAYS = [
  { d:"Mon", slots:["7AM","7PM"],  heat:1 },
  { d:"Tue", slots:["7AM","8PM"],  heat:2 },
  { d:"Wed", slots:["7AM","10PM"], heat:2 },
  { d:"Thu", slots:["7AM","8PM"],  heat:3 },
  { d:"Fri", slots:["7AM","8PM"],  heat:3 },
  { d:"Sat", slots:["11AM","7PM"], heat:2 },
  { d:"Sun", slots:["7AM","4PM"],  heat:2 },
]
const IG_DAYS = [
  { d:"Mon", slots:["11AM","5PM"], heat:2 },
  { d:"Tue", slots:["9AM","1PM"],  heat:2 },
  { d:"Wed", slots:["11AM","3PM"], heat:3 },
  { d:"Thu", slots:["12PM","7PM"], heat:2 },
  { d:"Fri", slots:["12PM","2PM"], heat:3 },
  { d:"Sat", slots:["9AM","6PM"],  heat:1 },
  { d:"Sun", slots:["7PM"],        heat:1 },
]

type Accent = { bg: string[]; text: string[]; border: string }

const X_ACCENT: Accent = {
  bg:   ["#F8F8F8","rgba(245,166,35,0.13)","rgba(245,166,35,0.32)","rgba(245,166,35,0.62)"],
  text: ["#C7C7CC","#92400E","#7A3A00","#5A2A00"],
  border:"rgba(245,166,35,0.45)",
}
const TIK_ACCENT: Accent = {
  bg:   ["#F8F8F8","#EDE9FE","#C4B5FD","#8B5CF6"],
  text: ["#C7C7CC","#5B21B6","#4C1D95","#F5F3FF"],
  border:"rgba(139,92,246,0.45)",
}
const IG_ACCENT: Accent = {
  bg:   ["#F8F8F8","rgba(247,119,55,0.11)","rgba(247,119,55,0.3)","rgba(247,119,55,0.62)"],
  text: ["#C7C7CC","#9A3412","#7C2D12","#431407"],
  border:"rgba(247,119,55,0.45)",
}

// ── Platform config ───────────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    key:"x", label:"X / TWITTER", color:"#F5A623", accent:X_ACCENT, days:X_DAYS,
    logo: <span style={{ fontSize:"1.1rem", fontWeight:900, color:"#F5A623", lineHeight:1 }}>𝕏</span>,
    regions:[
      { flag:"🇺🇸", country:"United States", tz:"EST", accent:"#D97706", tint:"rgba(217,119,6,0.07)", border:"rgba(217,119,6,0.18)",
        rows:[{t:"9–11 AM",n:"Morning commute"},{t:"12–2 PM",n:"Lunch scroll"},{t:"7–9 PM",n:"Prime time"}] },
      { flag:"🇨🇳", country:"China",          tz:"CST", accent:"#DC2626", tint:"rgba(220,38,38,0.07)", border:"rgba(220,38,38,0.18)",
        rows:[{t:"8–10 AM",n:"Crypto morning"},{t:"12–2 PM",n:"Lunch break"},{t:"8–10 PM",n:"Evening peak"}] },
      { flag:"🇯🇵", country:"Japan",           tz:"JST", accent:"#2563EB", tint:"rgba(37,99,235,0.07)", border:"rgba(37,99,235,0.18)",
        rows:[{t:"7–9 AM",n:"Commute"},{t:"12 PM",n:"Lunch"},{t:"9–11 PM",n:"Night scroll"}] },
      { flag:"🌍", country:"Global",           tz:"EST", accent:"#059669", tint:"rgba(5,150,105,0.07)", border:"rgba(5,150,105,0.18)",
        rows:[{t:"2–5 PM",n:"EU active"},{t:"8–10 PM",n:"APAC starts"},{t:"1–3 AM",n:"Asia peak"}] },
    ],
  },
  {
    key:"tiktok", label:"TIKTOK", color:"#7C3AED", accent:TIK_ACCENT, days:TIK_DAYS,
    logo: <span style={{ fontSize:"1.1rem", fontWeight:900, color:"#7C3AED", lineHeight:1 }}>♪</span>,
    regions:[
      { flag:"🇺🇸", country:"United States", tz:"EST", accent:"#6D28D9", tint:"rgba(109,40,217,0.07)", border:"rgba(109,40,217,0.18)",
        rows:[{t:"7–9 AM",n:"Before school"},{t:"12–3 PM",n:"Lunch break"},{t:"7–9 PM",n:"Evening prime"}] },
      { flag:"🇨🇳", country:"China",          tz:"CST", accent:"#DC2626", tint:"rgba(220,38,38,0.07)", border:"rgba(220,38,38,0.18)",
        rows:[{t:"7–9 AM",n:"Morning routine"},{t:"12–2 PM",n:"Lunch scroll"},{t:"8–11 PM",n:"Prime time"}] },
      { flag:"🇯🇵", country:"Japan",           tz:"JST", accent:"#2563EB", tint:"rgba(37,99,235,0.07)", border:"rgba(37,99,235,0.18)",
        rows:[{t:"6–9 AM",n:"Morning commute"},{t:"12–1 PM",n:"Lunch"},{t:"9–11 PM",n:"Night browsing"}] },
      { flag:"🌍", country:"Global",           tz:"EST", accent:"#5B21B6", tint:"rgba(91,33,182,0.07)", border:"rgba(91,33,182,0.18)",
        rows:[{t:"2–4 PM",n:"EU peak"},{t:"9–11 PM",n:"APAC active"},{t:"Thu–Fri",n:"Best days"}] },
    ],
  },
  {
    key:"instagram", label:"INSTAGRAM", color:"#E1306C", accent:IG_ACCENT, days:IG_DAYS,
    logo: <IgLogo size={20} />,
    regions:[
      { flag:"🇺🇸", country:"United States", tz:"EST", accent:"#C2410C", tint:"rgba(194,65,12,0.07)",  border:"rgba(194,65,12,0.18)",
        rows:[{t:"11AM–1PM",n:"Late morning"},{t:"12–2 PM",n:"Lunch peak"},{t:"5–7 PM",n:"After work"}] },
      { flag:"🇨🇳", country:"China",          tz:"CST", accent:"#DC2626", tint:"rgba(220,38,38,0.07)", border:"rgba(220,38,38,0.18)",
        rows:[{t:"9–11 AM",n:"Morning"},{t:"12–2 PM",n:"Lunch"},{t:"7–9 PM",n:"Evening"}] },
      { flag:"🇯🇵", country:"Japan",           tz:"JST", accent:"#2563EB", tint:"rgba(37,99,235,0.07)", border:"rgba(37,99,235,0.18)",
        rows:[{t:"7–9 AM",n:"Morning"},{t:"12 PM",n:"Lunch"},{t:"8–10 PM",n:"Evening scroll"}] },
      { flag:"🌍", country:"Global",           tz:"EST", accent:"#059669", tint:"rgba(5,150,105,0.07)", border:"rgba(5,150,105,0.18)",
        rows:[{t:"2–4 PM",n:"EU engagement"},{t:"8–10 PM",n:"APAC scroll"},{t:"Wed/Fri",n:"Best days"}] },
    ],
  },
]

// ── HeatCell ──────────────────────────────────────────────────────────────────────

function HeatCell({ d, slots, heat, accent }: { d:string; slots:string[]; heat:number; accent:Accent }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{
        background:   accent.bg[heat],
        border:       `1.5px solid ${heat >= 2 ? accent.border : "rgba(0,0,0,0.06)"}`,
        borderRadius: 10, padding:"8px 3px", marginBottom:4,
      }}>
        <p style={{ fontSize:"0.75rem", fontWeight:800, color:accent.text[heat], marginBottom:2 }}>
          {heat===3 ? "🔥" : heat===2 ? "✓" : "–"}
        </p>
        {slots.map(s => (
          <p key={s} style={{ fontSize:"0.5625rem", fontWeight:700, color:accent.text[heat], lineHeight:1.45 }}>{s}</p>
        ))}
      </div>
      <p style={{ fontSize:"0.5625rem", color:"#B0B0BA", fontWeight:600 }}>{d}</p>
    </div>
  )
}

// ── RegionBox — flag-card style ───────────────────────────────────────────────────

function RegionBox({ flag, country, tz, accent, tint, border, rows }: {
  flag:string; country:string; tz:string; accent:string; tint:string; border:string;
  rows:{t:string; n:string}[]
}) {
  return (
    <div style={{
      background:   "#FFFFFF",
      border:       `1px solid ${border}`,
      borderRadius: 14,
      overflow:     "hidden",
      boxShadow:    "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Flag header strip */}
      <div style={{
        background:   tint,
        borderBottom: `1px solid ${border}`,
        padding:      "10px 14px",
        display:      "flex",
        alignItems:   "center",
        gap:          8,
      }}>
        <span style={{ fontSize:"1.5rem", lineHeight:1 }}>{flag}</span>
        <div>
          <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", lineHeight:1, letterSpacing:"0.01em" }}>
            {country}
          </p>
          <span style={{
            fontSize:"0.5625rem", fontWeight:700, letterSpacing:"0.07em",
            color:accent, textTransform:"uppercase", opacity:0.85,
          }}>{tz}</span>
        </div>
      </div>

      {/* Time rows */}
      <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:8 }}>
        {rows.map(r => (
          <div key={r.t} style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
            <span style={{ fontSize:"0.9375rem", fontWeight:800, color:"var(--foreground)", letterSpacing:"-0.025em", lineHeight:1 }}>
              {r.t}
            </span>
            <span style={{ fontSize:"0.6875rem", fontWeight:500, color:"#B0B0BA", marginLeft:6 }}>
              {r.n}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────────

export function PostTimingCard() {
  const [selPlat,   setSelPlat]   = useState(0)   // 0=X, 1=TikTok, 2=Instagram
  const [selRegion, setSelRegion] = useState(0)   // 0=US, 1=CN, 2=JP, 3=Global

  const plat   = PLATFORMS[selPlat]
  const region = plat.regions[selRegion]

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Platform tabs */}
      <div onClick={e => e.stopPropagation()} style={{ display:"flex", gap:4 }}>
        {PLATFORMS.map((p, i) => {
          const active = selPlat === i
          const iconColor = active ? "#fff" : "#0A0A0A"
          return (
            <button key={p.key} onClick={e => { e.stopPropagation(); setSelPlat(i) }}
              style={{
                flex:1, padding:"7px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: active ? p.color : "#F4F4F5",
                transition:"all 0.12s",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              }}>
              {p.key === "x"
                ? <span style={{ fontSize:"1.1rem", fontWeight:900, color: iconColor, lineHeight:1 }}>𝕏</span>
                : p.key === "tiktok"
                  ? <span style={{ fontSize:"1.1rem", fontWeight:900, color: iconColor, lineHeight:1 }}>♪</span>
                  : <span style={{ display:"flex", opacity: active ? 1 : 0.75 }}><IgLogo size={18} /></span>
              }
              <span style={{ fontSize:"0.5625rem", fontWeight:700,
                color: active ? "#fff" : "#0A0A0A", letterSpacing:"0.03em" }}>
                {p.key === "x" ? "X" : p.key === "tiktok" ? "TikTok" : "IG"}
              </span>
            </button>
          )
        })}
      </div>

      {/* Region flags with country names */}
      <div onClick={e => e.stopPropagation()} style={{ display:"flex", gap:5 }}>
        {plat.regions.map((r, i) => (
          <button key={r.country} onClick={e => { e.stopPropagation(); setSelRegion(i) }}
            style={{
              flex:1, padding:"6px 4px", borderRadius:9, border:"none", cursor:"pointer",
              background: selRegion===i ? `${r.accent}18` : "#F4F4F5",
              outline: selRegion===i ? `1.5px solid ${r.accent}` : "1.5px solid transparent",
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              transition:"all 0.12s",
            }}>
            <span style={{ fontSize:"1rem", lineHeight:1 }}>{r.flag}</span>
            <span style={{ fontSize:"0.5rem", fontWeight:700,
              color: selRegion===i ? r.accent : "#A1A1AA",
              letterSpacing:"0.02em", textAlign:"center", lineHeight:1.2 }}>
              {r.country === "United States" ? "US" : r.country === "Global" ? "World" : r.country}
            </span>
          </button>
        ))}
      </div>

      {/* Selected region's top windows */}
      <div style={{ borderTop:"1px solid var(--separator)", paddingTop:12 }}>
        <p style={{ fontSize:"0.625rem", fontWeight:700, letterSpacing:"0.08em",
          textTransform:"uppercase", marginBottom:10, color: region.accent }}>
          {plat.key === "x" ? "𝕏" : plat.key === "tiktok" ? "TikTok" : "Instagram"} · {region.flag} {region.country} · {region.tz}
        </p>
        {region.rows.map(r => (
          <div key={r.t} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:7 }}>
            <span style={{ fontSize:"1rem", fontWeight:800, color:"var(--foreground)", letterSpacing:"-0.025em" }}>{r.t}</span>
            <span style={{ fontSize:"0.75rem", color:"var(--secondary)", fontWeight:500 }}>{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
      {PLATFORMS.map((p, pi) => (
        <div key={p.key}>
          {/* Platform header */}
          <div style={{
            display:"flex", alignItems:"center", gap:10, marginBottom:14,
            paddingBottom:10, borderBottom:`2px solid ${p.color}20`,
          }}>
            <div style={{
              width:34, height:34, borderRadius:10,
              background:`${p.color}12`,
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0,
            }}>
              {p.logo}
            </div>
            <p style={{ fontSize:"0.8125rem", fontWeight:800, color:p.color, letterSpacing:"0.08em" }}>
              {p.label}
            </p>
          </div>

          {/* Heatmap */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:5, marginBottom:14 }}>
            {p.days.map(d => <HeatCell key={d.d} accent={p.accent} {...d} />)}
          </div>

          {/* 4 country cards 2×2 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {p.regions.map(r => <RegionBox key={r.country} {...r} />)}
          </div>

          {pi < PLATFORMS.length - 1 && (
            <div style={{ height:1, background:"rgba(0,0,0,0.06)", marginTop:28 }} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <DashboardCard
      title="Peak Post Times"
      subtitle="X · TikTok · Instagram"
      icon={<Clock style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}

// ── Embedded section for use in other cards ───────────────────────────────────
export function PeakPostSection() {
  const [selPlat,   setSelPlat]   = useState(0)
  const [selRegion, setSelRegion] = useState(0)
  const plat   = PLATFORMS[selPlat]
  const region = plat.regions[selRegion]
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <p style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>
        <Clock style={{ width:10, height:10, display:"inline", marginRight:4, verticalAlign:"middle" }} />
        Peak Post Times
      </p>
      {/* Platform tabs */}
      <div style={{ display:"flex", gap:4 }}>
        {PLATFORMS.map((p, i) => {
          const active = selPlat === i
          return (
            <button key={p.key} onClick={e => { e.stopPropagation(); setSelPlat(i); setSelRegion(0) }}
              style={{ flex:1, padding:"6px 4px", borderRadius:9, border:"none", cursor:"pointer",
                background: active ? p.color : "#F4F4F5",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              {p.key === "x" ? <span style={{ fontSize:"0.9rem", fontWeight:900, color: active?"#fff":"#0A0A0A", lineHeight:1 }}>𝕏</span>
                : p.key === "tiktok" ? <span style={{ fontSize:"0.9rem", color: active?"#fff":"#0A0A0A", lineHeight:1 }}>♪</span>
                : <span style={{ display:"flex", opacity: active ? 1 : 0.75 }}><IgLogo size={15} /></span>}
              <span style={{ fontSize:"0.5rem", fontWeight:700, color: active?"#fff":"#0A0A0A" }}>
                {p.key === "x" ? "X" : p.key === "tiktok" ? "TikTok" : "IG"}
              </span>
            </button>
          )
        })}
      </div>
      {/* Region flags */}
      <div style={{ display:"flex", gap:4 }}>
        {plat.regions.map((r, i) => (
          <button key={r.country} onClick={e => { e.stopPropagation(); setSelRegion(i) }}
            style={{ flex:1, padding:"5px 2px", borderRadius:8, border:"none", cursor:"pointer",
              background: selRegion===i ? `${r.accent}18` : "#F4F4F5",
              outline: selRegion===i ? `1.5px solid ${r.accent}` : "1.5px solid transparent",
              display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
            <span style={{ fontSize:"0.875rem" }}>{r.flag}</span>
            <span style={{ fontSize:"0.45rem", fontWeight:700, color: selRegion===i ? r.accent : "#A1A1AA" }}>
              {r.country === "United States" ? "US" : r.country === "Global" ? "World" : r.country}
            </span>
          </button>
        ))}
      </div>
      {/* Times */}
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {region.rows.map(r => (
          <div key={r.t} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"0.9375rem", fontWeight:800, color:"var(--foreground)", letterSpacing:"-0.025em" }}>{r.t}</span>
            <span style={{ fontSize:"0.6875rem", color:"var(--secondary)" }}>{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
