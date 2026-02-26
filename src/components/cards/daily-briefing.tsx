"use client"

import { useState, useEffect, useCallback } from "react"
import { Newspaper, RefreshCw } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

// ── Types ─────────────────────────────────────────────────────────────────────

interface BriefSection {
  icon:  string
  title: string
  items: string[]
}

interface Brief {
  date:      string
  headline:  string
  sections:  BriefSection[]
  generatedAt: string
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  })
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function DailyBriefingCard() {
  const { data } = useAppData()
  const [brief,   setBrief]   = useState<Brief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // Load cached brief
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`67_brief_${todayKey()}`)
      if (cached) setBrief(JSON.parse(cached))
    } catch {}
  }, [])

  const generate = useCallback(async () => {
    if (loading) return
    setLoading(true); setError(null)

    // Build context from live data
    const th = data?.token_health
    const community = data?.community
    const social = data?.social_pulse

    // Get stored sightings / feature requests / raids
    let sightings: { title: string; status: string }[] = []
    let features:  { what: string; status: string }[]  = []
    let raids:     { target: string; status: string }[] = []
    try { sightings = JSON.parse(localStorage.getItem("67_sightings")    ?? "[]").slice(0, 5) } catch {}
    try { features  = JSON.parse(localStorage.getItem("67_feature_requests") ?? "[]").slice(0, 5) } catch {}
    try { raids     = JSON.parse(localStorage.getItem("67_raids")         ?? "[]").slice(0, 3) } catch {}

    const ctx = {
      date:      todayKey(),
      price:     th?.price,
      change24h: th?.price_change_24h,
      mcap:      th?.market_cap,
      holders:   th?.holders,
      discordMembers: community?.discord_members,
      telegramMembers: community?.telegram_members,
      mentions:  social?.mentions?.length ?? 0,
      newSightings:  sightings.filter(s => s.status === "new").length,
      pendingFeatures: features.filter(f => f.status !== "done").length,
      activeRaids: raids.filter(r => r.status === "active").length,
      sightingTitles: sightings.slice(0, 3).map(s => s.title),
    }

    try {
      const res  = await fetch("/api/daily-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ctx),
      })
      const json = await res.json()

      if (json.brief) {
        const b: Brief = { ...json.brief, generatedAt: new Date().toISOString() }
        setBrief(b)
        localStorage.setItem(`67_brief_${todayKey()}`, JSON.stringify(b))
      } else {
        setError("Failed to generate brief.")
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [data, loading])

  // Auto-generate on first load if no cached brief
  useEffect(() => {
    if (!brief && data && !loading) generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const isToday = brief?.date === todayKey()

  // ── Collapsed ────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: i===1 ? 48 : 32 }} />)}
        </div>
      )}

      {!loading && brief && (
        <>
          {/* Date + refresh */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:"0.6875rem", fontWeight:600, color:"#8E8E93" }}>
              {formatDate(brief.date)}
            </span>
            <button onClick={e => { e.stopPropagation(); generate() }}
              style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none",
                cursor:"pointer", color:"#A1A1AA", fontSize:"0.6875rem", fontWeight:600, padding:0 }}>
              <RefreshCw style={{ width:11, height:11 }} /> Refresh
            </button>
          </div>

          {/* Headline */}
          <div style={{ background:"rgba(245,166,35,0.07)",
            border:"1.5px solid rgba(245,166,35,0.25)", borderRadius:12, padding:"12px 14px" }}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#F5A623",
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>Today's Brief</p>
            <p style={{ fontSize:"0.9375rem", fontWeight:700, color:"#1D1D1F", lineHeight:1.45 }}>
              {brief.headline}
            </p>
          </div>

          {/* Top 2 sections collapsed */}
          {brief.sections.slice(0, 2).map((sec, i) => (
            <div key={i} style={{ borderTop: i === 0 ? "1px solid rgba(0,0,0,0.06)" : "none",
              paddingTop: i === 0 ? 12 : 0 }}>
              <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>
                {sec.icon} {sec.title}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {sec.items.slice(0, 2).map((item, j) => (
                  <div key={j} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:"#F5A623",
                      flexShrink:0, marginTop:5 }} />
                    <p style={{ fontSize:"0.8125rem", color:"#374151", lineHeight:1.45 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!isToday && (
            <p style={{ fontSize:"0.6875rem", color:"#A1A1AA", fontStyle:"italic" }}>
              This brief is from yesterday. Refresh for today's.
            </p>
          )}
        </>
      )}

      {!loading && error && (
        <div style={{ textAlign:"center", padding:"8px 0" }}>
          <p style={{ fontSize:"0.8125rem", color:"#EF4444" }}>{error}</p>
          <button onClick={e => { e.stopPropagation(); generate() }}
            style={{ marginTop:8, padding:"6px 16px", borderRadius:8, border:"none",
              background:"#F5A623", color:"#000", fontSize:"0.8125rem", fontWeight:700,
              cursor:"pointer" }}>Try Again</button>
        </div>
      )}

      {!loading && !brief && !error && (
        <button onClick={e => { e.stopPropagation(); generate() }}
          style={{ padding:"10px 0", borderRadius:10, border:"none", background:"#F5A623",
            color:"#000", fontSize:"0.875rem", fontWeight:700, cursor:"pointer", width:"100%" }}>
          Generate Today's Brief
        </button>
      )}
    </div>
  )

  // ── Expanded ─────────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {brief && (
          <p style={{ fontSize:"0.8125rem", fontWeight:600, color:"#8E8E93" }}>
            {formatDate(brief.date)}
          </p>
        )}
        <button onClick={generate} disabled={loading}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
            borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", background:"none",
            cursor: loading ? "wait" : "pointer", color: loading ? "#A1A1AA" : "#1D1D1F",
            fontSize:"0.8125rem", fontWeight:600 }}>
          <RefreshCw style={{ width:13, height:13 }} />
          {loading ? "Generating…" : "Refresh Brief"}
        </button>
      </div>

      {loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: i === 1 ? 60 : 40 }} />)}
        </div>
      )}

      {!loading && brief && (
        <>
          {/* Headline */}
          <div style={{ background:"rgba(245,166,35,0.07)",
            border:"1.5px solid rgba(245,166,35,0.25)", borderRadius:14, padding:"16px 18px" }}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#F5A623",
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Today's Headline</p>
            <p style={{ fontSize:"1.0625rem", fontWeight:700, color:"#1D1D1F", lineHeight:1.45 }}>
              {brief.headline}
            </p>
          </div>

          {/* All sections */}
          {brief.sections.map((sec, i) => (
            <div key={i} style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:16 }}>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#8E8E93",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
                {sec.icon} {sec.title}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {sec.items.map((item, j) => (
                  <div key={j} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"#F5A623",
                      flexShrink:0, marginTop:6 }} />
                    <p style={{ fontSize:"0.875rem", color:"#374151", lineHeight:1.55 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p style={{ fontSize:"0.6875rem", color:"#C7C7CC", textAlign:"right" }}>
            Generated {new Date(brief.generatedAt).toLocaleTimeString()}
          </p>
        </>
      )}

      {error && (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <p style={{ color:"#EF4444" }}>{error}</p>
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Daily Briefing"
      subtitle="Nova · Every Morning · Action Items"
      icon={<Newspaper style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
