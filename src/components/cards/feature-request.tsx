"use client"

import { useState, useEffect, useRef } from "react"
import { Zap, ChevronDown, ChevronUp, Clock } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { aiHeaders } from "@/lib/ai-settings"

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeatureReq {
  id:        string
  what:      string
  why:       string
  how?:      string
  plan?:     string
  priority?: "high" | "medium" | "low"
  effort?:   string
  tags?:     string[]
  submittedAt: string
  status:    "pending" | "analyzing" | "planned" | "building" | "done"
}

const PRIORITY_COLOR: Record<string, string> = {
  high:   "#EF4444",
  medium: "#F5A623",
  low:    "#10B981",
}

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pending",
  analyzing: "Analyzing…",
  planned:   "Planned",
  building:  "Building",
  done:      "Done ✓",
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PriorityDot({ p }: { p?: string }) {
  if (!p) return null
  return <span style={{ width:8, height:8, borderRadius:"50%", background: PRIORITY_COLOR[p] ?? "#A1A1AA", flexShrink:0, display:"inline-block" }} />
}

function ReqRow({ r, expanded, onToggle }: { r: FeatureReq; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="inset-cell" style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <button onClick={e => { e.stopPropagation(); onToggle() }}
        style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none",
          cursor:"pointer", width:"100%", textAlign:"left", padding:0 }}>
        <PriorityDot p={r.priority} />
        <span style={{ flex:1, fontSize:"0.875rem", fontWeight:600, color:"var(--foreground)",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.what}</span>
        <span style={{ fontSize:"0.6875rem", color:"var(--secondary)", flexShrink:0, marginRight:4 }}>
          {STATUS_LABEL[r.status]}
        </span>
        {expanded
          ? <ChevronUp  style={{ width:14, height:14, color:"var(--secondary)", flexShrink:0 }} />
          : <ChevronDown style={{ width:14, height:14, color:"var(--secondary)", flexShrink:0 }} />}
      </button>

      {expanded && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid var(--separator)",
          display:"flex", flexDirection:"column", gap:8 }}>
          <div>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--tertiary)",
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>Why</p>
            <p style={{ fontSize:"0.8125rem", color:"var(--foreground)" }}>{r.why}</p>
          </div>
          {r.how && (
            <div>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--tertiary)",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>How</p>
              <p style={{ fontSize:"0.8125rem", color:"var(--foreground)" }}>{r.how}</p>
            </div>
          )}
          {r.plan && (
            <div style={{ background:"#F9F9F9", borderRadius:8, padding:"10px 12px",
              borderLeft:`3px solid ${PRIORITY_COLOR[r.priority ?? "medium"]}` }}>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#F5A623",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>AI Analysis</p>
              <p style={{ fontSize:"0.8125rem", color:"var(--foreground)", lineHeight:1.5 }}>{r.plan}</p>
              <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                {r.effort && (
                  <span style={{ fontSize:"0.625rem", fontWeight:700, color:"var(--tertiary)",
                    background:"#EFEFEF", padding:"2px 8px", borderRadius:99 }}>⏱ {r.effort}</span>
                )}
                {r.tags?.map(t => (
                  <span key={t} style={{ fontSize:"0.625rem", fontWeight:700, color:"#5865F2",
                    background:"rgba(88,101,242,0.08)", padding:"2px 8px", borderRadius:99 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", display:"flex", alignItems:"center", gap:4 }}>
            <Clock style={{ width:10, height:10 }} />{timeAgo(r.submittedAt)}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function FeatureRequestCard() {
  const [requests, setRequests]     = useState<FeatureReq[]>([])
  const [what,     setWhat]         = useState("")
  const [why,      setWhy]          = useState("")
  const [how,      setHow]          = useState("")
  const [loading,  setLoading]      = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [quickPlan, setQuickPlan]   = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("67_feature_requests")
      if (saved) setRequests(JSON.parse(saved))
    } catch {}
  }, [])

  function save(reqs: FeatureReq[]) {
    setRequests(reqs)
    localStorage.setItem("67_feature_requests", JSON.stringify(reqs))
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!what.trim() || !why.trim() || loading) return

    const id = Date.now().toString()
    const newReq: FeatureReq = {
      id, what: what.trim(), why: why.trim(),
      how: how.trim() || undefined,
      submittedAt: new Date().toISOString(),
      status: "analyzing",
    }
    const updated = [newReq, ...requests]
    save(updated)
    setWhat(""); setWhy(""); setHow(""); setQuickPlan(null)
    setLoading(true)

    try {
      const res  = await fetch("/api/feature-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...aiHeaders() },
        body: JSON.stringify({ what: newReq.what, why: newReq.why, how: newReq.how }),
      })
      const data = await res.json()

      setQuickPlan(data.plan ?? null)

      const final = updated.map(r => r.id === id
        ? { ...r, plan: data.plan, priority: data.priority, effort: data.effort,
            tags: data.tags, status: "planned" as const }
        : r
      )
      save(final)
      setExpandedId(id)
    } catch {
      save(updated.map(r => r.id === id ? { ...r, status: "planned" as const } : r))
    } finally {
      setLoading(false)
    }
  }

  // ── Collapsed — inline form + recent list ─────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Quick form */}
      <form onSubmit={submit} onClick={e => e.stopPropagation()}
        style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <input
          ref={inputRef}
          value={what}
          onChange={e => setWhat(e.target.value)}
          placeholder="What do you need?"
          style={{
            width:"100%", padding:"9px 12px", borderRadius:10, fontSize:"0.875rem",
            border:"1.5px solid var(--separator)", outline:"none", fontFamily:"inherit",
            background:"var(--input-bg, #FAFAFA)", color:"var(--foreground)", boxSizing:"border-box",
          }}
          onFocus={e => e.target.style.borderColor = "#F5A623"}
          onBlur={e  => e.target.style.borderColor = "var(--separator)"}
        />
        <input
          value={why}
          onChange={e => setWhy(e.target.value)}
          placeholder="Why does it matter?"
          style={{
            width:"100%", padding:"9px 12px", borderRadius:10, fontSize:"0.875rem",
            border:"1.5px solid var(--separator)", outline:"none", fontFamily:"inherit",
            background:"var(--input-bg, #FAFAFA)", color:"var(--foreground)", boxSizing:"border-box",
          }}
          onFocus={e => e.target.style.borderColor = "#F5A623"}
          onBlur={e  => e.target.style.borderColor = "var(--separator)"}
        />
        <button type="submit" disabled={!what.trim() || !why.trim() || loading}
          style={{
            padding:"9px 0", borderRadius:10, border:"none", cursor: loading ? "wait" : "pointer",
            background: (!what.trim() || !why.trim() || loading) ? "var(--input-bg, #E5E5EA)" : "#F5A623",
            color: (!what.trim() || !why.trim() || loading) ? "var(--tertiary)" : "#000",
            fontSize:"0.875rem", fontWeight:700, transition:"all 0.15s",
          }}>
          {loading ? "Analyzing…" : "Submit ⚡"}
        </button>
      </form>

      {/* Quick plan preview */}
      {quickPlan && (
        <div onClick={e => e.stopPropagation()}
          style={{ background:"rgba(245,166,35,0.07)", border:"1.5px solid rgba(245,166,35,0.3)",
            borderRadius:10, padding:"10px 12px" }}>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#F5A623",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>⚡ AI Analysis</p>
          <p style={{ fontSize:"0.8125rem", color:"var(--foreground)", lineHeight:1.5 }}>{quickPlan}</p>
        </div>
      )}

      {/* Recent requests mini-list */}
      {requests.length > 0 && (
        <div style={{ borderTop:"1px solid var(--separator)", paddingTop:12 }}>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"var(--tertiary)",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>
            Recent · {requests.length} request{requests.length !== 1 ? "s" : ""}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }} onClick={e => e.stopPropagation()}>
            {requests.slice(0,3).map(r => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0" }}>
                <PriorityDot p={r.priority} />
                <span style={{ flex:1, fontSize:"0.8125rem", color:"var(--foreground)", fontWeight:500,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.what}</span>
                <span style={{ fontSize:"0.6875rem", color:"var(--secondary)", flexShrink:0 }}>
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── Expanded modal — full form + all requests ─────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Full form */}
      <div style={{ background:"#FAFAFA", borderRadius:14, padding:16 }}>
        <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--tertiary)",
          textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>New Request</p>
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { val: what, set: setWhat, ph: "What do you need?" },
            { val: why,  set: setWhy,  ph: "Why does it matter?" },
            { val: how,  set: setHow,  ph: "How do you see it working? (optional)" },
          ].map(({ val, set, ph }) => (
            <input key={ph} value={val} onChange={e => set(e.target.value)} placeholder={ph}
              style={{ width:"100%", padding:"9px 12px", borderRadius:10, fontSize:"0.875rem",
                border:"1.5px solid var(--separator)", outline:"none", fontFamily:"inherit",
                background:"#FFF", color:"var(--foreground)", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor = "#F5A623"}
              onBlur={e  => e.target.style.borderColor = "rgba(0,0,0,0.1)"} />
          ))}
          <button type="submit" disabled={!what.trim() || !why.trim() || loading}
            style={{ padding:"10px 0", borderRadius:10, border:"none",
              cursor: (!what.trim() || !why.trim() || loading) ? "not-allowed" : "pointer",
              background: (!what.trim() || !why.trim() || loading) ? "#E5E5EA" : "#F5A623",
              color: (!what.trim() || !why.trim() || loading) ? "#A1A1AA" : "#000",
              fontSize:"0.875rem", fontWeight:700, transition:"all 0.15s" }}>
            {loading ? "Analyzing…" : "Submit ⚡"}
          </button>
        </form>
      </div>

      {/* All requests */}
      {requests.length > 0 && (
        <div>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--tertiary)",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
            All Requests ({requests.length})
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {requests.map(r => (
              <ReqRow key={r.id} r={r}
                expanded={expandedId === r.id}
                onToggle={() => setExpandedId(v => v === r.id ? null : r.id)} />
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div style={{ textAlign:"center", padding:"32px 0", color:"var(--secondary)" }}>
          <p style={{ fontSize:"2rem" }}>⚡</p>
          <p style={{ fontSize:"0.875rem", marginTop:8 }}>No requests yet. Be the first.</p>
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Feature Requests"
      subtitle="Submit · AI Plans · Gets Built"
      icon={<Zap style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}

// ── Embedded section for use in other cards ──────────────────────────────────
export function FeatureRequestSection() {
  const [requests, setRequests] = useState<FeatureReq[]>([])
  const [what,     setWhat]     = useState("")
  const [why,      setWhy]      = useState("")
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("67_feature_requests")
      if (saved) setRequests(JSON.parse(saved))
    } catch {}
  }, [])

  function save(reqs: FeatureReq[]) {
    setRequests(reqs)
    localStorage.setItem("67_feature_requests", JSON.stringify(reqs))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!what.trim() || !why.trim() || loading) return
    const id = Date.now().toString()
    const newReq: FeatureReq = { id, what: what.trim(), why: why.trim(), submittedAt: new Date().toISOString(), status: "analyzing" }
    const updated = [newReq, ...requests]
    save(updated)
    setWhat(""); setWhy(""); setLoading(true)
    try {
      const res  = await fetch("/api/feature-request", { method:"POST", headers:{"Content-Type":"application/json",...aiHeaders()}, body: JSON.stringify({ what: newReq.what, why: newReq.why }) })
      const data = await res.json()
      save(updated.map(r => r.id === id ? { ...r, plan: data.plan, priority: data.priority, effort: data.effort, tags: data.tags, status: "planned" as const } : r))
    } catch {
      save(updated.map(r => r.id === id ? { ...r, status: "planned" as const } : r))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <p style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>
        Feature Requests
      </p>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} style={{ display:"flex", flexDirection:"column", gap:6 }}>
        <input value={what} onChange={e => setWhat(e.target.value)} placeholder="What to build?" required
          style={{ width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:8, border:"1.5px solid var(--separator)", fontSize:"0.75rem", fontFamily:"inherit", background:"var(--input-bg)", color:"var(--foreground)", outline:"none" }}
          onFocus={e => e.currentTarget.style.borderColor="#F5A623"} onBlur={e => e.currentTarget.style.borderColor="var(--separator)"} />
        <input value={why} onChange={e => setWhy(e.target.value)} placeholder="Why? (value / problem)" required
          style={{ width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:8, border:"1.5px solid var(--separator)", fontSize:"0.75rem", fontFamily:"inherit", background:"var(--input-bg)", color:"var(--foreground)", outline:"none" }}
          onFocus={e => e.currentTarget.style.borderColor="#F5A623"} onBlur={e => e.currentTarget.style.borderColor="var(--separator)"} />
        <button type="submit" disabled={loading || !what.trim() || !why.trim()}
          style={{ padding:"7px 12px", borderRadius:8, border:"none", cursor:"pointer", background: (loading || !what.trim() || !why.trim()) ? "var(--input-bg)" : "#F5A623", color:(loading || !what.trim() || !why.trim()) ? "var(--secondary)" : "#fff", fontWeight:700, fontSize:"0.75rem", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          {loading ? "Analyzing…" : "Submit"}
        </button>
      </form>
      {requests.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:120, overflowY:"auto" }}>
          {requests.slice(0,3).map(r => (
            <div key={r.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 8px", background:"#F4F4F5", borderRadius:7 }}>
              <PriorityDot p={r.priority} />
              <span style={{ flex:1, fontSize:"0.6875rem", fontWeight:600, color:"var(--foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.what}</span>
              <span style={{ fontSize:"0.5625rem", color:"var(--secondary)", whiteSpace:"nowrap" }}>{STATUS_LABEL[r.status]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
