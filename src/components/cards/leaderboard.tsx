"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, Plus, Trash2, ChevronUp, RefreshCw, Wifi } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

type LeaderCategory = "raiders" | "contributors" | "creators" | "holders"

interface LeaderEntry {
  id:       string
  handle:   string
  avatar?:  string
  score:    number
  category: LeaderCategory
  note?:    string
  badge?:   string
  meta?:    string
  address?: string
  addedAt:  string
  isLive?:  boolean  // from API vs manually added
}

const CAT_CONFIG: Record<LeaderCategory, { label: string; emoji: string; color: string; live: boolean }> = {
  raiders:      { label: "Raiders",      emoji: "⚔️",  color: "#EF4444", live: true  },
  contributors: { label: "Contributors", emoji: "🌟",  color: "#F5A623", live: false },
  creators:     { label: "Creators",     emoji: "🎥",  color: "#7C3AED", live: true  },
  holders:      { label: "Holders",      emoji: "💎",  color: "#059669", live: true  },
}

const RANK_EMOJI = ["🥇", "🥈", "🥉"]

const LS_KEY = "67_leaderboard"
const BANNED = ["mav67kid67", "67coinsolana"]

function fmtScore(n: number, cat: LeaderCategory): string {
  if (cat === "holders") {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
    if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`
  }
  if (cat === "creators") {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  }
  return n.toLocaleString()
}

export function CommunityLeaderboardCard() {
  const [liveData,    setLiveData]    = useState<{ raiders: LeaderEntry[]; creators: LeaderEntry[]; holders: LeaderEntry[] } | null>(null)
  const [manualEntries, setManualEntries] = useState<LeaderEntry[]>([])
  const [category,    setCategory]    = useState<LeaderCategory>("raiders")
  const [loading,     setLoading]     = useState(false)
  const [lastFetch,   setLastFetch]   = useState<string | null>(null)
  const [addOpen,     setAddOpen]     = useState(false)
  const [handle,      setHandle]      = useState("")
  const [score,       setScore]       = useState("100")
  const [badge,       setBadge]       = useState("")
  const [note,        setNote]        = useState("")

  // Load manual (contributors) entries from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY)
      if (s) {
        const parsed: LeaderEntry[] = JSON.parse(s)
        const cleaned = parsed.filter(e =>
          !BANNED.some(b => e.handle.toLowerCase().includes(b))
        )
        setManualEntries(cleaned)
      }
    } catch {}
  }, [])

  const fetchLive = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/leaderboard")
      const json = await res.json()
      // Convert API response into LeaderEntry[]
      const now = new Date().toISOString()
      const toEntries = (arr: { handle: string; score: number; badge: string; meta?: string; address?: string }[], cat: LeaderCategory): LeaderEntry[] =>
        (arr ?? []).map((x, i) => ({
          id:       `live-${cat}-${i}`,
          handle:   x.handle,
          score:    x.score,
          category: cat,
          badge:    x.badge,
          meta:     x.meta,
          address:  x.address,
          addedAt:  now,
          isLive:   true,
        }))

      setLiveData({
        raiders:  toEntries(json.raiders,  "raiders"),
        creators: toEntries(json.creators, "creators"),
        holders:  toEntries(json.holders,  "holders"),
      })
      setLastFetch(json.fetchedAt ?? now)
    } catch {}
    setLoading(false)
  }, [])

  // Fetch on mount, then every 5 min
  useEffect(() => {
    fetchLive()
    const id = setInterval(fetchLive, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchLive])

  function saveManual(es: LeaderEntry[]) {
    const filtered = es.filter(e => e.category === "contributors")
    setManualEntries(filtered)
    // keep all non-contributors from existing manual too
    const others = manualEntries.filter(e => e.category !== "contributors")
    const all = [...others, ...filtered]
    localStorage.setItem(LS_KEY, JSON.stringify(all))
  }

  function addManual() {
    if (!handle.trim()) return
    const entry: LeaderEntry = {
      id:       Date.now().toString(),
      handle:   handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`,
      score:    parseInt(score) || 100,
      category: "contributors",
      badge:    badge.trim() || undefined,
      note:     note.trim() || undefined,
      addedAt:  new Date().toISOString(),
    }
    const updated = [...manualEntries, entry]
    setManualEntries(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
    setHandle(""); setScore("100"); setBadge(""); setNote(""); setAddOpen(false)
  }

  function bumpManual(id: string, by: number) {
    const updated = manualEntries.map(e => e.id === id ? { ...e, score: Math.max(0, e.score + by) } : e)
    setManualEntries(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }

  function removeManual(id: string) {
    const updated = manualEntries.filter(e => e.id !== id)
    setManualEntries(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }

  // Determine current tab entries
  const getCurrentEntries = (): LeaderEntry[] => {
    if (category === "contributors") {
      return [...manualEntries.filter(e => e.category === "contributors")]
        .sort((a, b) => b.score - a.score)
    }
    const live = liveData?.[category as "raiders" | "creators" | "holders"] ?? []
    return live
  }

  const catEntries = getCurrentEntries()
  const cfg = CAT_CONFIG[category]

  const tabRow = (stopProp = false) => (
    <div style={{ display:"flex", gap:4 }}
      onClick={stopProp ? e => e.stopPropagation() : undefined}>
      {(Object.entries(CAT_CONFIG) as [LeaderCategory, typeof CAT_CONFIG[LeaderCategory]][]).map(([k, v]) => {
        const cnt = k === "contributors"
          ? manualEntries.filter(e => e.category === k).length
          : (liveData?.[k as "raiders"|"creators"|"holders"]?.length ?? 0)
        const active = category === k
        return (
          <button key={k}
            onClick={ev => { if (stopProp) ev.stopPropagation(); setCategory(k) }}
            style={{ flex:1, padding:"6px 2px", borderRadius:9, border:"none", cursor:"pointer",
              background: active ? `${v.color}15` : "#F4F4F5",
              outline: active ? `1.5px solid ${v.color}` : "none",
              display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <span style={{ fontSize:"0.875rem" }}>{v.emoji}</span>
            <span style={{ fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase",
              letterSpacing:"0.04em", color: active ? v.color : "#A1A1AA" }}>{cnt}</span>
          </button>
        )
      })}
    </div>
  )

  const liveIndicator = () => cfg.live && (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
      <Wifi style={{ width:10, height:10, color: loading ? "#A1A1AA" : "#10B981" }} />
      <span style={{ fontSize:"0.625rem", color:"var(--secondary)", fontWeight:500 }}>
        {loading ? "Refreshing…" : lastFetch ? `Live · ${new Date(lastFetch).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}` : "Live data"}
      </span>
      <button onClick={fetchLive} disabled={loading}
        style={{ marginLeft:"auto", background:"none", border:"none", cursor: loading ? "default" : "pointer",
          color: loading ? "#D1D5DB" : "#A1A1AA", padding:0 }}>
        <RefreshCw style={{ width:10, height:10, animation: loading ? "spin 1s linear infinite" : "none" }} />
      </button>
    </div>
  )

  const entryRow = (e: LeaderEntry, i: number, mini = false) => (
    <div key={e.id} style={{ display:"flex", alignItems:"center", gap: mini ? 8 : 10 }}>
      <span style={{ fontSize: mini ? "1.1rem" : "1.1rem", flexShrink:0, width:22, textAlign:"center" }}>
        {i < 3 ? RANK_EMOJI[i] : `${i+1}.`}
      </span>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--foreground)",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {e.address
            ? <a href={`https://solscan.io/account/${e.address}`} target="_blank" rel="noopener noreferrer"
                style={{ color:"var(--foreground)", textDecoration:"none" }}>{e.handle}</a>
            : e.handle}
        </p>
        {e.meta && (
          <span style={{ fontSize:"0.5625rem", color:"var(--secondary)", fontWeight:500 }}>{e.meta}</span>
        )}
        {!e.meta && e.badge && (
          <span style={{ fontSize:"0.5625rem", fontWeight:700, color: cfg.color,
            background:`${cfg.color}12`, padding:"1px 6px", borderRadius:99 }}>
            {e.badge}
          </span>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {category === "contributors" && (
          <button onClick={ev => { ev.stopPropagation(); bumpManual(e.id, 10) }}
            style={{ display:"flex", background:"rgba(245,166,35,0.1)", border:"none",
              borderRadius:6, padding:"3px 6px", cursor:"pointer", color:"#F5A623" }}>
            <ChevronUp style={{ width:12, height:12 }} />
          </button>
        )}
        <span style={{ fontSize:"0.875rem", fontWeight:800, color:"var(--foreground)",
          minWidth:32, textAlign:"right" }}>
          {fmtScore(e.score, e.category)}
        </span>
        {category === "contributors" && (
          <button onClick={ev => { ev.stopPropagation(); removeManual(e.id) }}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444" }}>
            <Trash2 style={{ width:12, height:12 }} />
          </button>
        )}
      </div>
    </div>
  )

  const addForm = (stopProp = false) => category === "contributors" && (
    <div onClick={stopProp ? e => e.stopPropagation() : undefined}>
      {!addOpen ? (
        <button onClick={ev => { if (stopProp) ev.stopPropagation(); setAddOpen(true) }}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px",
            borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
            cursor:"pointer", width:"100%", color:"var(--tertiary)", fontSize:"0.8125rem", fontWeight:600 }}>
          <Plus style={{ width:13, height:13 }} /> Add contributor
        </button>
      ) : (
        <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:7 }}>
          <div style={{ display:"flex", gap:6 }}>
            <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="@handle"
              style={{ flex:2, padding:"7px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <input value={score} onChange={e => setScore(e.target.value)} placeholder="Score"
              type="number" min="0"
              style={{ width:80, padding:"7px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          </div>
          <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="Badge (e.g. OG Raider)"
            style={{ padding:"7px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={addManual} disabled={!handle.trim()}
              style={{ flex:1, padding:"7px 0", borderRadius:8, border:"none",
                cursor: !handle.trim() ? "not-allowed" : "pointer",
                background: !handle.trim() ? "#E5E5EA" : "#F5A623",
                color: !handle.trim() ? "#A1A1AA" : "#000",
                fontSize:"0.8125rem", fontWeight:700 }}>Add</button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"7px 12px", borderRadius:8, border:"1.5px solid var(--separator)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"var(--tertiary)" }}>✕</button>
          </div>
        </div>
      )}
    </div>
  )

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {tabRow(true)}
      {liveIndicator()}
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}
        onClick={e => e.stopPropagation()}>
        {catEntries.length === 0 ? (
          <p style={{ fontSize:"0.8125rem", color:"var(--secondary)", textAlign:"center", fontStyle:"italic",
            padding:"8px 0" }}>
            {loading ? "Loading live data…" : "No data yet."}
          </p>
        ) : catEntries.slice(0, 5).map((e, i) => entryRow(e, i, true))}
      </div>
      {addForm(true)}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Tabs — wider */}
      <div style={{ display:"flex", gap:4 }}>
        {(Object.entries(CAT_CONFIG) as [LeaderCategory, typeof CAT_CONFIG[LeaderCategory]][]).map(([k, v]) => {
          const cnt = k === "contributors"
            ? manualEntries.filter(e => e.category === k).length
            : (liveData?.[k as "raiders"|"creators"|"holders"]?.length ?? 0)
          const active = category === k
          return (
            <button key={k} onClick={() => setCategory(k)}
              style={{ flex:1, padding:"8px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: active ? `${v.color}12` : "#F4F4F5",
                outline: active ? `1.5px solid ${v.color}` : "none",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <span style={{ fontSize:"1rem" }}>{v.emoji}</span>
              <span style={{ fontSize:"0.6875rem", fontWeight:700, color: active ? v.color : "#374151" }}>
                {v.label}
              </span>
              <span style={{ fontSize:"0.5625rem", color:"var(--secondary)" }}>{cnt}</span>
            </button>
          )
        })}
      </div>

      {liveIndicator()}

      {addForm(false)}

      {/* Full list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {catEntries.length === 0 ? (
          <p style={{ textAlign:"center", color:"var(--secondary)", fontSize:"0.875rem", padding:"20px 0" }}>
            {loading
              ? "Loading live data…"
              : category === "contributors"
                ? "No contributors yet. Add some above."
                : "No data yet."}
          </p>
        ) : catEntries.map((e, i) => (
          <div key={e.id} className="inset-cell"
            style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:"1.1rem", width:24, textAlign:"center", flexShrink:0 }}>
              {i < 3 ? RANK_EMOJI[i] : `${i+1}.`}
            </span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--foreground)" }}>
                {e.address
                  ? <a href={`https://solscan.io/account/${e.address}`} target="_blank" rel="noopener noreferrer"
                      style={{ color:"var(--foreground)", textDecoration:"none" }}>{e.handle}</a>
                  : e.handle}
              </p>
              {e.meta && (
                <span style={{ fontSize:"0.6875rem", color:"var(--secondary)" }}>{e.meta}</span>
              )}
              {!e.meta && e.badge && (
                <span style={{ fontSize:"0.625rem", fontWeight:700,
                  color: cfg.color, background:`${cfg.color}12`, padding:"1px 6px", borderRadius:99 }}>
                  {e.badge}
                </span>
              )}
              {e.note && <p style={{ fontSize:"0.75rem", color:"var(--secondary)", marginTop:2 }}>{e.note}</p>}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              {category === "contributors" && (
                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  <button onClick={() => bumpManual(e.id, 10)}
                    style={{ background:"rgba(245,166,35,0.12)", border:"none", borderRadius:6,
                      padding:"3px 8px", cursor:"pointer", fontSize:"0.625rem", fontWeight:700,
                      color:"#D97706" }}>+10</button>
                  <button onClick={() => bumpManual(e.id, -10)}
                    style={{ background:"#F4F4F5", border:"none", borderRadius:6,
                      padding:"3px 8px", cursor:"pointer", fontSize:"0.625rem", fontWeight:700,
                      color:"var(--secondary)" }}>-10</button>
                </div>
              )}
              <span style={{ fontSize:"1.125rem", fontWeight:900, color:"var(--foreground)",
                minWidth:40, textAlign:"right" }}>
                {fmtScore(e.score, e.category)}
              </span>
              {category === "contributors" && (
                <button onClick={() => removeManual(e.id)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444" }}>
                  <Trash2 style={{ width:13, height:13 }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Community Leaderboard"
      subtitle="Live Raiders · Creators · Holders"
      icon={<Trophy style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
