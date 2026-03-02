"use client"

import { useEffect, useRef, useState } from "react"
import { Calendar, CheckCircle2, Clock, Pencil, Plus, X } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

// ── Types ─────────────────────────────────────────────────────────────────────

interface DayRow  { day: string; slots: string[] }
interface MixRow  { label: string; pct: number; color: string }

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_SCHEDULE: DayRow[] = [
  { day: "Mon", slots: ["GM tweet", "Thread"] },
  { day: "Tue", slots: ["Meme", "Price update"] },
  { day: "Wed", slots: ["Community spotlight"] },
  { day: "Thu", slots: ["Thread", "TikTok hook"] },
  { day: "Fri", slots: ["Weekly recap", "Hype post"] },
  { day: "Sat", slots: ["Meme", "Reel"] },
  { day: "Sun", slots: ["GM tweet"] },
]

const DEFAULT_MIX: MixRow[] = [
  { label: "Hype & price action", pct: 40, color: "#F5A623" },
  { label: "Community moments",   pct: 30, color: "#5865F2" },
  { label: "Education / Threads", pct: 20, color: "#10B981" },
  { label: "Memes",               pct: 10, color: "#1D9BF0" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* noop */ }
}

// ── Inline input for adding a slot ────────────────────────────────────────────

function AddSlotInput({ onAdd }: { onAdd: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [val,  setVal]  = useState("")
  const ref = useRef<HTMLInputElement>(null)

  function commit() {
    const trimmed = val.trim()
    if (trimmed) onAdd(trimmed)
    setVal("")
    setOpen(false)
  }

  if (!open) return (
    <button
      onClick={e => { e.stopPropagation(); setOpen(true); setTimeout(() => ref.current?.focus(), 30) }}
      style={{
        display: "flex", alignItems: "center", gap: 3,
        fontSize: "0.6875rem", fontWeight: 600, color: "#F5A623",
        background: "rgba(245,166,35,0.08)", border: "1.5px dashed rgba(245,166,35,0.35)",
        borderRadius: 99, padding: "3px 9px", cursor: "pointer",
        transition: "all 0.12s",
      }}
    >
      <Plus style={{ width: 10, height: 10 }} />Add
    </button>
  )

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") { setVal(""); setOpen(false) }
        }}
        placeholder="Type & Enter"
        style={{
          width: 100, padding: "3px 8px", borderRadius: 7,
          border: "1.5px solid rgba(245,166,35,0.5)",
          fontSize: "0.75rem", outline: "none", background: "var(--card)",
        }}
      />
      <button onClick={commit} style={{ background: "#F5A623", border: "none", borderRadius: 6, cursor: "pointer", padding: "4px 7px" }}>
        <CheckCircle2 style={{ width: 11, height: 11, color: "#fff" }} />
      </button>
    </div>
  )
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export function ContentPipelineCard() {
  const { data } = useAppData()
  const lastPost = data?.social_pulse?.best_tweet_week?.date ?? "—"

  const [schedule, setSchedule] = useState<DayRow[]>(DEFAULT_SCHEDULE)
  const [mix,      setMix]      = useState<MixRow[]>(DEFAULT_MIX)
  const [editMode,     setEditMode]     = useState(false)
  const [editMix,      setEditMix]      = useState(false)
  const [selectedIdx,  setSelectedIdx]  = useState(-1)   // -1 = use today

  // Load from localStorage on mount
  useEffect(() => {
    setSchedule(load("67-cal-schedule", DEFAULT_SCHEDULE))
    setMix(load("67-cal-mix", DEFAULT_MIX))
  }, [])

  function removeSlot(dayIdx: number, slotIdx: number) {
    const next = schedule.map((d, i) =>
      i === dayIdx ? { ...d, slots: d.slots.filter((_, j) => j !== slotIdx) } : d
    )
    setSchedule(next); save("67-cal-schedule", next)
  }

  function addSlot(dayIdx: number, val: string) {
    const next = schedule.map((d, i) =>
      i === dayIdx ? { ...d, slots: [...d.slots, val] } : d
    )
    setSchedule(next); save("67-cal-schedule", next)
  }

  function updateMixPct(idx: number, pct: number) {
    const clamped = Math.max(0, Math.min(100, pct))
    const next    = mix.map((m, i) => i === idx ? { ...m, pct: clamped } : m)
    setMix(next); save("67-cal-mix", next)
  }

  function updateMixLabel(idx: number, label: string) {
    const next = mix.map((m, i) => i === idx ? { ...m, label } : m)
    setMix(next); save("67-cal-mix", next)
  }

  function addMixRow() {
    const next = [...mix, { label: "New category", pct: 0, color: "var(--secondary)" }]
    setMix(next); save("67-cal-mix", next)
  }

  function removeMixRow(idx: number) {
    const next = mix.filter((_, i) => i !== idx)
    setMix(next); save("67-cal-mix", next)
  }

  const totalPosts = schedule.reduce((s, d) => s + d.slots.length, 0)

  // today + selected day
  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  const todayName  = DAY_NAMES[new Date().getDay()]
  const todayIdx   = schedule.findIndex(d => d.day === todayName)
  const activeIdx  = selectedIdx >= 0 ? selectedIdx : (todayIdx >= 0 ? todayIdx : 0)
  const activeRow  = schedule[activeIdx]
  const isToday    = activeIdx === (todayIdx >= 0 ? todayIdx : 0)

  // ── Collapsed — fully interactive, no modal needed ───────────────────────

  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Clickable 7-day strip */}
      <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
        {schedule.map((d, i) => {
          const isTodayCell  = d.day === todayName
          const isSelected   = i === activeIdx
          const count        = d.slots.length
          return (
            <button
              key={d.day}
              onClick={e => { e.stopPropagation(); setSelectedIdx(i) }}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                gap: 4, padding: "6px 2px", borderRadius: 8, border: "none", cursor: "pointer",
                background: isSelected ? "#F5A623" : count > 0 ? "#F4F4F5" : "transparent",
                outline: isSelected ? "none" : "1.5px solid rgba(0,0,0,0.06)",
                transition: "all 0.12s",
              }}
            >
              <span style={{ fontSize: "0.5625rem", fontWeight: isSelected ? 800 : 600,
                color: isSelected ? "#000" : "#8E8E93", letterSpacing: "0.03em" }}>
                {d.day.slice(0,2)}
              </span>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700,
                color: isSelected ? "#000" : count > 0 ? "#374151" : "#D1D5DB" }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected day's posts */}
      <div style={{ borderTop: "1px solid var(--separator)", paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--tertiary)",
            textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {isToday ? "Today" : activeRow?.day} · {activeRow?.day}
          </p>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F5A623" }}>
            {activeRow?.slots.length ?? 0} posts
          </span>
        </div>

        {activeRow?.slots.length === 0 ? (
          <p style={{ fontSize: "0.8125rem", color: "var(--secondary)", fontStyle: "italic" }}>
            Nothing scheduled — add below
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {activeRow?.slots.map((slot, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F5A623", flexShrink: 0 }} />
                <span style={{ fontSize: "0.8125rem", color: "var(--foreground)", fontWeight: 500 }}>{slot}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick-add for selected day */}
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AddSlotInput onAdd={v => addSlot(activeIdx, v)} />
        <span style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>
          add to {isToday ? "today" : activeRow?.day}
        </span>
      </div>
    </div>
  )

  // ── Expanded ─────────────────────────────────────────────────────────────

  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { icon: <Clock style={{ width: 14, height: 14 }} />,        label: "Days",       value: "7",              color: "var(--secondary)" },
          { icon: <CheckCircle2 style={{ width: 14, height: 14 }} />, label: "Posts/wk",   value: String(totalPosts), color: "#10B981" },
          { icon: <Calendar style={{ width: 14, height: 14 }} />,     label: "Last Post",  value: lastPost,          color: "#3B82F6" },
        ].map(s => (
          <div key={s.label} className="inset-cell" style={{ textAlign: "center" }}>
            <span style={{ color: s.color, display: "flex", justifyContent: "center", marginBottom: 6 }}>{s.icon}</span>
            <p style={{ fontSize: "1.125rem", fontWeight: 800, color: "#09090B", letterSpacing: "-0.03em" }}>{s.value}</p>
            <p className="metric-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Weekly Calendar ───────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Weekly Calendar
          </p>
          <button
            onClick={e => { e.stopPropagation(); setEditMode(p => !p) }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: "0.6875rem", fontWeight: 700,
              color:      editMode ? "#fff" : "#F5A623",
              background: editMode ? "#F5A623" : "rgba(245,166,35,0.10)",
              border:     "none", borderRadius: 99,
              padding:    "4px 10px", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <Pencil style={{ width: 10, height: 10 }} />{editMode ? "Done" : "Edit"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {schedule.map((d, dayIdx) => (
            <div key={d.day} style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "9px 12px", borderRadius: 10,
              background: "#F9F9F9", border: "1px solid rgba(0,0,0,0.05)",
            }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F5A623", width: 28, flexShrink: 0 }}>
                {d.day}
              </span>

              {/* Slots */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
                {d.slots.map((slot, slotIdx) => (
                  <span key={slotIdx} style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: "0.6875rem", fontWeight: 600,
                    padding: "3px 9px", borderRadius: 99,
                    background: "var(--card)", border: "1px solid rgba(0,0,0,0.09)",
                    color: "#3F3F46",
                  }}>
                    {slot}
                    {editMode && (
                      <button
                        onClick={e => { e.stopPropagation(); removeSlot(dayIdx, slotIdx) }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: 0, display: "flex", alignItems: "center",
                          color: "#EF4444",
                        }}
                      >
                        <X style={{ width: 9, height: 9 }} />
                      </button>
                    )}
                  </span>
                ))}

                {/* Add slot */}
                {editMode && (
                  <AddSlotInput onAdd={val => addSlot(dayIdx, val)} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content Mix ──────────────────────────────────────── */}
      <div className="inset-cell">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Content Mix
          </p>
          <button
            onClick={e => { e.stopPropagation(); setEditMix(p => !p) }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: "0.6875rem", fontWeight: 700,
              color:      editMix ? "#fff" : "#F5A623",
              background: editMix ? "#F5A623" : "rgba(245,166,35,0.10)",
              border: "none", borderRadius: 99,
              padding: "4px 10px", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <Pencil style={{ width: 10, height: 10 }} />{editMix ? "Done" : "Edit"}
          </button>
        </div>

        {mix.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              {editMix ? (
                <input
                  value={m.label}
                  onChange={e => updateMixLabel(idx, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{
                    fontSize: "0.8125rem", color: "#3F3F46", border: "none",
                    borderBottom: "1px solid rgba(0,0,0,0.12)", background: "transparent",
                    outline: "none", flex: 1, paddingBottom: 2,
                  }}
                />
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "#3F3F46" }}>{m.label}</span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 10 }}>
                {editMix ? (
                  <>
                    <button onClick={e => { e.stopPropagation(); updateMixPct(idx, m.pct - 5) }}
                      style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid rgba(0,0,0,0.1)", background: "var(--card)", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)" }}>−</button>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: m.color, minWidth: 30, textAlign: "center" }}>{m.pct}%</span>
                    <button onClick={e => { e.stopPropagation(); updateMixPct(idx, m.pct + 5) }}
                      style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid rgba(0,0,0,0.1)", background: "var(--card)", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)" }}>+</button>
                    <button onClick={e => { e.stopPropagation(); removeMixRow(idx) }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#EF4444", display: "flex", alignItems: "center" }}>
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: m.color }}>{m.pct}%</span>
                )}
              </div>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${m.pct}%`, background: m.color, transition: "width 0.3s" }} />
            </div>
          </div>
        ))}

        {editMix && (
          <button
            onClick={e => { e.stopPropagation(); addMixRow() }}
            style={{
              width: "100%", padding: "7px 12px", borderRadius: 8, cursor: "pointer",
              border: "1.5px dashed rgba(245,166,35,0.4)", background: "rgba(245,166,35,0.05)",
              color: "#F5A623", fontSize: "0.8125rem", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 4,
            }}
          >
            <Plus style={{ width: 12, height: 12 }} />Add category
          </button>
        )}
      </div>

    </div>
  )

  return (
    <DashboardCard
      title="Content"
      subtitle="Calendar · Schedule · Mix"
      icon={<Calendar style={{ width: 16, height: 16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
