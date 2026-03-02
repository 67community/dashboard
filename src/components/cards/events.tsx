"use client"

import { useState, useEffect } from "react"
import { CalendarDays, Plus, Trash2, Clock } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType   = "game-night" | "ama" | "spaces" | "raid" | "announcement" | "other"
type EventStatus = "upcoming" | "live" | "done" | "cancelled"

interface CommunityEvent {
  id:          string
  title:       string
  type:        EventType
  date:        string   // ISO
  time?:       string   // "18:00"
  platform?:   string
  description?: string
  status:      EventStatus
  createdAt:   string
}

const TYPE_CONFIG: Record<EventType, { emoji: string; label: string; color: string }> = {
  "game-night":   { emoji: "🎮", label: "Game Night",   color: "#7C3AED" },
  "ama":          { emoji: "🎙️", label: "AMA",          color: "#2563EB" },
  "spaces":       { emoji: "🔊", label: "Twitter Space",color: "#1D9BF0" },
  "raid":         { emoji: "⚔️", label: "Raid Night",   color: "#EF4444" },
  "announcement": { emoji: "📢", label: "Announcement", color: "#F5A623" },
  "other":        { emoji: "⭐", label: "Other",        color: "#059669" },
}

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; bg: string }> = {
  upcoming:  { label: "Upcoming", color: "#2563EB", bg: "rgba(37,99,235,0.08)"  },
  live:      { label: "🔴 LIVE",  color: "#EF4444", bg: "rgba(239,68,68,0.1)"  },
  done:      { label: "Done ✓",   color: "#059669", bg: "rgba(5,150,105,0.08)" },
  cancelled: { label: "Cancelled",color: "var(--secondary)", bg: "#F4F4F5"               },
}

function formatEventDate(iso: string, time?: string) {
  const d = new Date(iso)
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const eDay = new Date(iso); eDay.setHours(0,0,0,0)

  let dayStr = ""
  if (eDay.getTime() === today.getTime())     dayStr = "Today"
  else if (eDay.getTime() === tomorrow.getTime()) dayStr = "Tomorrow"
  else dayStr = d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })

  return time ? `${dayStr} · ${time}` : dayStr
}

function daysUntil(iso: string) {
  const diff = new Date(iso).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0)  return null
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  return `In ${days}d`
}

// ── EventRow ──────────────────────────────────────────────────────────────────

function EventRow({ e, onStatus, onDelete }: {
  e: CommunityEvent
  onStatus: (id: string, s: EventStatus) => void
  onDelete: (id: string) => void
}) {
  const tc = TYPE_CONFIG[e.type]
  const sc = STATUS_CONFIG[e.status]
  const until = daysUntil(e.date)

  return (
    <div className="inset-cell" style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        {/* Date block */}
        <div style={{ background: `${tc.color}12`, borderRadius:10, padding:"8px 10px",
          textAlign:"center", flexShrink:0, minWidth:48 }}>
          <p style={{ fontSize:"1.25rem", fontWeight:900, color: tc.color, lineHeight:1 }}>
            {new Date(e.date).getDate()}
          </p>
          <p style={{ fontSize:"0.5625rem", fontWeight:700, color: tc.color, opacity:0.7,
            textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {new Date(e.date).toLocaleDateString("en-US", { month:"short" })}
          </p>
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <span style={{ fontSize:"1rem" }}>{tc.emoji}</span>
            <span style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--foreground)",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.title}</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:"0.6875rem", color:"var(--tertiary)", display:"flex",
              alignItems:"center", gap:3 }}>
              <Clock style={{ width:10, height:10 }} />
              {formatEventDate(e.date, e.time)}
            </span>
            {e.platform && <span style={{ fontSize:"0.6875rem", color:"var(--tertiary)" }}>· {e.platform}</span>}
          </div>
        </div>

        {/* Status + countdown */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
          <span style={{ fontSize:"0.625rem", fontWeight:700, color: sc.color,
            background: sc.bg, padding:"2px 8px", borderRadius:99 }}>{sc.label}</span>
          {until && e.status === "upcoming" && (
            <span style={{ fontSize:"0.5625rem", fontWeight:700, color: tc.color,
              background:`${tc.color}10`, padding:"1px 6px", borderRadius:99 }}>{until}</span>
          )}
        </div>
      </div>

      {e.description && (
        <p style={{ fontSize:"0.8125rem", color:"var(--foreground)", paddingLeft:58 }}>{e.description}</p>
      )}

      {/* Actions */}
      <div style={{ display:"flex", gap:4, paddingLeft:58, flexWrap:"wrap" }}>
        {e.status === "upcoming" && (
          <button onClick={ev => { ev.stopPropagation(); onStatus(e.id, "live") }}
            style={{ padding:"4px 10px", borderRadius:8, border:"none", cursor:"pointer",
              background:"#EF4444", color:"#fff", fontSize:"0.6875rem", fontWeight:700 }}>
            🔴 Go Live
          </button>
        )}
        {e.status === "live" && (
          <button onClick={ev => { ev.stopPropagation(); onStatus(e.id, "done") }}
            style={{ padding:"4px 10px", borderRadius:8, border:"none", cursor:"pointer",
              background:"#059669", color:"#fff", fontSize:"0.6875rem", fontWeight:700 }}>
            ✓ End Event
          </button>
        )}
        {e.status !== "done" && e.status !== "cancelled" && (
          <button onClick={ev => { ev.stopPropagation(); onStatus(e.id, "cancelled") }}
            style={{ padding:"4px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
              background:"none", cursor:"pointer", fontSize:"0.6875rem", color:"var(--tertiary)" }}>
            Cancel
          </button>
        )}
        <button onClick={ev => { ev.stopPropagation(); onDelete(e.id) }}
          style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer",
            color:"#EF4444", display:"flex", alignItems:"center" }}>
          <Trash2 style={{ width:13, height:13 }} />
        </button>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function CommunityEventsCard() {
  const [events,  setEvents]  = useState<CommunityEvent[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [title,   setTitle]   = useState("")
  const [type,    setType]    = useState<EventType>("game-night")
  const [date,    setDate]    = useState("")
  const [time,    setTime]    = useState("")
  const [plat,    setPlat]    = useState("")
  const [desc,    setDesc]    = useState("")

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_events")
      if (s) setEvents(JSON.parse(s))
    } catch {}
  }, [])

  function save(evs: CommunityEvent[]) {
    setEvents(evs)
    localStorage.setItem("67_events", JSON.stringify(evs))
  }

  function addEvent() {
    if (!title.trim() || !date) return
    save([{
      id: Date.now().toString(), title: title.trim(), type, date,
      time: time || undefined, platform: plat || undefined,
      description: desc || undefined, status: "upcoming",
      createdAt: new Date().toISOString(),
    }, ...events])
    setTitle(""); setDate(""); setTime(""); setPlat(""); setDesc(""); setAddOpen(false)
  }

  function updateStatus(id: string, status: EventStatus) {
    save(events.map(e => e.id === id ? { ...e, status } : e))
  }
  function deleteEvent(id: string) { save(events.filter(e => e.id !== id)) }

  const upcoming = events.filter(e => e.status === "upcoming" || e.status === "live")
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const live     = events.filter(e => e.status === "live")
  const past     = events.filter(e => e.status === "done" || e.status === "cancelled")

  const todayIso = new Date().toISOString().slice(0,10)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Stats */}
      <div style={{ display:"flex", gap:8 }}>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color: live.length > 0 ? "#EF4444" : "#F5A623", lineHeight:1 }}>
            {live.length > 0 ? live.length : upcoming.length}
          </p>
          <p style={{ fontSize:"0.625rem", color:"var(--tertiary)", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>
            {live.length > 0 ? "LIVE 🔴" : "Upcoming"}
          </p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#059669", lineHeight:1 }}>{past.length}</p>
          <p style={{ fontSize:"0.625rem", color:"var(--tertiary)", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Done</p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"var(--foreground)", lineHeight:1 }}>{events.length}</p>
          <p style={{ fontSize:"0.625rem", color:"var(--tertiary)", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Total</p>
        </div>
      </div>

      {/* Quick add */}
      <div onClick={e => e.stopPropagation()}>
        {!addOpen ? (
          <button onClick={() => setAddOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
              borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
              cursor:"pointer", width:"100%", color:"var(--tertiary)", fontSize:"0.875rem", fontWeight:600 }}>
            <Plus style={{ width:14, height:14 }} /> Schedule event
          </button>
        ) : (
          <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
            display:"flex", flexDirection:"column", gap:8 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event name"
              style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <div style={{ display:"flex", gap:6 }}>
              <select value={type} onChange={e => setType(e.target.value as EventType)}
                style={{ flex:1, padding:"8px 10px", borderRadius:8,
                  border:"1.5px solid var(--separator)", outline:"none",
                  fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
                {Object.entries(TYPE_CONFIG).map(([k,v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={todayIso}
                style={{ flex:1, padding:"8px 10px", borderRadius:8,
                  border:"1.5px solid var(--separator)", outline:"none",
                  fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
                onFocus={e => e.target.style.borderColor="#F5A623"}
                onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ width:90, padding:"8px 10px", borderRadius:8,
                  border:"1.5px solid var(--separator)", outline:"none",
                  fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
                onFocus={e => e.target.style.borderColor="#F5A623"}
                onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={addEvent} disabled={!title.trim() || !date}
                style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                  cursor: !title.trim() || !date ? "not-allowed" : "pointer",
                  background: !title.trim() || !date ? "#E5E5EA" : "#F5A623",
                  color: !title.trim() || !date ? "#A1A1AA" : "#000",
                  fontSize:"0.8125rem", fontWeight:700 }}>
                Schedule 📅
              </button>
              <button onClick={() => setAddOpen(false)}
                style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid var(--separator)",
                  background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"var(--tertiary)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming events preview */}
      {upcoming.length > 0 && (
        <div style={{ borderTop:"1px solid var(--separator)", paddingTop:12 }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {upcoming.slice(0,3).map(e => (
              <EventRow key={e.id} e={e} onStatus={updateStatus} onDelete={deleteEvent} />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p style={{ fontSize:"0.8125rem", color:"var(--secondary)", textAlign:"center", fontStyle:"italic" }}>
          No events scheduled. Add the first one.
        </p>
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
            cursor:"pointer", width:"100%", color:"var(--tertiary)", fontSize:"0.875rem", fontWeight:600 }}>
          <Plus style={{ width:14, height:14 }} /> Schedule event
        </button>
      ) : (
        <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { v: title, set: setTitle, ph: "Event name", t: "text"  },
            { v: plat,  set: setPlat,  ph: "Platform (Discord, X, etc.)", t: "text" },
            { v: desc,  set: setDesc,  ph: "Description (optional)", t: "text" },
          ].map(({ v, set, ph, t }) => (
            <input key={ph} value={v} onChange={e => set(e.target.value)} placeholder={ph} type={t}
              style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          ))}
          <div style={{ display:"flex", gap:6 }}>
            <select value={type} onChange={e => setType(e.target.value as EventType)}
              style={{ flex:1, padding:"8px 10px", borderRadius:8,
                border:"1.5px solid var(--separator)", outline:"none",
                fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}>
              {Object.entries(TYPE_CONFIG).map(([k,v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={todayIso}
              style={{ flex:1, padding:"8px 10px", borderRadius:8,
                border:"1.5px solid var(--separator)", outline:"none",
                fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ width:90, padding:"8px 10px", borderRadius:8,
                border:"1.5px solid var(--separator)", outline:"none",
                fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={addEvent} disabled={!title.trim() || !date}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                cursor: !title.trim() || !date ? "not-allowed" : "pointer",
                background: !title.trim() || !date ? "#E5E5EA" : "#F5A623",
                color: !title.trim() || !date ? "#A1A1AA" : "#000",
                fontSize:"0.8125rem", fontWeight:700 }}>Schedule 📅</button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid var(--separator)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"var(--tertiary)" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--tertiary)",
            textTransform:"uppercase", letterSpacing:"0.07em" }}>Upcoming ({upcoming.length})</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {upcoming.map(e => <EventRow key={e.id} e={e} onStatus={updateStatus} onDelete={deleteEvent} />)}
          </div>
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--tertiary)",
            textTransform:"uppercase", letterSpacing:"0.07em", marginTop:8 }}>Past ({past.length})</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {past.slice(0,5).map(e => <EventRow key={e.id} e={e} onStatus={updateStatus} onDelete={deleteEvent} />)}
          </div>
        </>
      )}

      {events.length === 0 && (
        <p style={{ textAlign:"center", color:"var(--secondary)", fontSize:"0.875rem", padding:"20px 0" }}>
          No events yet. Schedule the first one above.
        </p>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Community Events"
      subtitle="Game Nights · AMAs · Raids · Spaces"
      icon={<CalendarDays style={{ width:16, height:16 }} />}
      accentColor="#7C3AED"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
