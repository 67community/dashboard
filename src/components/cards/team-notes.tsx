"use client"

import { useState, useEffect, useRef } from "react"
import { StickyNote, Plus, Trash2, Pin } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { addNotification } from "@/lib/notifications"

// ── Types ─────────────────────────────────────────────────────────────────────

type NoteColor = "yellow" | "blue" | "green" | "red" | "purple"

interface TeamNote {
  id:        string
  text:      string
  author:    string
  color:     NoteColor
  pinned:    boolean
  createdAt: string
}

const COLOR_CONFIG: Record<NoteColor, { bg: string; border: string; accent: string }> = {
  yellow: { bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.3)",  accent: "#D97706" },
  blue:   { bg: "rgba(37,99,235,0.07)",  border: "rgba(37,99,235,0.2)",   accent: "#2563EB" },
  green:  { bg: "rgba(5,150,105,0.07)",  border: "rgba(5,150,105,0.2)",   accent: "#059669" },
  red:    { bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.2)",   accent: "#EF4444" },
  purple: { bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.2)",  accent: "#7C3AED" },
}

const COLORS: NoteColor[] = ["yellow", "blue", "green", "red", "purple"]

const AUTHORS = ["Oscar", "WJP", "Brandon", "Jamie", "Gen", "Crispy", "Nick"]

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

// ── NoteCard ──────────────────────────────────────────────────────────────────

function NoteCard({ n, onPin, onDelete }: {
  n: TeamNote
  onPin: (id: string) => void
  onDelete: (id: string) => void
}) {
  const c = COLOR_CONFIG[n.color]
  return (
    <div style={{ background: c.bg, border:`1.5px solid ${c.border}`,
      borderRadius:12, padding:"12px 14px", position:"relative" }}>
      {n.pinned && (
        <span style={{ position:"absolute", top:8, right:8, fontSize:"0.75rem" }}>📌</span>
      )}
      <p style={{ fontSize:"0.875rem", color:"#374151", lineHeight:1.55,
        whiteSpace:"pre-wrap", marginBottom:8 }}>{n.text}</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:"0.6875rem", fontWeight:700, color: c.accent }}>{n.author}</span>
          <span style={{ fontSize:"0.6875rem", color:"#C7C7CC" }}>· {timeAgo(n.createdAt)}</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={e => { e.stopPropagation(); onPin(n.id) }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:2,
              opacity: n.pinned ? 1 : 0.4, color: c.accent }}>
            <Pin style={{ width:12, height:12 }} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(n.id) }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:2,
              color:"#A1A1AA" }}>
            <Trash2 style={{ width:12, height:12 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function TeamNotesCard() {
  const [notes,    setNotes]   = useState<TeamNote[]>([])
  const [addOpen,  setAddOpen] = useState(false)
  const [text,     setText]    = useState("")
  const [author,   setAuthor]  = useState("Oscar")
  const [color,    setColor]   = useState<NoteColor>("yellow")
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_team_notes")
      if (s) setNotes(JSON.parse(s))
    } catch {}
  }, [])

  function save(ns: TeamNote[]) {
    setNotes(ns)
    localStorage.setItem("67_team_notes", JSON.stringify(ns))
  }

  function addNote() {
    if (!text.trim()) return
    save([{
      id: Date.now().toString(), text: text.trim(), author, color,
      pinned: false, createdAt: new Date().toISOString(),
    }, ...notes])
    addNotification({
      type:      "info",
      category:  "note",
      message:   `📝 New note from ${author}: "${text.trim().slice(0, 60)}${text.trim().length > 60 ? "…" : ""}"`,
      timestamp: new Date().toISOString(),
    })
    setText(""); setAddOpen(false)
  }

  function togglePin(id: string) {
    save(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  function deleteNote(id: string) {
    save(notes.filter(n => n.id !== id))
  }

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const pinned    = sorted.filter(n => n.pinned)
  const unpinned  = sorted.filter(n => !n.pinned)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* Quick add */}
      <div onClick={e => e.stopPropagation()}>
        {!addOpen ? (
          <button onClick={() => { setAddOpen(true); setTimeout(() => textRef.current?.focus(), 50) }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
              borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
              cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
            <Plus style={{ width:14, height:14 }} /> Add note
          </button>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <textarea ref={textRef} value={text} onChange={e => setText(e.target.value)}
              placeholder="Write a note for the team…"
              rows={3}
              style={{ width:"100%", padding:"8px 10px", borderRadius:10,
                border:"1.5px solid rgba(0,0,0,0.1)", outline:"none",
                fontSize:"0.875rem", fontFamily:"inherit", background:"#FAFAFA",
                color:"#1D1D1F", resize:"none", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {/* Color picker */}
              <div style={{ display:"flex", gap:4 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    style={{ width:20, height:20, borderRadius:"50%", border:"none", cursor:"pointer",
                      background: COLOR_CONFIG[c].accent,
                      outline: color === c ? `2.5px solid ${COLOR_CONFIG[c].accent}` : "2px solid transparent",
                      outlineOffset:2, transition:"all 0.1s" }} />
                ))}
              </div>
              <select value={author} onChange={e => setAuthor(e.target.value)}
                style={{ flex:1, padding:"6px 8px", borderRadius:8,
                  border:"1.5px solid rgba(0,0,0,0.1)", outline:"none",
                  fontSize:"0.8125rem", fontFamily:"inherit", background:"#FFF" }}>
                {AUTHORS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <button onClick={addNote} disabled={!text.trim()}
                style={{ padding:"6px 14px", borderRadius:8, border:"none",
                  cursor: !text.trim() ? "not-allowed" : "pointer",
                  background: !text.trim() ? "#E5E5EA" : "#F5A623",
                  color: !text.trim() ? "#A1A1AA" : "#000",
                  fontSize:"0.8125rem", fontWeight:700 }}>Post</button>
              <button onClick={() => setAddOpen(false)}
                style={{ padding:"6px 10px", borderRadius:8,
                  border:"1.5px solid rgba(0,0,0,0.1)", background:"none",
                  cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>✕</button>
            </div>
          </div>
        )}
      </div>

      {/* Pinned + latest */}
      {sorted.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}
          onClick={e => e.stopPropagation()}>
          {sorted.slice(0, 2).map(n => (
            <NoteCard key={n.id} n={n} onPin={togglePin} onDelete={deleteNote} />
          ))}
        </div>
      )}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Add form */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Write a note for the team…" rows={3}
          style={{ width:"100%", padding:"10px 12px", borderRadius:10,
            border:"1.5px solid rgba(0,0,0,0.1)", outline:"none",
            fontSize:"0.875rem", fontFamily:"inherit", background:"#FAFAFA",
            color:"#1D1D1F", resize:"none", boxSizing:"border-box" }}
          onFocus={e => e.target.style.borderColor="#F5A623"}
          onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{ display:"flex", gap:4 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width:22, height:22, borderRadius:"50%", border:"none", cursor:"pointer",
                  background: COLOR_CONFIG[c].accent,
                  outline: color === c ? `2.5px solid ${COLOR_CONFIG[c].accent}` : "2px solid transparent",
                  outlineOffset:2, transition:"all 0.1s" }} />
            ))}
          </div>
          <select value={author} onChange={e => setAuthor(e.target.value)}
            style={{ flex:1, padding:"6px 8px", borderRadius:8,
              border:"1.5px solid rgba(0,0,0,0.1)", outline:"none",
              fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
            {AUTHORS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={addNote} disabled={!text.trim()}
            style={{ padding:"8px 18px", borderRadius:8, border:"none",
              cursor: !text.trim() ? "not-allowed" : "pointer",
              background: !text.trim() ? "#E5E5EA" : "#F5A623",
              color: !text.trim() ? "#A1A1AA" : "#000",
              fontSize:"0.875rem", fontWeight:700 }}>Post Note</button>
        </div>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
            textTransform:"uppercase", letterSpacing:"0.07em" }}>📌 Pinned</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {pinned.map(n => <NoteCard key={n.id} n={n} onPin={togglePin} onDelete={deleteNote} />)}
          </div>
        </>
      )}

      {/* All notes */}
      {unpinned.length > 0 && (
        <>
          {pinned.length > 0 && (
            <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
              textTransform:"uppercase", letterSpacing:"0.07em" }}>All Notes</p>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {unpinned.map(n => <NoteCard key={n.id} n={n} onPin={togglePin} onDelete={deleteNote} />)}
          </div>
        </>
      )}

      {notes.length === 0 && (
        <p style={{ textAlign:"center", color:"#A1A1AA", fontSize:"0.875rem", padding:"20px 0" }}>
          No notes yet. Write something for the team.
        </p>
      )}
    </div>
  )

  return (
    <DashboardCard compact
      title="Team Notes"
      noAutoOpen
      subtitle="Pin · Share · Remember"
      icon={<StickyNote style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
