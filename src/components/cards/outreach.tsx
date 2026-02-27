"use client"

import { useState, useEffect } from "react"
import { Share2, Plus, ChevronDown, ChevronUp, Mail, ExternalLink, Copy, Check, UserCheck, Search, Loader2, X } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = "found" | "contacted" | "responded" | "connected" | "passed"

interface OutreachTarget {
  id:           string
  name:         string
  type:         "creator" | "merch" | "music" | "media" | "podcast" | "other"
  platform:     string
  link?:        string
  contact?:     string   // email address or DM link
  note?:        string
  handoffNote?: string   // for Nick/Jin after response
  stage:        Stage
  createdAt:    string
  updatedAt:    string
  emailDraft?:  string
}

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string }> = {
  found:     { label: "Found",     color: "#8E8E93", bg: "#F4F4F5" },
  contacted: { label: "Contacted", color: "#D97706", bg: "rgba(217,119,6,0.09)" },
  responded: { label: "Responded", color: "#2563EB", bg: "rgba(37,99,235,0.09)" },
  connected: { label: "Connected", color: "#059669", bg: "rgba(5,150,105,0.09)" },
  passed:    { label: "Passed",    color: "#A1A1AA", bg: "#F4F4F5" },
}

const TYPE_CONFIG: Record<string, { emoji: string; label: string }> = {
  creator: { emoji: "🎥", label: "Creator (TikTok/YT/IG)" },
  merch:   { emoji: "👕", label: "Merch (Amazon/Etsy/Teespring)" },
  music:   { emoji: "🎵", label: "Music (Spotify/SC/YT)" },
  media:   { emoji: "📰", label: "Media / Blog" },
  podcast: { emoji: "🎙️", label: "Podcast" },
  other:   { emoji: "⭐", label: "Other" },
}

const STAGES: Stage[] = ["found", "contacted", "responded", "connected", "passed"]

// ── Discovered target (from /api/discover-outreach) ──────────────────────────

interface DiscoveredTarget {
  id:          string
  name:        string
  type:        OutreachTarget["type"]
  platform:    string
  link?:       string
  note:        string
  source:      string
  emailDraft?: string
}

// ── DiscoverPanel ─────────────────────────────────────────────────────────────

function DiscoverPanel({ onAdd }: { onAdd: (t: OutreachTarget) => void }) {
  const [open,     setOpen]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [results,  setResults]  = useState<DiscoveredTarget[]>([])
  const [error,    setError]    = useState("")
  const [added,    setAdded]    = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  async function discover() {
    setLoading(true)
    setError("")
    setResults([])
    try {
      const res  = await fetch("/api/discover-outreach")
      const data = await res.json()
      setResults(data.targets ?? [])
    } catch {
      setError("Discovery failed — try again.")
    } finally {
      setLoading(false)
    }
  }

  function addToPipeline(d: DiscoveredTarget) {
    onAdd({
      id:          Date.now().toString() + Math.random(),
      name:        d.name,
      type:        d.type,
      platform:    d.platform,
      link:        d.link,
      note:        d.note,
      emailDraft:  d.emailDraft,
      stage:       "found",
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    })
    setAdded(prev => new Set([...prev, d.id]))
  }

  function dismiss(id: string) {
    setDismissed(prev => new Set([...prev, id]))
  }

  const visible = results.filter(r => !dismissed.has(r.id))

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Discover button */}
      <button
        onClick={e => { e.stopPropagation(); if (!open) { setOpen(true); discover() } else setOpen(false) }}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          padding:"9px 14px", borderRadius:10, border:"none", cursor:"pointer",
          background: open ? "#0A0A0A" : "#F5A623",
          color: open ? "#FFF" : "#000",
          fontSize:"0.875rem", fontWeight:700, transition:"all 0.15s" }}>
        <Search style={{ width:14, height:14 }} />
        {open ? "Close Discovery" : "🔍 Discover Targets"}
      </button>

      {/* Results panel */}
      {open && (
        <div style={{ background:"#F9F9F9", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:10,
          border:"1.5px solid rgba(0,0,0,0.08)" }}>

          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 0",
              justifyContent:"center" }}>
              <Loader2 style={{ width:16, height:16, color:"#F5A623", animation:"spin 1s linear infinite" }} />
              <span style={{ fontSize:"0.875rem", color:"#8E8E93", fontWeight:500 }}>
                Searching YouTube, Amazon, Etsy, web…
              </span>
            </div>
          )}

          {error && (
            <p style={{ textAlign:"center", color:"#EF4444", fontSize:"0.8125rem" }}>{error}</p>
          )}

          {!loading && visible.length === 0 && !error && (
            <p style={{ textAlign:"center", color:"#A1A1AA", fontSize:"0.875rem", padding:"8px 0" }}>
              No new targets found. Try again later.
            </p>
          )}

          {!loading && visible.length > 0 && (
            <>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#8E8E93",
                textTransform:"uppercase", letterSpacing:"0.07em" }}>
                {visible.length} targets found — review and add to pipeline
              </p>
              {visible.map(d => {
                const isAdded = added.has(d.id)
                return (
                  <div key={d.id}
                    style={{ background:"#FFF", borderRadius:10, padding:"10px 12px",
                      border:"1.5px solid rgba(0,0,0,0.07)",
                      display:"flex", flexDirection:"column", gap:8,
                      opacity: isAdded ? 0.5 : 1 }}>

                    {/* Header */}
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:"1rem" }}>{TYPE_CONFIG[d.type]?.emoji ?? "⭐"}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:"0.875rem", fontWeight:600, color:"#1D1D1F",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</p>
                        <p style={{ fontSize:"0.6875rem", color:"#8E8E93" }}>
                          {d.platform} · {TYPE_CONFIG[d.type]?.label ?? d.type} · via {d.source}
                        </p>
                      </div>
                      {d.link && (
                        <a href={d.link} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color:"#2563EB", flexShrink:0 }}>
                          <ExternalLink style={{ width:13, height:13 }} />
                        </a>
                      )}
                      <button onClick={e => { e.stopPropagation(); dismiss(d.id) }}
                        style={{ background:"none", border:"none", cursor:"pointer",
                          color:"#C7C7CC", padding:2, flexShrink:0 }}>
                        <X style={{ width:13, height:13 }} />
                      </button>
                    </div>

                    {/* Note */}
                    {d.note && (
                      <p style={{ fontSize:"0.75rem", color:"#6B7280", lineHeight:1.4,
                        overflow:"hidden", display:"-webkit-box",
                        WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {d.note}
                      </p>
                    )}

                    {/* Email preview */}
                    {d.emailDraft && (
                      <div style={{ background:"rgba(37,99,235,0.04)", borderRadius:8,
                        padding:"8px 10px", borderLeft:"3px solid #2563EB" }}>
                        <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#2563EB",
                          textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>
                          Draft Email
                        </p>
                        <p style={{ fontSize:"0.75rem", color:"#374151", lineHeight:1.5,
                          overflow:"hidden", display:"-webkit-box",
                          WebkitLineClamp:3, WebkitBoxOrient:"vertical",
                          whiteSpace:"pre-wrap" }}>{d.emailDraft}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display:"flex", gap:6 }}>
                      <button
                        onClick={e => { e.stopPropagation(); if (!isAdded) addToPipeline(d) }}
                        disabled={isAdded}
                        style={{ flex:1, padding:"6px 0", borderRadius:8, border:"none",
                          cursor: isAdded ? "not-allowed" : "pointer",
                          background: isAdded ? "#E5E5EA" : "#F5A623",
                          color: isAdded ? "#A1A1AA" : "#000",
                          fontSize:"0.75rem", fontWeight:700, transition:"all 0.15s" }}>
                        {isAdded ? "✓ Added to Pipeline" : "Add to Pipeline"}
                      </button>
                      <button onClick={e => { e.stopPropagation(); dismiss(d.id) }}
                        style={{ padding:"6px 12px", borderRadius:8,
                          border:"1.5px solid rgba(0,0,0,0.1)", background:"none",
                          cursor:"pointer", fontSize:"0.75rem", color:"#8E8E93" }}>
                        Skip
                      </button>
                    </div>
                  </div>
                )
              })}

              <button onClick={e => { e.stopPropagation(); discover() }}
                disabled={loading}
                style={{ padding:"7px 0", borderRadius:8, border:"1.5px dashed rgba(0,0,0,0.1)",
                  background:"none", cursor:"pointer", fontSize:"0.75rem", color:"#8E8E93",
                  fontWeight:600 }}>
                🔄 Search Again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

// ── StageBadge ────────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: Stage }) {
  const c = STAGE_CONFIG[stage]
  return (
    <span style={{ fontSize:"0.625rem", fontWeight:700, color: c.color, background: c.bg,
      padding:"2px 8px", borderRadius:99, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>
      {c.label}
    </span>
  )
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button onClick={e => { e.stopPropagation(); copy() }}
      style={{ padding:"3px 8px", borderRadius:6, border:"1.5px solid rgba(0,0,0,0.1)",
        background: copied ? "rgba(5,150,105,0.08)" : "#FFF", cursor:"pointer",
        display:"flex", alignItems:"center", gap:4, fontSize:"0.6875rem", fontWeight:600,
        color: copied ? "#059669" : "#8E8E93", transition:"all 0.15s" }}>
      {copied
        ? <><Check style={{ width:10, height:10 }} /> Copied</>
        : <><Copy style={{ width:10, height:10 }} /> Copy</>}
    </button>
  )
}

// ── TargetRow ─────────────────────────────────────────────────────────────────

function TargetRow({ t, expanded, onToggle, onStageChange, onDelete, onHandoffNote }: {
  t: OutreachTarget
  expanded: boolean
  onToggle: () => void
  onStageChange: (id: string, stage: Stage) => void
  onDelete: (id: string) => void
  onHandoffNote: (id: string, note: string) => void
}) {
  const [handoff, setHandoff] = useState(t.handoffNote ?? "")
  const [savingHandoff, setSavingHandoff] = useState(false)

  function saveHandoff() {
    setSavingHandoff(true)
    onHandoffNote(t.id, handoff)
    setTimeout(() => setSavingHandoff(false), 800)
  }

  return (
    <div className="inset-cell" style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <button onClick={e => { e.stopPropagation(); onToggle() }}
        style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none",
          cursor:"pointer", width:"100%", textAlign:"left", padding:0 }}>
        <span style={{ fontSize:"1rem", flexShrink:0 }}>{TYPE_CONFIG[t.type]?.emoji ?? "⭐"}</span>
        <span style={{ flex:1, fontSize:"0.875rem", fontWeight:600, color:"#1D1D1F",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</span>
        <StageBadge stage={t.stage} />
        {expanded
          ? <ChevronUp  style={{ width:14, height:14, color:"#A1A1AA", flexShrink:0, marginLeft:4 }} />
          : <ChevronDown style={{ width:14, height:14, color:"#A1A1AA", flexShrink:0, marginLeft:4 }} />}
      </button>

      {expanded && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(0,0,0,0.06)",
          display:"flex", flexDirection:"column", gap:10 }}>

          {/* Meta */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:"0.75rem", color:"#8E8E93",
              background:"#F4F4F5", padding:"2px 8px", borderRadius:6 }}>
              {TYPE_CONFIG[t.type]?.label ?? t.type}
            </span>
            <span style={{ fontSize:"0.75rem", color:"#8E8E93" }}>{t.platform}</span>
            {t.link && (
              <a href={t.link} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontSize:"0.75rem", color:"#2563EB", display:"flex", alignItems:"center", gap:3 }}>
                View <ExternalLink style={{ width:10, height:10 }} />
              </a>
            )}
            <span style={{ fontSize:"0.6875rem", color:"#C7C7CC" }}>{timeAgo(t.updatedAt)}</span>
          </div>

          {/* Contact info */}
          {t.contact && (
            <div style={{ display:"flex", alignItems:"center", gap:8,
              background:"rgba(37,99,235,0.04)", borderRadius:8, padding:"7px 10px",
              border:"1px solid rgba(37,99,235,0.1)" }}>
              <Mail style={{ width:12, height:12, color:"#2563EB", flexShrink:0 }} />
              <span style={{ flex:1, fontSize:"0.8125rem", color:"#374151",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.contact}</span>
              <CopyButton text={t.contact} />
            </div>
          )}

          {t.note && <p style={{ fontSize:"0.8125rem", color:"#374151" }}>{t.note}</p>}

          {/* Stage selector */}
          <div>
            <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Move Stage</p>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {STAGES.map(s => (
                <button key={s} onClick={e => { e.stopPropagation(); onStageChange(t.id, s) }}
                  style={{ padding:"3px 10px", borderRadius:99, border:"none", cursor:"pointer",
                    fontSize:"0.625rem", fontWeight:700,
                    background: t.stage === s ? STAGE_CONFIG[s].bg : "#F4F4F5",
                    color: t.stage === s ? STAGE_CONFIG[s].color : "#8E8E93",
                    outline: t.stage === s ? `1.5px solid ${STAGE_CONFIG[s].color}` : "none",
                    transition:"all 0.12s" }}>
                  {STAGE_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Email draft */}
          {t.emailDraft && (
            <div style={{ background:"rgba(37,99,235,0.05)", borderRadius:8,
              padding:"10px 12px", borderLeft:"3px solid #2563EB" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#2563EB",
                  textTransform:"uppercase", letterSpacing:"0.07em", flex:1 }}>
                  <Mail style={{ width:10, height:10, display:"inline", marginRight:3 }} />
                  AI Email Draft
                </p>
                <CopyButton text={t.emailDraft} />
              </div>
              <p style={{ fontSize:"0.8125rem", color:"#374151", lineHeight:1.55,
                whiteSpace:"pre-wrap" }}>{t.emailDraft}</p>
            </div>
          )}

          {/* Handoff note (for Nick/Jin) - visible when responded or connected */}
          {(t.stage === "responded" || t.stage === "connected") && (
            <div style={{ background:"rgba(245,166,35,0.06)", borderRadius:8,
              padding:"10px 12px", borderLeft:"3px solid #F5A623" }}>
              <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#D97706",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>
                <UserCheck style={{ width:10, height:10, display:"inline", marginRight:3 }} />
                Handoff Notes (Nick / Jin)
              </p>
              <textarea
                value={handoff}
                onChange={e => setHandoff(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="Add context for the team before they take over the conversation..."
                rows={3}
                style={{ width:"100%", padding:"6px 8px", borderRadius:6,
                  border:"1.5px solid rgba(245,166,35,0.25)", outline:"none",
                  fontSize:"0.8125rem", fontFamily:"inherit", background:"#FFFDF7",
                  resize:"none", boxSizing:"border-box" }}
              />
              <button
                onClick={e => { e.stopPropagation(); saveHandoff() }}
                style={{ marginTop:5, padding:"4px 12px", borderRadius:6, border:"none",
                  background: savingHandoff ? "#059669" : "#F5A623",
                  color: "#FFF", fontSize:"0.6875rem", fontWeight:700, cursor:"pointer",
                  transition:"background 0.2s" }}>
                {savingHandoff ? "Saved ✓" : "Save Note"}
              </button>
            </div>
          )}

          <button onClick={e => { e.stopPropagation(); onDelete(t.id) }}
            style={{ alignSelf:"flex-start", fontSize:"0.6875rem", color:"#EF4444",
              background:"none", border:"none", cursor:"pointer", padding:0 }}>
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

// ── Add Form ──────────────────────────────────────────────────────────────────

function AddForm({ onAdd }: { onAdd: (t: OutreachTarget) => void }) {
  const [open,    setOpen]    = useState(false)
  const [name,    setName]    = useState("")
  const [type,    setType]    = useState<OutreachTarget["type"]>("creator")
  const [plat,    setPlat]    = useState("")
  const [link,    setLink]    = useState("")
  const [contact, setContact] = useState("")
  const [note,    setNote]    = useState("")
  const [genning, setGenning] = useState(false)

  async function submit() {
    if (!name.trim()) return
    setGenning(true)

    let emailDraft: string | undefined
    try {
      const res = await fetch("/api/outreach-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, platform: plat, note }),
      })
      const data = await res.json()
      emailDraft = data.email
    } catch {}

    onAdd({
      id: Date.now().toString(),
      name: name.trim(),
      type,
      platform: plat || type,
      link:    link    || undefined,
      contact: contact || undefined,
      note:    note    || undefined,
      emailDraft,
      stage: "found",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setName(""); setPlat(""); setLink(""); setContact(""); setNote("")
    setOpen(false)
    setGenning(false)
  }

  const inputStyle = {
    padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
    outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF",
  }

  if (!open) return (
    <button onClick={e => { e.stopPropagation(); setOpen(true) }}
      style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
        borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
        cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
      <Plus style={{ width:14, height:14 }} /> Add target
    </button>
  )

  return (
    <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
      display:"flex", flexDirection:"column", gap:8 }} onClick={e => e.stopPropagation()}>

      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="Name / handle (e.g. @67tshirts, MavMusic)"
        style={inputStyle}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />

      <div style={{ display:"flex", gap:6 }}>
        <select value={type} onChange={e => setType(e.target.value as OutreachTarget["type"])}
          style={{ ...inputStyle, flex:1 }}>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </select>
        <input value={plat} onChange={e => setPlat(e.target.value)}
          placeholder="Platform (TikTok, Amazon…)"
          style={{ ...inputStyle, flex:1 }}
          onFocus={e => e.target.style.borderColor="#F5A623"}
          onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
      </div>

      <input value={contact} onChange={e => setContact(e.target.value)}
        placeholder="📧 Contact — email or DM link (for actual outreach)"
        style={{ ...inputStyle, borderColor: contact ? "#F5A623" : "rgba(0,0,0,0.1)" }}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor= contact ? "#F5A623" : "rgba(0,0,0,0.1)"} />

      <input value={link} onChange={e => setLink(e.target.value)}
        placeholder="Profile URL (optional)"
        style={inputStyle}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />

      <textarea value={note} onChange={e => setNote(e.target.value)}
        placeholder="Notes — what makes them relevant to 67? (optional)"
        rows={2}
        style={{ ...inputStyle, resize:"none" }}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />

      <div style={{ display:"flex", gap:6 }}>
        <button onClick={submit} disabled={!name.trim() || genning}
          style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
            cursor: !name.trim() || genning ? "not-allowed" : "pointer",
            background: !name.trim() || genning ? "#E5E5EA" : "#F5A623",
            color: !name.trim() || genning ? "#A1A1AA" : "#000",
            fontSize:"0.8125rem", fontWeight:700 }}>
          {genning ? "Drafting email…" : "Add + Draft Email"}
        </button>
        <button onClick={() => setOpen(false)}
          style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
            background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function OutreachCard() {
  const [targets,     setTargets]     = useState<OutreachTarget[]>([])
  const [expandedId,  setExpandedId]  = useState<string | null>(null)
  const [filterStage, setFilterStage] = useState<Stage | "all">("all")

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_outreach_targets")
      if (s) setTargets(JSON.parse(s))
    } catch {}
  }, [])

  function save(ts: OutreachTarget[]) {
    setTargets(ts)
    localStorage.setItem("67_outreach_targets", JSON.stringify(ts))
  }

  function addTarget(t: OutreachTarget) {
    save([t, ...targets])
    setExpandedId(t.id)
  }

  function updateStage(id: string, stage: Stage) {
    save(targets.map(t => t.id === id ? { ...t, stage, updatedAt: new Date().toISOString() } : t))
  }

  function updateHandoffNote(id: string, note: string) {
    save(targets.map(t => t.id === id ? { ...t, handoffNote: note, updatedAt: new Date().toISOString() } : t))
  }

  function deleteTarget(id: string) {
    save(targets.filter(t => t.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const filtered = filterStage === "all" ? targets : targets.filter(t => t.stage === filterStage)

  const counts = STAGES.reduce((acc, s) => {
    acc[s] = targets.filter(t => t.stage === s).length
    return acc
  }, {} as Record<Stage, number>)

  const responded = counts.responded ?? 0
  const connected = counts.connected ?? 0
  const active    = (counts.contacted ?? 0) + responded

  // ── Collapsed ────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Stats row */}
      <div style={{ display:"flex", gap:8 }}>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#1D1D1F", lineHeight:1 }}>{targets.length}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Targets</p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#D97706", lineHeight:1 }}>{active}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Active</p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#059669", lineHeight:1 }}>{connected}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Connected</p>
        </div>
      </div>

      {/* Responded alert */}
      {responded > 0 && (
        <div style={{ background:"rgba(37,99,235,0.07)", borderRadius:10, padding:"8px 12px",
          display:"flex", alignItems:"center", gap:8, border:"1px solid rgba(37,99,235,0.15)" }}>
          <UserCheck style={{ width:14, height:14, color:"#2563EB", flexShrink:0 }} />
          <p style={{ fontSize:"0.8125rem", color:"#2563EB", fontWeight:600 }}>
            {responded} target{responded > 1 ? "s" : ""} responded — needs Nick / Jin handoff
          </p>
        </div>
      )}

      {/* Discover targets */}
      <div onClick={e => e.stopPropagation()}>
        <DiscoverPanel onAdd={addTarget} />
      </div>

      {/* Recent targets */}
      {targets.length > 0 && (
        <div style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:12 }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {targets.slice(0,3).map(t => (
              <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span>{TYPE_CONFIG[t.type]?.emoji ?? "⭐"}</span>
                <span style={{ flex:1, fontSize:"0.8125rem", color:"#374151", fontWeight:500,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</span>
                <StageBadge stage={t.stage} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── Expanded ─────────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Pipeline funnel */}
      <div style={{ display:"flex", gap:4 }}>
        {(["all", ...STAGES] as const).map(s => {
          const cnt = s === "all" ? targets.length : (counts[s] ?? 0)
          const cfg = s === "all" ? null : STAGE_CONFIG[s]
          const isActive = filterStage === s
          return (
            <button key={s} onClick={() => setFilterStage(s)}
              style={{ flex:1, padding:"7px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: isActive ? (cfg?.bg ?? "rgba(245,166,35,0.12)") : "#F4F4F5",
                outline: isActive ? `1.5px solid ${cfg?.color ?? "#F5A623"}` : "none",
                transition:"all 0.12s", display:"flex", flexDirection:"column",
                alignItems:"center", gap:3 }}>
              <span style={{ fontSize:"0.875rem", fontWeight:800,
                color: isActive ? (cfg?.color ?? "#F5A623") : "#1D1D1F" }}>{cnt}</span>
              <span style={{ fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.05em", color: isActive ? (cfg?.color ?? "#F5A623") : "#A1A1AA" }}>
                {s === "all" ? "All" : STAGE_CONFIG[s].label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Responded handoff alert */}
      {responded > 0 && filterStage !== "responded" && (
        <button onClick={() => setFilterStage("responded")}
          style={{ background:"rgba(37,99,235,0.07)", borderRadius:10, padding:"9px 12px",
            display:"flex", alignItems:"center", gap:8, border:"1px solid rgba(37,99,235,0.15)",
            cursor:"pointer", width:"100%", textAlign:"left" }}>
          <UserCheck style={{ width:14, height:14, color:"#2563EB", flexShrink:0 }} />
          <p style={{ fontSize:"0.8125rem", color:"#2563EB", fontWeight:600, flex:1 }}>
            {responded} responded — Nick / Jin handoff needed
          </p>
          <span style={{ fontSize:"0.75rem", color:"#2563EB" }}>View →</span>
        </button>
      )}

      {/* Discover + manual add */}
      <DiscoverPanel onAdd={addTarget} />
      <AddForm onAdd={addTarget} />

      {/* Filtered list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign:"center", color:"#A1A1AA", fontSize:"0.875rem", padding:"20px 0" }}>
            {filterStage === "all"
              ? "No targets yet. Add merch sellers, musicians, TikTok creators building around 67."
              : `No targets in "${STAGE_CONFIG[filterStage as Stage]?.label}" stage.`}
          </p>
        ) : filtered.map(t => (
          <TargetRow key={t.id} t={t}
            expanded={expandedId === t.id}
            onToggle={() => setExpandedId(v => v === t.id ? null : t.id)}
            onStageChange={updateStage}
            onDelete={deleteTarget}
            onHandoffNote={updateHandoffNote}
          />
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Outreach Pipeline"
      subtitle="Find · Contact · Connect"
      icon={<Share2 style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
