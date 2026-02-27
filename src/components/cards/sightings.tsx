"use client"

import { useState, useEffect } from "react"
import { Eye, Plus, ExternalLink, ChevronDown, ChevronUp, Share2, Check } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { aiHeaders } from "@/lib/ai-settings"

// ── Types ─────────────────────────────────────────────────────────────────────

type SightingPlatform = "tiktok" | "instagram" | "youtube" | "x" | "reddit" | "news" | "irl" | "other"
type SightingStatus   = "new" | "reviewing" | "shared" | "archived"

interface Sighting {
  id:         string
  title:      string
  url?:       string
  platform:   SightingPlatform
  note?:      string
  status:     SightingStatus
  submittedAt: string
  sharedAt?:  string
}

const PLAT_CONFIG: Record<SightingPlatform, { emoji: string; label: string; color: string }> = {
  tiktok:    { emoji: "🎵", label: "TikTok",    color: "#7C3AED" },
  instagram: { emoji: "📸", label: "Instagram",  color: "#E1306C" },
  youtube:   { emoji: "▶️", label: "YouTube",    color: "#FF0000" },
  x:         { emoji: "𝕏", label: "X / Twitter", color: "#0A0A0A" },
  reddit:    { emoji: "🤖", label: "Reddit",     color: "#FF4500" },
  news:      { emoji: "📰", label: "News",       color: "#2563EB" },
  irl:       { emoji: "📍", label: "IRL",        color: "#059669" },
  other:     { emoji: "⭐", label: "Other",      color: "#F5A623" },
}

const STATUS_CONFIG: Record<SightingStatus, { label: string; color: string; bg: string }> = {
  new:       { label: "New",       color: "#F5A623", bg: "rgba(245,166,35,0.1)" },
  reviewing: { label: "Reviewing", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  shared:    { label: "Shared ✓",  color: "#059669", bg: "rgba(5,150,105,0.08)" },
  archived:  { label: "Archived",  color: "#A1A1AA", bg: "#F4F4F5" },
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

// ── SightingRow ───────────────────────────────────────────────────────────────

function SightingRow({ s, expanded, onToggle, onStatus, onDelete }: {
  s: Sighting; expanded: boolean; onToggle: () => void
  onStatus: (id: string, st: SightingStatus) => void
  onDelete: (id: string) => void
}) {
  const plat = PLAT_CONFIG[s.platform]
  const stat = STATUS_CONFIG[s.status]
  const [genning, setGenning] = useState(false)
  const [drafted, setDrafted] = useState(false)

  async function generatePost(e: React.MouseEvent) {
    e.stopPropagation()
    setGenning(true)
    try {
      const res  = await fetch("/api/sighting-to-post", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...aiHeaders() },
        body: JSON.stringify({ title: s.title, platform: s.platform, url: s.url, note: s.note }),
      })
      const data = await res.json()
      if (data.post) {
        // Save to Announcements localStorage
        const existing = JSON.parse(localStorage.getItem("67_announcements") ?? "[]")
        const newAnn = {
          id: Date.now().toString(), title: `67 Sighting: ${s.title.slice(0,40)}`,
          body: data.post, channel: "x", type: "general",
          status: "draft", createdAt: new Date().toISOString(),
        }
        localStorage.setItem("67_announcements", JSON.stringify([newAnn, ...existing]))
        // Copy to clipboard
        await navigator.clipboard.writeText(data.post).catch(() => {})
        setDrafted(true)
        setTimeout(() => setDrafted(false), 3000)
      }
    } catch {}
    setGenning(false)
  }

  return (
    <div className="inset-cell" style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <button onClick={e => { e.stopPropagation(); onToggle() }}
        style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none",
          cursor:"pointer", width:"100%", textAlign:"left", padding:0 }}>
        <span style={{ fontSize:"1rem", flexShrink:0 }}>{plat.emoji}</span>
        <span style={{ flex:1, fontSize:"0.875rem", fontWeight:600, color:"#1D1D1F",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</span>
        <span style={{ fontSize:"0.625rem", fontWeight:700, color: stat.color,
          background: stat.bg, padding:"2px 8px", borderRadius:99, flexShrink:0 }}>
          {stat.label}
        </span>
        {expanded
          ? <ChevronUp  style={{ width:14, height:14, color:"#A1A1AA", flexShrink:0, marginLeft:4 }} />
          : <ChevronDown style={{ width:14, height:14, color:"#A1A1AA", flexShrink:0, marginLeft:4 }} />}
      </button>

      {expanded && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(0,0,0,0.06)",
          display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:"0.75rem", fontWeight:600, color: plat.color }}>{plat.label}</span>
            {s.url && (
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontSize:"0.75rem", color:"#2563EB", display:"flex", alignItems:"center", gap:3 }}>
                Open link <ExternalLink style={{ width:10, height:10 }} />
              </a>
            )}
            <span style={{ fontSize:"0.6875rem", color:"#C7C7CC" }}>{timeAgo(s.submittedAt)}</span>
          </div>
          {s.note && <p style={{ fontSize:"0.8125rem", color:"#374151" }}>{s.note}</p>}

          {/* Status buttons */}
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {(Object.keys(STATUS_CONFIG) as SightingStatus[]).map(st => (
              <button key={st} onClick={e => { e.stopPropagation(); onStatus(s.id, st) }}
                style={{ padding:"3px 10px", borderRadius:99, border:"none", cursor:"pointer",
                  fontSize:"0.625rem", fontWeight:700,
                  background: s.status === st ? STATUS_CONFIG[st].bg : "#F4F4F5",
                  color: s.status === st ? STATUS_CONFIG[st].color : "#8E8E93",
                  outline: s.status === st ? `1.5px solid ${STATUS_CONFIG[st].color}` : "none",
                  transition:"all 0.12s" }}>
                {STATUS_CONFIG[st].label}
              </button>
            ))}
          </div>
          {/* Escalation — generate X post */}
          <button onClick={generatePost} disabled={genning}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px",
              borderRadius:8, border:"none", cursor: genning ? "wait" : "pointer",
              background: drafted ? "rgba(5,150,105,0.1)" : "rgba(0,0,0,0.05)",
              color: drafted ? "#059669" : "#0A0A0A",
              fontSize:"0.75rem", fontWeight:700, transition:"all 0.15s" }}>
            {drafted
              ? <><Check style={{ width:12,height:12 }} /> Drafted to Announcements + Copied!</>
              : genning
                ? "Generating…"
                : <><Share2 style={{ width:12,height:12 }} /> Generate X Post</>}
          </button>

          <button onClick={e => { e.stopPropagation(); onDelete(s.id) }}
            style={{ alignSelf:"flex-start", fontSize:"0.6875rem", color:"#EF4444",
              background:"none", border:"none", cursor:"pointer", padding:0 }}>Remove</button>
        </div>
      )}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function SightingsCard() {
  const [sightings,  setSightings]  = useState<Sighting[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addOpen,    setAddOpen]    = useState(false)
  const [title,      setTitle]      = useState("")
  const [url,        setUrl]        = useState("")
  const [platform,   setPlatform]   = useState<SightingPlatform>("tiktok")
  const [note,       setNote]       = useState("")
  const [filter,     setFilter]     = useState<SightingStatus | "all">("all")

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_sightings")
      if (s) setSightings(JSON.parse(s))
    } catch {}
  }, [])

  function save(ss: Sighting[]) {
    setSightings(ss)
    localStorage.setItem("67_sightings", JSON.stringify(ss))
  }

  function addSighting() {
    if (!title.trim()) return
    const s: Sighting = {
      id: Date.now().toString(), title: title.trim(),
      url: url.trim() || undefined, platform, note: note.trim() || undefined,
      status: "new", submittedAt: new Date().toISOString(),
    }
    save([s, ...sightings])
    setTitle(""); setUrl(""); setNote(""); setAddOpen(false)
  }

  function updateStatus(id: string, status: SightingStatus) {
    save(sightings.map(s => s.id === id ? { ...s, status } : s))
  }

  function deleteSighting(id: string) {
    save(sightings.filter(s => s.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const newCount    = sightings.filter(s => s.status === "new").length
  const sharedCount = sightings.filter(s => s.status === "shared").length
  const filtered    = filter === "all" ? sightings : sightings.filter(s => s.status === filter)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Stats */}
      <div style={{ display:"flex", gap:8 }}>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#F5A623", lineHeight:1 }}>{newCount}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>New</p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#059669", lineHeight:1 }}>{sharedCount}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Shared</p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#1D1D1F", lineHeight:1 }}>{sightings.length}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Total</p>
        </div>
      </div>

      {/* Quick add */}
      <div onClick={e => e.stopPropagation()}>
        {!addOpen ? (
          <button onClick={() => setAddOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
              borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
              cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
            <Plus style={{ width:14, height:14 }} /> Log a sighting
          </button>
        ) : (
          <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
            display:"flex", flexDirection:"column", gap:8 }}>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="What did you see? (e.g. 67 on Billboard NYC)"
              style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <div style={{ display:"flex", gap:6 }}>
              <select value={platform} onChange={e => setPlatform(e.target.value as SightingPlatform)}
                style={{ flex:1, padding:"8px 10px", borderRadius:8,
                  border:"1.5px solid rgba(0,0,0,0.1)", outline:"none",
                  fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
                {(Object.entries(PLAT_CONFIG)).map(([k,v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)"
                style={{ flex:1, padding:"8px 10px", borderRadius:8,
                  border:"1.5px solid rgba(0,0,0,0.1)", outline:"none",
                  fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
                onFocus={e => e.target.style.borderColor="#F5A623"}
                onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={addSighting} disabled={!title.trim()}
                style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                  cursor: !title.trim() ? "not-allowed" : "pointer",
                  background: !title.trim() ? "#E5E5EA" : "#F5A623",
                  color: !title.trim() ? "#A1A1AA" : "#000",
                  fontSize:"0.8125rem", fontWeight:700 }}>
                Log Sighting 👁️
              </button>
              <button onClick={() => setAddOpen(false)}
                style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                  background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent */}
      {sightings.length > 0 && (
        <div style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:12 }}
          onClick={e => e.stopPropagation()}>
          {sightings.slice(0,3).map(s => (
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span>{PLAT_CONFIG[s.platform].emoji}</span>
              <span style={{ flex:1, fontSize:"0.8125rem", color:"#374151", fontWeight:500,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</span>
              <span style={{ fontSize:"0.625rem", fontWeight:700, color: STATUS_CONFIG[s.status].color,
                background: STATUS_CONFIG[s.status].bg, padding:"2px 8px", borderRadius:99 }}>
                {STATUS_CONFIG[s.status].label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Filter */}
      <div style={{ display:"flex", gap:4 }}>
        {(["all", "new", "reviewing", "shared", "archived"] as const).map(f => {
          const cnt = f === "all" ? sightings.length : sightings.filter(s => s.status === f).length
          const cfg = f === "all" ? null : STATUS_CONFIG[f]
          const active = filter === f
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ flex:1, padding:"7px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: active ? (cfg?.bg ?? "#F5A62322") : "#F4F4F5",
                outline: active ? `1.5px solid ${cfg?.color ?? "#F5A623"}` : "none",
                transition:"all 0.12s", display:"flex", flexDirection:"column",
                alignItems:"center", gap:2 }}>
              <span style={{ fontSize:"0.875rem", fontWeight:800,
                color: active ? (cfg?.color ?? "#F5A623") : "#1D1D1F" }}>{cnt}</span>
              <span style={{ fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.05em", color: active ? (cfg?.color ?? "#F5A623") : "#A1A1AA" }}>
                {f === "all" ? "All" : f}
              </span>
            </button>
          )
        })}
      </div>

      {/* Add form */}
      {!addOpen ? (
        <button onClick={() => setAddOpen(true)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
            borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
            cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
          <Plus style={{ width:14, height:14 }} /> Log a sighting
        </button>
      ) : (
        <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { v: title, set: setTitle, ph: "What did you see?" },
            { v: url,   set: setUrl,   ph: "URL (optional)" },
            { v: note,  set: setNote,  ph: "Notes (optional)" },
          ].map(({ v, set, ph }) => (
            <input key={ph} value={v} onChange={e => set(e.target.value)} placeholder={ph}
              style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          ))}
          <select value={platform} onChange={e => setPlatform(e.target.value as SightingPlatform)}
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
            {Object.entries(PLAT_CONFIG).map(([k,v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={addSighting} disabled={!title.trim()}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                cursor: !title.trim() ? "not-allowed" : "pointer",
                background: !title.trim() ? "#E5E5EA" : "#F5A623",
                color: !title.trim() ? "#A1A1AA" : "#000",
                fontSize:"0.8125rem", fontWeight:700 }}>Log Sighting 👁️</button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0
          ? <p style={{ textAlign:"center", color:"#A1A1AA", fontSize:"0.875rem", padding:"20px 0" }}>
              {filter === "all" ? "No sightings yet. Log the first one." : `No ${filter} sightings.`}
            </p>
          : filtered.map(s => (
              <SightingRow key={s.id} s={s}
                expanded={expandedId === s.id}
                onToggle={() => setExpandedId(v => v === s.id ? null : s.id)}
                onStatus={updateStatus} onDelete={deleteSighting} />
            ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="67 Sightings"
      subtitle="Log · Review · Share"
      icon={<Eye style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
