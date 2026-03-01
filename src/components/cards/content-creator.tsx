"use client"

import { useState } from "react"
import { CheckCircle2, Copy, PenLine, RefreshCw, Sparkles, Trash2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { aiHeaders } from "@/lib/ai-settings"

// ─── Types ─────────────────────────────────────────────────────────────────────

type Region   = "america" | "china" | "europe_asia"
type Platform = "x" | "tiktok" | "instagram"

interface Draft {
  id:       number
  topic:    string
  type:     string
  platform: Platform
  region:   Region
  draft:    string
  approved: boolean
}

// ─── Platform SVG Logos ─────────────────────────────────────────────────────────

function XLogo({ size = 18, color = "#0A0A0A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function TikTokLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z" fill="#010101"/>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z" fill="url(#tiktok-grad-cc)"/>
      <defs>
        <linearGradient id="tiktok-grad-cc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#69C9D0"/>
          <stop offset="100%" stopColor="#EE1D52"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function InstagramLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-cc-rg" cx="30%" cy="107%" r="150%">
          <stop offset="0%"   stopColor="#fdf497"/>
          <stop offset="5%"   stopColor="#fdf497"/>
          <stop offset="45%"  stopColor="#fd5949"/>
          <stop offset="60%"  stopColor="#d6249f"/>
          <stop offset="90%"  stopColor="#285AEB"/>
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-cc-rg)"/>
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
    </svg>
  )
}

// ─── Config ─────────────────────────────────────────────────────────────────────

const REGIONS: { id: Region; flag: string; label: string }[] = [
  { id: "america",     flag: "🇺🇸", label: "America"    },
  { id: "china",       flag: "🇨🇳", label: "China"      },
  { id: "europe_asia", flag: "🌏",  label: "Europe/Asia" },
]

const PLATFORMS: {
  id:     Platform
  label:  string
  accent: string
  types:  { id: string; label: string }[]
}[] = [
  {
    id:     "x",
    label:  "X (Twitter)",
    accent: "#0A0A0A",
    types:  [{ id: "tweet", label: "Tweet" }, { id: "thread", label: "Thread" }, { id: "announcement", label: "Announce" }],
  },
  {
    id:     "tiktok",
    label:  "TikTok",
    accent: "#EE1D52",
    types:  [{ id: "hook", label: "Hook" }, { id: "caption", label: "Caption" }, { id: "cta", label: "CTA" }],
  },
  {
    id:     "instagram",
    label:  "Instagram",
    accent: "#E1306C",
    types:  [{ id: "post", label: "Post" }, { id: "reel", label: "Reel" }, { id: "story", label: "Story" }],
  },
]

function PlatformIcon({ id, size = 18, active }: { id: Platform; size?: number; active?: boolean }) {
  if (id === "x")         return <XLogo size={size} color={active ? "#0A0A0A" : "#A1A1AA"} />
  if (id === "tiktok")    return <TikTokLogo size={size} />
  if (id === "instagram") return <InstagramLogo size={size} />
  return null
}

const TYPE_PILL: Record<string, { bg: string; color: string }> = {
  tweet:        { bg: "#EFF6FF", color: "#1D9BF0" },
  thread:       { bg: "#F5F3FF", color: "#7C3AED" },
  announcement: { bg: "#FFF7ED", color: "#EA580C" },
  hook:         { bg: "#FFF0F3", color: "#FF2D55" },
  caption:      { bg: "#FFF0F3", color: "#E11D48" },
  cta:          { bg: "#FFE4EC", color: "#BE185D" },
  post:         { bg: "#FFF0F6", color: "#E1306C" },
  reel:         { bg: "#FDF4FF", color: "#A21CAF" },
  story:        { bg: "#FFF0F6", color: "#BE185D" },
}

// ─── Main Card ──────────────────────────────────────────────────────────────────

export function ContentCreatorCard() {
  const [region,   setRegion]   = useState<Region>("america")
  const [platform, setPlatform] = useState<Platform>("x")
  const [topic,    setTopic]    = useState("")
  const [type,     setType]     = useState("tweet")
  const [loading,  setLoading]  = useState(false)
  const [drafts,   setDrafts]   = useState<Draft[]>([])
  const [copied,   setCopied]   = useState<number | null>(null)

  const activePlat  = PLATFORMS.find(p => p.id === platform)!
  const activeRegion = REGIONS.find(r => r.id === region)!

  // When switching platform, reset type to that platform's first type
  function switchPlatform(p: Platform) {
    const plat = PLATFORMS.find(x => x.id === p)!
    setPlatform(p)
    setType(plat.types[0].id)
  }

  async function generate() {
    if (!topic.trim() || loading) return
    setLoading(true)
    try {
      const results = await Promise.all([1,2,3].map((variation) =>
        fetch("/api/draft", {
          method:  "POST",
          headers: { "content-type": "application/json", ...aiHeaders() },
          body:    JSON.stringify({ topic, type, platform, region, variation }),
        }).then(r => r.json() as Promise<Draft & { error?: string }>)
      ))
      const valid = results.filter(j => !j.error)
      if (valid.length > 0) {
        setDrafts(prev => [...valid.map(j => ({ ...j, platform, region, approved: false })), ...prev])
        setTopic("")
      }
    } catch (e) { console.error(e) }
    finally     { setLoading(false) }
  }

  // Regenerate: replace current top 3 with new 3 (no blank flash)
  async function generateNew() {
    if (!topic.trim() || loading) return
    setLoading(true)
    try {
      const results = await Promise.all([1,2,3].map((variation) =>
        fetch("/api/draft", {
          method:  "POST",
          headers: { "content-type": "application/json", ...aiHeaders() },
          body:    JSON.stringify({ topic, type, platform, region, variation }),
        }).then(r => r.json() as Promise<Draft & { error?: string }>)
      ))
      const valid = results.filter(j => !j.error)
      if (valid.length > 0) {
        // Replace only the first 3 (current batch), keep approved ones
        const newDrafts = valid.map(j => ({ ...j, platform, region, approved: false }))
        setDrafts(prev => [...newDrafts, ...prev.filter(d => d.approved)])
      }
    } catch (e) { console.error(e) }
    finally     { setLoading(false) }
  }

  async function copyText(id: number, text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  function approve(id: number) { setDrafts(prev => prev.map(d => d.id === id ? { ...d, approved: true } : d)) }
  function remove(id: number)  { setDrafts(prev => prev.filter(d => d.id !== id)) }

  const queue = drafts.filter(d => !d.approved).length

  const lastDraft = drafts[0] ?? null

  // ── Collapsed — fully interactive inline form ──

  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Topic input */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate() } }}
          placeholder="Topic or idea for $67…"
          rows={2}
          style={{
            width: "100%", resize: "none", boxSizing: "border-box",
            padding: "10px 12px", borderRadius: 10, fontSize: "0.8125rem",
            fontFamily: "inherit", fontWeight: 500, color: "#1D1D1F",
            background: "#F4F4F5", border: "1.5px solid transparent",
            outline: "none", lineHeight: 1.5,
            transition: "border 0.15s",
          }}
          onFocus={e => { e.currentTarget.style.border = "1.5px solid #F5A623"; e.currentTarget.style.background = "#fff" }}
          onBlur={e => { e.currentTarget.style.border = "1.5px solid transparent"; e.currentTarget.style.background = "#F4F4F5" }}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={async e => { e.stopPropagation(); await generateNew() }}
        disabled={loading || !topic.trim()}
        style={{
          width: "100%", padding: "10px 16px", borderRadius: 10,
          background: loading || !topic.trim() ? "#E4E4E7" : "#F5A623",
          color:      loading || !topic.trim() ? "#A1A1AA" : "#000",
          border: "none", cursor: loading || !topic.trim() ? "default" : "pointer",
          fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "-0.01em",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all 0.15s",
        }}
      >
        {loading ? (
          <><span style={{ width: 14, height: 14, border: "2px solid #A1A1AA", borderTopColor: "#6E6E73", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Generating…</>
        ) : (
          <><Sparkles style={{ width: 13, height: 13 }} />Generate</>
        )}
      </button>

      {/* Last draft preview */}
      {lastDraft && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: "#F8F8FA", borderRadius: 10, padding: "10px 12px", borderLeft: "3px solid #F5A623" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#8E8E93", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Last draft · {lastDraft.type}
          </p>
          <p style={{
            fontSize: "0.8125rem", color: "#374151", lineHeight: 1.5, margin: 0,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {lastDraft.draft}
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button
              onClick={async e => { e.stopPropagation(); await navigator.clipboard.writeText(lastDraft.draft); setCopied(lastDraft.id); setTimeout(() => setCopied(null), 1500) }}
              style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6E6E73", background: "#EDEDF0", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
            >
              {copied === lastDraft.id ? "Copied ✓" : "Copy"}
            </button>
            <button
              onClick={e => { e.stopPropagation(); approve(lastDraft.id) }}
              style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#059669", background: "#ECFDF5", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
            >
              Approve ✓
            </button>
          </div>
        </div>
      )}

      {/* Queue count hint */}
      {queue > 0 && (
        <p style={{ fontSize: "0.75rem", color: "#8E8E93", fontWeight: 500, textAlign: "center" }}>
          {queue} draft{queue > 1 ? "s" : ""} in queue · tap to view all
        </p>
      )}
    </div>
  )

  // ── Expanded ──

  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Generator Box ───────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,166,35,0.08), rgba(245,166,35,0.03))",
        border: "1px solid rgba(245,166,35,0.2)",
        borderRadius: 14, padding: 14,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder="Topic or idea for $67…"
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.08)",
            fontSize: "0.875rem", outline: "none", background: "#fff",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={async e => { e.stopPropagation(); await generateNew() }}
          disabled={loading || !topic.trim()}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 10, border: "none",
            cursor:     loading || !topic.trim() ? "not-allowed" : "pointer",
            background: loading || !topic.trim() ? "#E5E7EB" : "#F5A623",
            color:      loading || !topic.trim() ? "#9CA3AF" : "#000",
            fontSize: "0.875rem", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 13, height: 13,
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block",
              }} />Generating...
            </>
          ) : (
            <><Sparkles style={{ width: 14, height: 14 }} />Generate Draft</>  
          )}
        </button>
      </div>

      {/* ── Draft List ──────────────────────────────────────── */}
      {drafts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#C7C7CC" }}>
          <Sparkles style={{ width: 22, height: 22, margin: "0 auto 8px" }} />
          <p style={{ fontSize: "0.875rem" }}>No drafts yet — generate your first one</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {drafts.slice(0,3).length >= 3 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:2 }}>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#8E8E93",
                textTransform:"uppercase", letterSpacing:"0.08em" }}>
                ✨ 3 Options — pick one or regenerate
              </p>
              <button
                onClick={async e => { e.stopPropagation(); await generateNew() }}
                disabled={loading}
                style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px",
                  borderRadius:99, border:"1.5px solid rgba(0,0,0,0.1)", background:"none",
                  cursor: loading ? "default" : "pointer",
                  fontSize:"0.6875rem", fontWeight:700, color:"#6E6E73" }}>
                <RefreshCw style={{ width:11, height:11 }} />
                Regenerate
              </button>
            </div>
          )}
          {drafts.map((d, idx) => {
            const tc   = TYPE_PILL[d.type] ?? TYPE_PILL.tweet
            const plat = PLATFORMS.find(p => p.id === d.platform)!
            return (
              <div key={d.id} style={{
                border:     `1px solid ${d.approved ? "#A7F3D0" : "rgba(0,0,0,0.07)"}`,
                borderRadius: 12, padding: 13,
                background: d.approved ? "#F0FDF4" : "#fff",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  {idx < 3 && (
                    <span style={{ fontSize:"0.6rem", fontWeight:800, color:"#8E8E93",
                      background:"#F4F4F5", padding:"2px 7px", borderRadius:99,
                      letterSpacing:"0.04em" }}>
                      #{idx + 1}
                    </span>
                  )}
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700,
                    padding: "2px 7px", borderRadius: 99,
                    background: tc.bg, color: tc.color,
                  }}>{d.type}</span>
                  <PlatformIcon id={plat.id} size={14} active />
                  <span style={{
                    fontSize: "0.75rem", color: "#A1A1AA", flex: 1,
                    overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                  }}>{d.topic}</span>
                  {d.approved && (
                    <span style={{
                      fontSize: "0.6875rem", fontWeight: 700,
                      color: "#059669", background: "#D1FAE5",
                      padding: "2px 7px", borderRadius: 99,
                    }}>✓</span>
                  )}
                </div>
                <p style={{
                  fontSize: "0.875rem", color: "#1D1D1F",
                  lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 10,
                }}>{d.draft}</p>
                <div style={{ display: "flex", gap: 7 }}>
                  {!d.approved && (
                    <button onClick={e => { e.stopPropagation(); approve(d.id) }} style={{
                      flex: 1, padding: "7px 10px", borderRadius: 8, border: "none",
                      cursor: "pointer", background: "#D1FAE5", color: "#059669",
                      fontSize: "0.8125rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    }}>
                      <CheckCircle2 style={{ width: 13, height: 13 }} />Approve
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); copyText(d.id, d.draft) }} style={{
                    flex: 1, padding: "7px 10px", borderRadius: 8, border: "none",
                    cursor: "pointer",
                    background: copied === d.id ? "#D1FAE5" : "#F4F4F5",
                    color:      copied === d.id ? "#059669" : "#6B7280",
                    fontSize: "0.8125rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}>
                    <Copy style={{ width: 13, height: 13 }} />
                    {copied === d.id ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={e => { e.stopPropagation(); remove(d.id) }} style={{
                    padding: "7px 10px", borderRadius: 8, border: "none",
                    cursor: "pointer", background: "#FEE2E2", color: "#EF4444",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard compact
      title="Content Creator"
      onClose={() => setDrafts([])}
      subtitle="AI Draft Generator"
      icon={<PenLine style={{ width: 16, height: 16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
