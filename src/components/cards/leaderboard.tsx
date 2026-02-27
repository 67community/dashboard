"use client"

import { useState, useEffect } from "react"
import { Trophy, Plus, Trash2, ChevronUp } from "lucide-react"
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
  addedAt:  string
}

const CAT_CONFIG: Record<LeaderCategory, { label: string; emoji: string; color: string }> = {
  raiders:      { label: "Raiders",      emoji: "⚔️", color: "#EF4444" },
  contributors: { label: "Contributors", emoji: "🌟", color: "#F5A623" },
  creators:     { label: "Creators",     emoji: "🎥", color: "#7C3AED" },
  holders:      { label: "Holders",      emoji: "💎", color: "#059669" },
}

const RANK_EMOJI = ["🥇", "🥈", "🥉"]

const DEFAULT_ENTRIES: LeaderEntry[] = [
  { id:"3", handle:"@abrahamcreates",   score:870,  category:"creators",     badge:"Viral Creator", addedAt:"2026-01-01T00:00:00Z" },
]

export function CommunityLeaderboardCard() {
  const [entries,  setEntries]  = useState<LeaderEntry[]>(DEFAULT_ENTRIES)
  const [category, setCategory] = useState<LeaderCategory>("raiders")
  const [addOpen,  setAddOpen]  = useState(false)
  const [handle,   setHandle]   = useState("")
  const [score,    setScore]    = useState("100")
  const [badge,    setBadge]    = useState("")
  const [note,     setNote]     = useState("")

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_leaderboard")
      if (s) setEntries(JSON.parse(s))
      else   localStorage.setItem("67_leaderboard", JSON.stringify(DEFAULT_ENTRIES))
    } catch {}
  }, [])

  function save(es: LeaderEntry[]) {
    setEntries(es)
    localStorage.setItem("67_leaderboard", JSON.stringify(es))
  }

  function add() {
    if (!handle.trim()) return
    save([...entries, {
      id: Date.now().toString(), handle: handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`,
      score: parseInt(score) || 100, category,
      badge: badge.trim() || undefined, note: note.trim() || undefined,
      addedAt: new Date().toISOString(),
    }])
    setHandle(""); setScore("100"); setBadge(""); setNote(""); setAddOpen(false)
  }

  function bump(id: string, by: number) {
    save(entries.map(e => e.id === id ? { ...e, score: Math.max(0, e.score + by) } : e))
  }

  const catEntries = [...entries.filter(e => e.category === category)]
    .sort((a,b) => b.score - a.score)
  const allTop     = [...entries].sort((a,b) => b.score - a.score).slice(0, 3)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Category tabs */}
      <div style={{ display:"flex", gap:4 }} onClick={e => e.stopPropagation()}>
        {(Object.entries(CAT_CONFIG) as [LeaderCategory, typeof CAT_CONFIG[LeaderCategory]][]).map(([k,v]) => {
          const cnt = entries.filter(e => e.category === k).length
          const active = category === k
          return (
            <button key={k} onClick={ev => { ev.stopPropagation(); setCategory(k) }}
              style={{ flex:1, padding:"6px 2px", borderRadius:9, border:"none", cursor:"pointer",
                background: active ? `${v.color}15` : "#F4F4F5",
                outline: active ? `1.5px solid ${v.color}` : "none",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                transition:"all 0.12s" }}>
              <span style={{ fontSize:"0.875rem" }}>{v.emoji}</span>
              <span style={{ fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.04em", color: active ? v.color : "#A1A1AA" }}>{cnt}</span>
            </button>
          )
        })}
      </div>

      {/* Top 3 in category */}
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}
        onClick={e => e.stopPropagation()}>
        {catEntries.length === 0 ? (
          <p style={{ fontSize:"0.8125rem", color:"#A1A1AA", textAlign:"center", fontStyle:"italic" }}>
            No entries yet.
          </p>
        ) : catEntries.slice(0,5).map((e,i) => (
          <div key={e.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"1.1rem", flexShrink:0, width:22, textAlign:"center" }}>
              {i < 3 ? RANK_EMOJI[i] : `${i+1}.`}
            </span>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.handle}</p>
              {e.badge && (
                <span style={{ fontSize:"0.5625rem", fontWeight:700, color: CAT_CONFIG[e.category].color,
                  background:`${CAT_CONFIG[e.category].color}12`, padding:"1px 6px", borderRadius:99 }}>
                  {e.badge}
                </span>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <button onClick={ev => { ev.stopPropagation(); bump(e.id, 10) }}
                style={{ display:"flex", background:"rgba(245,166,35,0.1)", border:"none",
                  borderRadius:6, padding:"3px 6px", cursor:"pointer", color:"#F5A623" }}>
                <ChevronUp style={{ width:12, height:12 }} />
              </button>
              <span style={{ fontSize:"0.875rem", fontWeight:800, color:"#1D1D1F",
                minWidth:32, textAlign:"right" }}>{e.score.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add */}
      <div onClick={e => e.stopPropagation()}>
        {!addOpen ? (
          <button onClick={() => setAddOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px",
              borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
              cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.8125rem", fontWeight:600 }}>
            <Plus style={{ width:13, height:13 }} /> Add member
          </button>
        ) : (
          <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
            display:"flex", flexDirection:"column", gap:7 }}>
            <div style={{ display:"flex", gap:6 }}>
              <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="@handle"
                style={{ flex:2, padding:"7px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                  outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
                onFocus={e => e.target.style.borderColor="#F5A623"}
                onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
              <input value={score} onChange={e => setScore(e.target.value)} placeholder="Score"
                type="number" min="0"
                style={{ width:80, padding:"7px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                  outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
                onFocus={e => e.target.style.borderColor="#F5A623"}
                onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            </div>
            <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="Badge (e.g. OG Raider)"
              style={{ padding:"7px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={add} disabled={!handle.trim()}
                style={{ flex:1, padding:"7px 0", borderRadius:8, border:"none",
                  cursor: !handle.trim() ? "not-allowed" : "pointer",
                  background: !handle.trim() ? "#E5E5EA" : "#F5A623",
                  color: !handle.trim() ? "#A1A1AA" : "#000",
                  fontSize:"0.8125rem", fontWeight:700 }}>Add</button>
              <button onClick={() => setAddOpen(false)}
                style={{ padding:"7px 12px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                  background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Category tabs */}
      <div style={{ display:"flex", gap:4 }}>
        {(Object.entries(CAT_CONFIG) as [LeaderCategory, typeof CAT_CONFIG[LeaderCategory]][]).map(([k,v]) => {
          const cnt = entries.filter(e => e.category === k).length
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
              <span style={{ fontSize:"0.5625rem", color:"#A1A1AA" }}>{cnt}</span>
            </button>
          )
        })}
      </div>

      {/* Add form */}
      <button onClick={() => setAddOpen(v => !v)}
        style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
          borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
          cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
        <Plus style={{ width:14, height:14 }} /> Add to {CAT_CONFIG[category].label}
      </button>

      {addOpen && (
        <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", gap:6 }}>
            <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="@handle"
              style={{ flex:2, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <input value={score} onChange={e => setScore(e.target.value)} placeholder="Score" type="number"
              style={{ width:90, padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          </div>
          <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="Badge"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={add} disabled={!handle.trim()}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                cursor: !handle.trim() ? "not-allowed" : "pointer",
                background: !handle.trim() ? "#E5E5EA" : "#F5A623",
                color: !handle.trim() ? "#A1A1AA" : "#000", fontSize:"0.8125rem", fontWeight:700 }}>Add</button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Full list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {catEntries.length === 0 ? (
          <p style={{ textAlign:"center", color:"#A1A1AA", fontSize:"0.875rem", padding:"20px 0" }}>
            No {CAT_CONFIG[category].label.toLowerCase()} yet.
          </p>
        ) : catEntries.map((e,i) => (
          <div key={e.id} className="inset-cell"
            style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:"1.1rem", width:24, textAlign:"center", flexShrink:0 }}>
              {i < 3 ? RANK_EMOJI[i] : `${i+1}.`}
            </span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F" }}>{e.handle}</p>
              {e.badge && (
                <span style={{ fontSize:"0.625rem", fontWeight:700,
                  color: CAT_CONFIG[e.category].color,
                  background:`${CAT_CONFIG[e.category].color}12`, padding:"1px 6px", borderRadius:99 }}>
                  {e.badge}
                </span>
              )}
              {e.note && <p style={{ fontSize:"0.75rem", color:"#A1A1AA", marginTop:2 }}>{e.note}</p>}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <button onClick={() => bump(e.id, 10)}
                  style={{ background:"rgba(245,166,35,0.12)", border:"none", borderRadius:6,
                    padding:"3px 8px", cursor:"pointer", fontSize:"0.625rem", fontWeight:700,
                    color:"#D97706" }}>+10</button>
                <button onClick={() => bump(e.id, -10)}
                  style={{ background:"#F4F4F5", border:"none", borderRadius:6,
                    padding:"3px 8px", cursor:"pointer", fontSize:"0.625rem", fontWeight:700,
                    color:"#A1A1AA" }}>-10</button>
              </div>
              <span style={{ fontSize:"1.125rem", fontWeight:900, color:"#1D1D1F",
                minWidth:40, textAlign:"right" }}>{e.score.toLocaleString()}</span>
              <button onClick={() => save(entries.filter(x => x.id !== e.id))}
                style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444" }}>
                <Trash2 style={{ width:13, height:13 }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Community Leaderboard"
      subtitle="Raiders · Creators · Contributors"
      icon={<Trophy style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
