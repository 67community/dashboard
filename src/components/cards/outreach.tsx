"use client"

import { useState, useEffect } from "react"
import { Share2, Plus, ChevronDown, ChevronUp, Mail, ExternalLink } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = "found" | "contacted" | "responded" | "connected" | "passed"

interface OutreachTarget {
  id:          string
  name:        string
  type:        "creator" | "merch" | "builder" | "media" | "podcast" | "other"
  platform:    string
  link?:       string
  note?:       string
  stage:       Stage
  createdAt:   string
  updatedAt:   string
  emailDraft?: string
}

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string }> = {
  found:     { label: "Found",     color: "#8E8E93", bg: "#F4F4F5" },
  contacted: { label: "Contacted", color: "#D97706", bg: "rgba(217,119,6,0.09)" },
  responded: { label: "Responded", color: "#2563EB", bg: "rgba(37,99,235,0.09)" },
  connected: { label: "Connected", color: "#059669", bg: "rgba(5,150,105,0.09)" },
  passed:    { label: "Passed",    color: "#A1A1AA", bg: "#F4F4F5" },
}

const TYPE_EMOJI: Record<string, string> = {
  creator: "🎥", merch: "👕", builder: "🔧", media: "📰", podcast: "🎙️", other: "⭐",
}

const STAGES: Stage[] = ["found", "contacted", "responded", "connected", "passed"]

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

// ── TargetRow ─────────────────────────────────────────────────────────────────

function TargetRow({ t, expanded, onToggle, onStageChange, onDelete }: {
  t: OutreachTarget
  expanded: boolean
  onToggle: () => void
  onStageChange: (id: string, stage: Stage) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="inset-cell" style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <button onClick={e => { e.stopPropagation(); onToggle() }}
        style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none",
          cursor:"pointer", width:"100%", textAlign:"left", padding:0 }}>
        <span style={{ fontSize:"1rem", flexShrink:0 }}>{TYPE_EMOJI[t.type]}</span>
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
              <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#2563EB",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>
                <Mail style={{ width:10, height:10, display:"inline", marginRight:3 }} />Email Draft
              </p>
              <p style={{ fontSize:"0.8125rem", color:"#374151", lineHeight:1.55,
                whiteSpace:"pre-wrap" }}>{t.emailDraft}</p>
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
  const [open,  setOpen]  = useState(false)
  const [name,  setName]  = useState("")
  const [type,  setType]  = useState<OutreachTarget["type"]>("creator")
  const [plat,  setPlat]  = useState("")
  const [link,  setLink]  = useState("")
  const [note,  setNote]  = useState("")
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
      type, platform: plat || type, link: link || undefined,
      note: note || undefined, emailDraft,
      stage: "found",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setName(""); setPlat(""); setLink(""); setNote(""); setOpen(false)
    setGenning(false)
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
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name / handle"
        style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
          outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
      <div style={{ display:"flex", gap:6 }}>
        <select value={type} onChange={e => setType(e.target.value as OutreachTarget["type"])}
          style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
            outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
          {Object.entries(TYPE_EMOJI).map(([k,v]) => (
            <option key={k} value={k}>{v} {k}</option>
          ))}
        </select>
        <input value={plat} onChange={e => setPlat(e.target.value)} placeholder="Platform"
          style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
            outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
          onFocus={e => e.target.style.borderColor="#F5A623"}
          onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
      </div>
      <input value={link} onChange={e => setLink(e.target.value)} placeholder="Profile URL (optional)"
        style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
          outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Notes (optional)"
        rows={2}
        style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
          outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF",
          resize:"none" }}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
      <div style={{ display:"flex", gap:6 }}>
        <button onClick={submit} disabled={!name.trim() || genning}
          style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
            cursor: !name.trim() || genning ? "not-allowed" : "pointer",
            background: !name.trim() || genning ? "#E5E5EA" : "#F5A623",
            color: !name.trim() || genning ? "#A1A1AA" : "#000",
            fontSize:"0.8125rem", fontWeight:700 }}>
          {genning ? "Generating email…" : "Add + Draft Email"}
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
  const [targets,    setTargets]    = useState<OutreachTarget[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
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

  function deleteTarget(id: string) {
    save(targets.filter(t => t.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const filtered = filterStage === "all" ? targets : targets.filter(t => t.stage === filterStage)

  // Stage counts
  const counts = STAGES.reduce((acc, s) => {
    acc[s] = targets.filter(t => t.stage === s).length
    return acc
  }, {} as Record<Stage, number>)

  const connected = counts.connected ?? 0
  const active    = (counts.contacted ?? 0) + (counts.responded ?? 0)

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

      {/* Add target form */}
      <div onClick={e => e.stopPropagation()}>
        <AddForm onAdd={addTarget} />
      </div>

      {/* Recent targets */}
      {targets.length > 0 && (
        <div style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:12 }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {targets.slice(0,3).map(t => (
              <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span>{TYPE_EMOJI[t.type]}</span>
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
          const active = filterStage === s
          return (
            <button key={s} onClick={() => setFilterStage(s)}
              style={{ flex:1, padding:"7px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: active ? (cfg?.bg ?? "#F5A623" + "22") : "#F4F4F5",
                outline: active ? `1.5px solid ${cfg?.color ?? "#F5A623"}` : "none",
                transition:"all 0.12s", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <span style={{ fontSize:"0.875rem", fontWeight:800,
                color: active ? (cfg?.color ?? "#F5A623") : "#1D1D1F" }}>{cnt}</span>
              <span style={{ fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.05em", color: active ? (cfg?.color ?? "#F5A623") : "#A1A1AA" }}>
                {s === "all" ? "All" : STAGE_CONFIG[s].label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Add form */}
      <AddForm onAdd={addTarget} />

      {/* Filtered list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign:"center", color:"#A1A1AA", fontSize:"0.875rem", padding:"20px 0" }}>
            {filterStage === "all" ? "No targets yet. Add one above." : `No targets in "${STAGE_CONFIG[filterStage]?.label}" stage.`}
          </p>
        ) : filtered.map(t => (
          <TargetRow key={t.id} t={t}
            expanded={expandedId === t.id}
            onToggle={() => setExpandedId(v => v === t.id ? null : t.id)}
            onStageChange={updateStage}
            onDelete={deleteTarget} />
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
