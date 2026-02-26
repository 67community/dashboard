"use client"

import { useState } from "react"
import { CheckCircle2, Copy, PenLine, Sparkles, Trash2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

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

// ─── Config ─────────────────────────────────────────────────────────────────────

const REGIONS: { id: Region; flag: string; label: string }[] = [
  { id: "america",     flag: "🇺🇸", label: "America"    },
  { id: "china",       flag: "🇨🇳", label: "China"      },
  { id: "europe_asia", flag: "🌏",  label: "Europe/Asia" },
]

const PLATFORMS: {
  id:     Platform
  emoji:  string
  label:  string
  accent: string
  types:  { id: string; label: string }[]
}[] = [
  {
    id:     "x",
    emoji:  "𝕏",
    label:  "Twitter",
    accent: "#1D9BF0",
    types:  [{ id: "tweet", label: "Tweet" }, { id: "thread", label: "Thread" }, { id: "announcement", label: "Announce" }],
  },
  {
    id:     "tiktok",
    emoji:  "♪",
    label:  "TikTok",
    accent: "#FF2D55",
    types:  [{ id: "hook", label: "Hook" }, { id: "caption", label: "Caption" }, { id: "cta", label: "CTA" }],
  },
  {
    id:     "instagram",
    emoji:  "◈",
    label:  "Instagram",
    accent: "#E1306C",
    types:  [{ id: "post", label: "Post" }, { id: "reel", label: "Reel" }, { id: "story", label: "Story" }],
  },
]

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
      const res  = await fetch("/api/draft", {
        method:  "POST",
        headers: { "content-type": "application/json" },
        body:    JSON.stringify({ topic, type, platform, region }),
      })
      const json = await res.json() as Draft & { error?: string }
      if (json.error) throw new Error(json.error)
      setDrafts(prev => [{ ...json, platform, region, approved: false }, ...prev])
      setTopic("")
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

  // ── Collapsed ──

  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Active platform badge + region */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `${activePlat.accent}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", fontWeight: 800, color: activePlat.accent,
          flexShrink: 0,
        }}>
          {activePlat.emoji}
        </div>
        <div>
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#09090B", letterSpacing: "-0.01em" }}>
            {activePlat.label}
          </p>
          <p style={{ fontSize: "0.8rem", color: "#8E8E93", fontWeight: 500 }}>
            {activeRegion.flag} {activeRegion.label} · {queue > 0 ? `${queue} queued` : "ready"}
          </p>
        </div>
      </div>

      {/* Platform pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PLATFORMS.map(p => {
          const active = platform === p.id
          return (
            <span
              key={p.id}
              style={{
                fontSize: "0.75rem", fontWeight: active ? 700 : 500,
                padding: "4px 10px", borderRadius: 99,
                background: active ? `${p.accent}15` : "#F4F4F5",
                color:      active ? p.accent : "#9CA3AF",
                border:     active ? `1.5px solid ${p.accent}50` : "1.5px solid transparent",
              }}
            >
              {p.emoji} {p.label}
            </span>
          )
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 14 }}>
        <PenLine style={{ width: 14, height: 14, color: "#A1A1AA", flexShrink: 0 }} />
        <p style={{ fontSize: "0.8125rem", color: "#71717A", fontWeight: 500 }}>
          Click to open creator
        </p>
      </div>
    </div>
  )

  // ── Expanded ──

  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Region ─────────────────────────────────────────── */}
      <div>
        <p style={{
          fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA",
          letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8,
        }}>Target Market</p>
        <div style={{ display: "flex", gap: 6 }}>
          {REGIONS.map(r => {
            const active = region === r.id
            return (
              <button
                key={r.id}
                onClick={e => { e.stopPropagation(); setRegion(r.id) }}
                style={{
                  flex: 1, padding: "9px 6px", borderRadius: 10, cursor: "pointer",
                  border:     active ? "2px solid #F5A623" : "2px solid transparent",
                  background: active ? "rgba(245,166,35,0.10)" : "#F4F4F5",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "1.3rem" }}>{r.flag}</span>
                <span style={{
                  fontSize: "0.6875rem", fontWeight: active ? 700 : 500,
                  color: active ? "#92400E" : "#6B7280",
                }}>{r.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Platform ────────────────────────────────────────── */}
      <div>
        <p style={{
          fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA",
          letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8,
        }}>Platform</p>
        <div style={{ display: "flex", gap: 6 }}>
          {PLATFORMS.map(p => {
            const active = platform === p.id
            return (
              <button
                key={p.id}
                onClick={e => { e.stopPropagation(); switchPlatform(p.id) }}
                style={{
                  flex: 1, padding: "10px 6px", borderRadius: 11, cursor: "pointer",
                  border:     active ? `2px solid ${p.accent}` : "2px solid transparent",
                  background: active ? `${p.accent}12` : "#F4F4F5",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  fontSize: "1.1rem", fontWeight: 800,
                  color: active ? p.accent : "#A1A1AA",
                }}>{p.emoji}</span>
                <span style={{
                  fontSize: "0.6875rem", fontWeight: active ? 700 : 500,
                  color: active ? p.accent : "#9CA3AF",
                }}>{p.label}</span>
                {active && (
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: p.accent, display: "block",
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content Type ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {activePlat.types.map(t => (
          <button
            key={t.id}
            onClick={e => { e.stopPropagation(); setType(t.id) }}
            style={{
              padding: "6px 14px", borderRadius: 99, cursor: "pointer",
              border:     type === t.id ? `2px solid ${activePlat.accent}` : "2px solid transparent",
              background: type === t.id ? `${activePlat.accent}15` : "#F4F4F5",
              color:      type === t.id ? activePlat.accent : "#6B7280",
              fontSize: "0.8rem", fontWeight: type === t.id ? 700 : 500,
              transition: "all 0.12s",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Generator Box ───────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${activePlat.accent}10, ${activePlat.accent}05)`,
        border: `1px solid ${activePlat.accent}25`,
        borderRadius: 14, padding: 14,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder={`Topic or idea for ${activePlat.label}...`}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.08)",
            fontSize: "0.875rem", outline: "none", background: "#fff",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={e => { e.stopPropagation(); generate() }}
          disabled={loading || !topic.trim()}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 10, border: "none",
            cursor:     loading || !topic.trim() ? "not-allowed" : "pointer",
            background: loading || !topic.trim() ? "#E5E7EB" : activePlat.accent,
            color:      loading || !topic.trim() ? "#9CA3AF" : "#fff",
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
            <><Sparkles style={{ width: 14, height: 14 }} />Generate for {activeRegion.flag} {activePlat.label}</>
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
          {drafts.map(d => {
            const tc   = TYPE_PILL[d.type] ?? TYPE_PILL.tweet
            const plat = PLATFORMS.find(p => p.id === d.platform)!
            const reg  = REGIONS.find(r => r.id === d.region)!
            return (
              <div key={d.id} style={{
                border:     `1px solid ${d.approved ? "#A7F3D0" : "rgba(0,0,0,0.07)"}`,
                borderRadius: 12, padding: 13,
                background: d.approved ? "#F0FDF4" : "#fff",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700,
                    padding: "2px 7px", borderRadius: 99,
                    background: tc.bg, color: tc.color,
                  }}>{d.type}</span>
                  <span style={{ fontSize: "0.8rem", color: plat.accent }}>{plat.emoji}</span>
                  <span style={{ fontSize: "0.8rem" }}>{reg.flag}</span>
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
    <DashboardCard
      title="Content Creator"
      subtitle="Region · Platform · AI"
      icon={<PenLine style={{ width: 16, height: 16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
