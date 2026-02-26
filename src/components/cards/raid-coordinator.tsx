"use client"

import { useState, useEffect, useRef } from "react"
import { Swords, Plus, Copy, Check, ExternalLink, Trash2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

// ── Types ─────────────────────────────────────────────────────────────────────

type RaidType = "quote" | "reply" | "like-rt" | "thread"
type RaidStatus = "queued" | "active" | "done"

interface Raid {
  id:        string
  url:       string
  type:      RaidType
  target:    string   // twitter handle or short desc
  message?:  string   // suggested reply/quote text
  status:    RaidStatus
  createdAt: string
  launchedAt?: string
}

const TYPE_CONFIG: Record<RaidType, { label: string; emoji: string; color: string }> = {
  "quote":   { label: "Quote Tweet", emoji: "💬", color: "#2563EB" },
  "reply":   { label: "Reply Raid",  emoji: "↩️",  color: "#059669" },
  "like-rt": { label: "Like + RT",   emoji: "❤️",  color: "#EF4444" },
  "thread":  { label: "Thread Bomb", emoji: "🧵",  color: "#7C3AED" },
}

const STATUS_CONFIG: Record<RaidStatus, { label: string; color: string; bg: string }> = {
  queued: { label: "Queued",  color: "#F5A623", bg: "rgba(245,166,35,0.1)"  },
  active: { label: "🔥 LIVE", color: "#EF4444", bg: "rgba(239,68,68,0.1)"  },
  done:   { label: "Done ✓",  color: "#059669", bg: "rgba(5,150,105,0.08)" },
}

const RAID_TEMPLATES: Record<RaidType, string[]> = {
  "quote":   [
    "The 67 movement is real and it's everywhere 🤙 $67",
    "Community doesn't sleep 💎 $67 #67coin",
    "This is what a cultural movement looks like 🙌 $67",
  ],
  "reply":   [
    "67 Kid energy 🤙 #67coin $67",
    "The 67 wave is unstoppable 💪 $67",
    "67 is everywhere frfr 👀 $67 #67coin",
  ],
  "like-rt": [],
  "thread":  [
    "Why $67 is different from every other memecoin 🧵👇",
  ],
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy}
      style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px",
        borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", background:"none",
        cursor:"pointer", fontSize:"0.6875rem", fontWeight:600,
        color: copied ? "#059669" : "#8E8E93", transition:"color 0.2s" }}>
      {copied ? <Check style={{ width:12, height:12 }} /> : <Copy style={{ width:12, height:12 }} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

// ── RaidCard ──────────────────────────────────────────────────────────────────

function RaidCard({ r, onStatus, onDelete }: {
  r: Raid
  onStatus: (id: string, s: RaidStatus) => void
  onDelete: (id: string) => void
}) {
  const cfg = TYPE_CONFIG[r.type]
  const st  = STATUS_CONFIG[r.status]

  return (
    <div className="inset-cell" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:"1rem" }}>{cfg.emoji}</span>
        <span style={{ flex:1, fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.target}</span>
        <span style={{ fontSize:"0.625rem", fontWeight:700, color: st.color,
          background: st.bg, padding:"2px 8px", borderRadius:99 }}>{st.label}</span>
      </div>

      {/* Type + time */}
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span style={{ fontSize:"0.6875rem", fontWeight:600, color: cfg.color }}>{cfg.label}</span>
        <span style={{ fontSize:"0.6875rem", color:"#C7C7CC" }}>{timeAgo(r.createdAt)}</span>
        <a href={r.url} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ fontSize:"0.6875rem", color:"#2563EB", display:"flex", alignItems:"center", gap:3, marginLeft:"auto" }}>
          Open <ExternalLink style={{ width:10, height:10 }} />
        </a>
      </div>

      {/* Suggested message */}
      {r.message && (
        <div style={{ background:"#F9F9F9", borderRadius:8, padding:"8px 10px",
          borderLeft:`3px solid ${cfg.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
            <p style={{ fontSize:"0.8125rem", color:"#374151", flex:1, lineHeight:1.5 }}>{r.message}</p>
            <CopyBtn text={r.message} />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
        {r.status === "queued" && (
          <button onClick={e => { e.stopPropagation(); onStatus(r.id, "active") }}
            style={{ padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer",
              background:"#EF4444", color:"#fff", fontSize:"0.75rem", fontWeight:700 }}>
            🔥 Launch
          </button>
        )}
        {r.status === "active" && (
          <button onClick={e => { e.stopPropagation(); onStatus(r.id, "done") }}
            style={{ padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer",
              background:"#059669", color:"#fff", fontSize:"0.75rem", fontWeight:700 }}>
            ✓ Mark Done
          </button>
        )}
        {r.status === "done" && (
          <span style={{ fontSize:"0.75rem", color:"#059669", fontWeight:600 }}>Raid complete 🏆</span>
        )}
        <button onClick={e => { e.stopPropagation(); onDelete(r.id) }}
          style={{ marginLeft:"auto", display:"flex", alignItems:"center",
            background:"none", border:"none", cursor:"pointer", color:"#EF4444" }}>
          <Trash2 style={{ width:14, height:14 }} />
        </button>
      </div>
    </div>
  )
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export function RaidCoordinatorCard() {
  const [raids,    setRaids]    = useState<Raid[]>([])
  const [addOpen,  setAddOpen]  = useState(false)
  const [url,      setUrl]      = useState("")
  const [target,   setTarget]   = useState("")
  const [type,     setType]     = useState<RaidType>("reply")
  const [msgIdx,   setMsgIdx]   = useState(0)
  const [genning,  setGenning]  = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_raids")
      if (s) setRaids(JSON.parse(s))
    } catch {}
  }, [])

  function save(rs: Raid[]) {
    setRaids(rs)
    localStorage.setItem("67_raids", JSON.stringify(rs))
  }

  async function addRaid() {
    if (!url.trim()) return
    setGenning(true)

    let message: string | undefined
    const templates = RAID_TEMPLATES[type]

    try {
      const apiKey = !!process.env.NEXT_PUBLIC_HAS_AI
      if (!apiKey && templates.length > 0) {
        message = templates[msgIdx % templates.length]
      } else {
        // Try AI
        const res = await fetch("/api/raid-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, type, target }),
        })
        const data = await res.json()
        message = data.message || (templates.length > 0 ? templates[0] : undefined)
      }
    } catch {
      message = templates.length > 0 ? templates[msgIdx % templates.length] : undefined
    }

    save([{
      id: Date.now().toString(), url: url.trim(), type,
      target: target.trim() || url.replace("https://twitter.com/", "@").replace("https://x.com/", "@").slice(0, 30),
      message, status: "queued",
      createdAt: new Date().toISOString(),
    }, ...raids])

    setUrl(""); setTarget(""); setAddOpen(false)
    setGenning(false)
  }

  function updateStatus(id: string, status: RaidStatus) {
    save(raids.map(r => r.id === id ? { ...r, status, launchedAt: status === "active" ? new Date().toISOString() : r.launchedAt } : r))
  }

  function deleteRaid(id: string) {
    save(raids.filter(r => r.id !== id))
  }

  const active = raids.filter(r => r.status === "active").length
  const queued = raids.filter(r => r.status === "queued").length
  const done   = raids.filter(r => r.status === "done").length

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Stats */}
      <div style={{ display:"flex", gap:8 }}>
        {[
          { n: active, label: "LIVE 🔥", c: "#EF4444" },
          { n: queued, label: "Queued",  c: "#F5A623" },
          { n: done,   label: "Done ✓",  c: "#059669" },
        ].map(({ n, label, c }) => (
          <div key={label} className="inset-cell" style={{ flex:1, textAlign:"center" }}>
            <p style={{ fontSize:"1.5rem", fontWeight:800, color: c, lineHeight:1 }}>{n}</p>
            <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
              textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div onClick={e => e.stopPropagation()}>
        {!addOpen ? (
          <button onClick={() => setAddOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
              borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
              cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
            <Plus style={{ width:14, height:14 }} /> New raid target
          </button>
        ) : (
          <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
            display:"flex", flexDirection:"column", gap:8 }}>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="Tweet / post URL"
              style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <div style={{ display:"flex", gap:6 }}>
              <select value={type} onChange={e => setType(e.target.value as RaidType)}
                style={{ flex:1, padding:"8px 10px", borderRadius:8,
                  border:"1.5px solid rgba(0,0,0,0.1)", outline:"none",
                  fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
                {Object.entries(TYPE_CONFIG).map(([k,v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
              <input value={target} onChange={e => setTarget(e.target.value)}
                placeholder="Target name"
                style={{ flex:1, padding:"8px 10px", borderRadius:8,
                  border:"1.5px solid rgba(0,0,0,0.1)", outline:"none",
                  fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
                onFocus={e => e.target.style.borderColor="#F5A623"}
                onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={addRaid} disabled={!url.trim() || genning}
                style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                  cursor: !url.trim() || genning ? "not-allowed" : "pointer",
                  background: !url.trim() || genning ? "#E5E5EA" : "#F5A623",
                  color: !url.trim() || genning ? "#A1A1AA" : "#000",
                  fontSize:"0.8125rem", fontWeight:700 }}>
                {genning ? "Preparing…" : "Add Raid ⚔️"}
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

      {/* Active raids first */}
      {raids.length > 0 && (
        <div style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:12 }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[...raids.filter(r => r.status === "active"), ...raids.filter(r => r.status === "queued")]
              .slice(0,3).map(r => (
              <RaidCard key={r.id} r={r} onStatus={updateStatus} onDelete={deleteRaid} />
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Add form */}
      {!addOpen ? (
        <button onClick={() => setAddOpen(true)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
            borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
            cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
          <Plus style={{ width:14, height:14 }} /> New raid target
        </button>
      ) : (
        <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:8 }}>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Tweet / post URL"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Target description"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <select value={type} onChange={e => setType(e.target.value as RaidType)}
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
            {Object.entries(TYPE_CONFIG).map(([k,v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={addRaid} disabled={!url.trim() || genning}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                cursor: !url.trim() || genning ? "not-allowed" : "pointer",
                background: !url.trim() || genning ? "#E5E5EA" : "#F5A623",
                color: !url.trim() || genning ? "#A1A1AA" : "#000",
                fontSize:"0.8125rem", fontWeight:700 }}>
              {genning ? "Preparing…" : "Add Raid ⚔️"}
            </button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {raids.length === 0 ? (
        <p style={{ textAlign:"center", color:"#A1A1AA", fontSize:"0.875rem", padding:"20px 0" }}>
          No raids yet. Add a target above.
        </p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {/* Active first */}
          {raids.filter(r => r.status !== "done").map(r => (
            <RaidCard key={r.id} r={r} onStatus={updateStatus} onDelete={deleteRaid} />
          ))}
          {done > 0 && (
            <>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#8E8E93",
                textTransform:"uppercase", letterSpacing:"0.07em", marginTop:4 }}>Completed</p>
              {raids.filter(r => r.status === "done").map(r => (
                <RaidCard key={r.id} r={r} onStatus={updateStatus} onDelete={deleteRaid} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Raid Coordinator"
      subtitle="Target · Launch · Dominate"
      icon={<Swords style={{ width:16, height:16 }} />}
      accentColor="#EF4444"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
