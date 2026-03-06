"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"

type EventKind = "game-night" | "ama" | "spaces" | "raid" | "announcement" | "other" | "tweet" | "thread" | "meme" | "tiktok" | "reel"

interface CalEvent {
  id: string
  title: string
  kind: EventKind
  date: string   // YYYY-MM-DD
  time?: string
  platform?: string
}

const KIND: Record<EventKind, { emoji: string; color: string; bg: string }> = {
  "game-night":   { emoji: "🎮", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" },
  "ama":          { emoji: "🎙️", color: "#60A5FA", bg: "rgba(96,165,250,0.15)"  },
  "spaces":       { emoji: "🔊", color: "#38BDF8", bg: "rgba(56,189,248,0.15)"  },
  "raid":         { emoji: "⚔️", color: "#F87171", bg: "rgba(248,113,113,0.15)" },
  "announcement": { emoji: "📢", color: "#F5A623", bg: "rgba(245,166,35,0.15)"  },
  "other":        { emoji: "⭐", color: "#34D399", bg: "rgba(52,211,153,0.15)"  },
  "tweet":        { emoji: "🐦", color: "#1D9BF0", bg: "rgba(29,155,240,0.15)"  },
  "thread":       { emoji: "📝", color: "#10B981", bg: "rgba(16,185,129,0.15)"  },
  "meme":         { emoji: "🎭", color: "#F59E0B", bg: "rgba(245,158,11,0.15)"  },
  "tiktok":       { emoji: "🎵", color: "#EE1D52", bg: "rgba(238,29,82,0.15)"   },
  "reel":         { emoji: "🎬", color: "#C026D3", bg: "rgba(192,38,211,0.15)"  },
}

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function useEvents() {
  const KEY = "67_calendar_events"
  const load = (): CalEvent[] => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] }
  }
  const [events, setEvents] = useState<CalEvent[]>(load)
  const save = (evs: CalEvent[]) => { setEvents(evs); localStorage.setItem(KEY, JSON.stringify(evs)) }
  return { events, save }
}

export default function CalendarPage() {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:"", kind:"game-night" as EventKind, time:"", platform:"" })
  const { events, save } = useEvents()

  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i+1)]
  while (cells.length % 7 !== 0) cells.push(null)

  function dateStr(d: number) {
    return `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
  }

  function addEvent() {
    if (!form.title.trim() || !selected) return
    const ev: CalEvent = {
      id: Date.now().toString(),
      title: form.title.trim(),
      kind: form.kind,
      date: selected,
      time: form.time || undefined,
      platform: form.platform || undefined,
    }
    save([...events, ev])
    setForm({ title:"", kind:"game-night", time:"", platform:"" })
    setShowForm(false)
  }

  function deleteEvent(id: string) {
    save(events.filter(e => e.id !== id))
  }

  const selectedEvents = selected ? events.filter(e => e.date === selected) : []

  return (
    <div style={{ minHeight:"100vh", background:"var(--background)" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={prevMonth} style={{ width:32, height:32, borderRadius:8, background:"var(--fill-primary)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ChevronLeft style={{ width:16, height:16, color:"var(--foreground)" }} />
            </button>
            <h2 style={{ fontSize:"1.25rem", fontWeight:800, color:"var(--foreground)", margin:0, letterSpacing:"-0.03em" }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} style={{ width:32, height:32, borderRadius:8, background:"var(--fill-primary)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ChevronRight style={{ width:16, height:16, color:"var(--foreground)" }} />
            </button>
          </div>
          <button onClick={() => { setSelected(today); setShowForm(true) }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, background:"#F5A623", border:"none", cursor:"pointer", color:"#000", fontWeight:700, fontSize:"0.875rem" }}>
            <Plus style={{ width:14, height:14 }} /> Add Event
          </button>
        </div>

        <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
          {/* Calendar grid */}
          <div style={{ flex:1, background:"var(--card)", borderRadius:18, border:"1px solid var(--separator)", overflow:"hidden" }}>
            {/* Day headers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1px solid var(--separator)" }}>
              {DAYS.map(d => (
                <div key={d} style={{ padding:"10px 0", textAlign:"center", fontSize:"0.6875rem", fontWeight:700, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} style={{ minHeight:90, borderRight: (i+1)%7===0 ? "none" : "1px solid var(--separator)", borderBottom:"1px solid var(--separator)", background:"var(--fill-secondary)" }} />
                const ds = dateStr(day)
                const dayEvents = events.filter(e => e.date === ds)
                const isToday = ds === today
                const isSel = ds === selected
                return (
                  <div key={i} onClick={() => { setSelected(ds); setShowForm(false) }}
                    style={{
                      minHeight:90, padding:"8px 6px",
                      borderRight: (i+1)%7===0 ? "none" : "1px solid var(--separator)",
                      borderBottom:"1px solid var(--separator)",
                      background: isSel ? "rgba(245,166,35,0.08)" : "transparent",
                      cursor:"pointer", transition:"background 0.15s",
                      outline: isSel ? "2px solid rgba(245,166,35,0.4)" : "none",
                      outlineOffset: -2,
                    }}
                    onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "var(--fill-primary)" }}
                    onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                  >
                    <div style={{
                      width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                      background: isToday ? "#F5A623" : "transparent",
                      fontSize:"0.75rem", fontWeight: isToday ? 800 : 500,
                      color: isToday ? "#000" : "var(--foreground)", marginBottom:4,
                    }}>{day}</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                      {dayEvents.slice(0,3).map(ev => (
                        <div key={ev.id} style={{
                          fontSize:"0.5625rem", fontWeight:600,
                          background: KIND[ev.kind].bg, color: KIND[ev.kind].color,
                          borderRadius:4, padding:"2px 5px",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        }}>
                          {KIND[ev.kind].emoji} {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <div style={{ fontSize:"0.5rem", color:"var(--tertiary)" }}>+{dayEvents.length-3} more</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Side panel */}
          <div style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
            {selected && (
              <div style={{ background:"var(--card)", borderRadius:14, border:"1px solid var(--separator)", padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", margin:0 }}>
                    {new Date(selected+"T12:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
                  </p>
                  <button onClick={() => setShowForm(f => !f)}
                    style={{ width:26, height:26, borderRadius:7, background:"#F5A623", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Plus style={{ width:13, height:13, color:"#000" }} />
                  </button>
                </div>

                {showForm && (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12, padding:"10px 12px", background:"var(--fill-primary)", borderRadius:10 }}>
                    <input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))}
                      placeholder="Event title" style={{ borderRadius:8, border:"1px solid var(--separator)", padding:"7px 10px", fontSize:"0.8125rem", fontFamily:"inherit" }} />
                    <select value={form.kind} onChange={e => setForm(f => ({...f, kind:e.target.value as EventKind}))}
                      style={{ borderRadius:8, border:"1px solid var(--separator)", padding:"7px 10px", fontSize:"0.8125rem", fontFamily:"inherit" }}>
                      {Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v.emoji} {k.replace("-"," ")}</option>)}
                    </select>
                    <input value={form.time} onChange={e => setForm(f => ({...f, time:e.target.value}))}
                      placeholder="Time (e.g. 18:00)" style={{ borderRadius:8, border:"1px solid var(--separator)", padding:"7px 10px", fontSize:"0.8125rem", fontFamily:"inherit" }} />
                    <input value={form.platform} onChange={e => setForm(f => ({...f, platform:e.target.value}))}
                      placeholder="Platform (Discord, Twitter…)" style={{ borderRadius:8, border:"1px solid var(--separator)", padding:"7px 10px", fontSize:"0.8125rem", fontFamily:"inherit" }} />
                    <button onClick={addEvent}
                      style={{ padding:"8px 0", borderRadius:8, background:"#F5A623", border:"none", cursor:"pointer", color:"#000", fontWeight:700, fontSize:"0.8125rem" }}>
                      Save
                    </button>
                  </div>
                )}

                {selectedEvents.length === 0 && !showForm && (
                  <p style={{ fontSize:"0.75rem", color:"var(--tertiary)", textAlign:"center", padding:"12px 0" }}>No events — click + to add</p>
                )}

                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {selectedEvents.map(ev => (
                    <div key={ev.id} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"8px 10px", background:KIND[ev.kind].bg, borderRadius:10, border:`1px solid ${KIND[ev.kind].color}30` }}>
                      <span style={{ fontSize:"1rem", flexShrink:0 }}>{KIND[ev.kind].emoji}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:"0.8125rem", fontWeight:700, color: KIND[ev.kind].color, margin:0 }}>{ev.title}</p>
                        {ev.time && <p style={{ fontSize:"0.6875rem", color:"var(--secondary)", margin:"2px 0 0" }}>🕐 {ev.time}</p>}
                        {ev.platform && <p style={{ fontSize:"0.6875rem", color:"var(--secondary)", margin:"2px 0 0" }}>📍 {ev.platform}</p>}
                      </div>
                      <button onClick={() => deleteEvent(ev.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:2, flexShrink:0 }}>
                        <Trash2 style={{ width:13, height:13, color:"var(--tertiary)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming events */}
            <div style={{ background:"var(--card)", borderRadius:14, border:"1px solid var(--separator)", padding:16 }}>
              <p style={{ fontSize:"0.6875rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Upcoming</p>
              {events
                .filter(e => e.date >= today)
                .sort((a,b) => a.date.localeCompare(b.date))
                .slice(0,6)
                .map(ev => (
                  <div key={ev.id} onClick={() => setSelected(ev.date)} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"1px solid var(--separator)", cursor:"pointer" }}>
                    <span style={{ fontSize:"0.875rem" }}>{KIND[ev.kind].emoji}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.title}</p>
                      <p style={{ fontSize:"0.625rem", color:"var(--tertiary)", margin:0 }}>
                        {new Date(ev.date+"T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" })}
                        {ev.time ? ` · ${ev.time}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              {events.filter(e => e.date >= today).length === 0 && (
                <p style={{ fontSize:"0.75rem", color:"var(--tertiary)", textAlign:"center", padding:"8px 0" }}>No upcoming events</p>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
