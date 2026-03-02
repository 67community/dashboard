"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X, Calendar, CheckSquare, Square, ChevronDown } from "lucide-react"
import { Task, Priority, Category, KanbanColumn, SubTask } from "@/lib/types"
import { TEAM_MEMBERS } from "@/lib/mock-data"

const PRIORITY_COLOR: Record<Priority, { bg: string; text: string }> = {
  Urgent: { bg:"#FEF0F0", text:"#C0392B" },
  High:   { bg:"#FFF5E0", text:"#C8820A" },
  Medium: { bg:"#EAF4FF", text:"#1A73E8" },
  Low:    { bg:"#F0F0F2", text:"#6B6B6B" },
}

const COLUMNS:    KanbanColumn[] = ["Backlog","Todo","In Progress","Review","Done"]
const PRIORITIES: Priority[]     = ["Urgent","High","Medium","Low"]
const CATEGORIES: Category[]     = ["Website","Discord","Content","Token","Merch","Design","Other"]

const sel: React.CSSProperties = {
  appearance:"none", WebkitAppearance:"none", border:"none",
  outline:"none", cursor:"pointer", background:"transparent",
  fontSize:"0.8125rem", fontWeight:700, fontFamily:"inherit",
  paddingRight:18,
}

interface Props { task: Task; onClose: () => void; onUpdate: (task: Task) => void }

export function TaskDetailModal({ task, onClose, onUpdate }: Props) {
  const [local,      setLocal]      = useState<Task>(task)
  const [newSub,     setNewSub]     = useState("")
  const [mounted,    setMounted]    = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // ESC to close + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  }, [onClose])

  const update = (patch: Partial<Task>) => {
    const updated = { ...local, ...patch }
    setLocal(updated)
    onUpdate(updated)
  }

  const toggleSubtask = (id: string) =>
    update({ subtasks: local.subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s) })

  const addSubtask = () => {
    if (!newSub.trim()) return
    const st: SubTask = { id:`s-${Date.now()}`, title:newSub.trim(), done:false }
    update({ subtasks:[...local.subtasks, st] })
    setNewSub("")
  }

  const assignee  = TEAM_MEMBERS.find(m => m.id === local.assigneeId)
  const prioStyle = PRIORITY_COLOR[local.priority]
  const doneCount = local.subtasks.filter(s => s.done).length

  const today = new Date().toISOString().slice(0,10)
  const isOverdue = local.dueDate && local.dueDate < today

  if (!mounted) return null

  const modal = (
    <div
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && onClose()}
      style={{
        position:"fixed", inset:0, zIndex:9999,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"24px 16px",
        background:"rgba(0,0,0,0.3)",
        backdropFilter:"blur(6px)",
        WebkitBackdropFilter:"blur(6px)",
      }}
    >
      <div style={{
        width:"100%", maxWidth:600,
        maxHeight:"calc(100vh - 48px)",
        background:"rgba(255,255,255,0.92)",
        backdropFilter:"blur(24px) saturate(180%)",
        WebkitBackdropFilter:"blur(24px) saturate(180%)",
        borderRadius:24,
        boxShadow:"0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.6)",
        display:"flex", flexDirection:"column",
        overflow:"hidden",
        animation:"modal-up 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* ── Header ── */}
        <div style={{
          display:"flex", alignItems:"flex-start", gap:12,
          padding:"22px 24px 18px",
          borderBottom:"1px solid rgba(0,0,0,0.06)",
          flexShrink:0,
        }}>
          <input
            style={{
              flex:1, fontSize:"1.1875rem", fontWeight:800,
              letterSpacing:"-0.03em", color:"var(--foreground)",
              background:"transparent", border:"none", outline:"none",
              fontFamily:"inherit",
            }}
            value={local.title}
            onChange={e => update({ title: e.target.value })}
          />
          <button onClick={onClose} style={{
            width:30, height:30, borderRadius:"50%", border:"none", cursor:"pointer",
            background:"#F0F0F2", display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, transition:"background 0.15s",
          }}>
            <X style={{ width:14, height:14, color:"#6B6B6B" }} />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 28px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* Meta chips row */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {/* Column */}
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
              <select value={local.column} onChange={e => update({ column: e.target.value as KanbanColumn })}
                style={{ ...sel, background:"#F0F0F2", padding:"6px 28px 6px 12px", borderRadius:99, color:"var(--foreground)" }}>
                {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown style={{ position:"absolute", right:8, width:12, height:12, color:"var(--tertiary)", pointerEvents:"none" }} />
            </div>

            {/* Priority */}
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
              <select value={local.priority} onChange={e => update({ priority: e.target.value as Priority })}
                style={{ ...sel, background:prioStyle.bg, color:prioStyle.text, padding:"6px 28px 6px 12px", borderRadius:99 }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown style={{ position:"absolute", right:8, width:12, height:12, color:prioStyle.text, pointerEvents:"none" }} />
            </div>

            {/* Category */}
            <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
              <select value={local.category} onChange={e => update({ category: e.target.value as Category })}
                style={{ ...sel, background:"#F0F0F2", color:"var(--foreground)", padding:"6px 28px 6px 12px", borderRadius:99 }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown style={{ position:"absolute", right:8, width:12, height:12, color:"var(--tertiary)", pointerEvents:"none" }} />
            </div>
          </div>

          {/* Assignee + Due date */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {/* Assignee */}
            <div className="inset-cell" style={{ display:"flex", alignItems:"center", gap:10 }}>
              {assignee ? (
                <div style={{ width:28, height:28, borderRadius:"50%", background:assignee.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.6875rem", fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {assignee.initials}
                </div>
              ) : (
                <div style={{ width:28, height:28, borderRadius:"50%", background:"#E8E8ED",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
              )}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", marginBottom:2 }}>Assignee</p>
                <div style={{ position:"relative" }}>
                  <select value={local.assigneeId || ""} onChange={e => update({ assigneeId: e.target.value || undefined })}
                    style={{ ...sel, fontSize:"0.8125rem", color:"var(--foreground)", width:"100%" }}>
                    <option value="">Unassigned</option>
                    {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Due date */}
            <div className="inset-cell">
              <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", marginBottom:6 }}>Due Date</p>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Calendar style={{ width:14, height:14, color: isOverdue ? "#C0392B" : "#8E8E93", flexShrink:0 }} />
                <input type="date" value={local.dueDate || ""}
                  onChange={e => update({ dueDate: e.target.value || undefined })}
                  style={{ ...sel, fontSize:"0.8125rem", color: isOverdue ? "#C0392B" : "#1D1D1F", width:"100%" }} />
              </div>
              {isOverdue && <p style={{ fontSize:"0.6875rem", color:"#C0392B", marginTop:4, fontWeight:600 }}>⚠ Overdue</p>}
            </div>
          </div>

          {/* Description */}
          <div className="inset-cell">
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--tertiary)", marginBottom:10 }}>Description</p>
            <textarea
              style={{
                width:"100%", minHeight:80, fontSize:"0.875rem", color:"var(--foreground)",
                background:"transparent", border:"none", outline:"none", resize:"none",
                fontFamily:"inherit", lineHeight:1.6,
              }}
              placeholder="Add a description…"
              value={local.description || ""}
              onChange={e => update({ description: e.target.value })}
            />
          </div>

          {/* Subtasks */}
          <div className="inset-cell">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--tertiary)" }}>
                Subtasks
              </p>
              {local.subtasks.length > 0 && (
                <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#F5A623" }}>
                  {doneCount}/{local.subtasks.length} done
                </span>
              )}
            </div>

            {/* Progress bar if subtasks exist */}
            {local.subtasks.length > 0 && (
              <div className="prog-track" style={{ height:4, marginBottom:12 }}>
                <div className="prog-fill" style={{ height:4, background:"#F5A623", width:`${(doneCount/local.subtasks.length)*100}%` }} />
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {local.subtasks.map(st => (
                <div key={st.id} onClick={() => toggleSubtask(st.id)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:10,
                    cursor:"pointer", background:"rgba(0,0,0,0.03)", transition:"background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
                >
                  {st.done
                    ? <CheckSquare style={{ width:16, height:16, color:"#34C759", flexShrink:0 }} />
                    : <Square     style={{ width:16, height:16, color:"var(--tertiary)", flexShrink:0 }} />
                  }
                  <span style={{ fontSize:"0.875rem", color: st.done ? "#8E8E93" : "#1D1D1F",
                    textDecoration: st.done ? "line-through" : "none" }}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Add subtask */}
            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              <input
                style={{
                  flex:1, fontSize:"0.875rem", padding:"8px 12px", borderRadius:10,
                  border:"1px solid rgba(0,0,0,0.08)", outline:"none", fontFamily:"inherit",
                  background:"#FAFAFA", color:"var(--foreground)",
                }}
                placeholder="Add subtask…"
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSubtask()}
              />
              <button onClick={addSubtask} style={{
                padding:"8px 16px", background:"#F5A623", color:"#fff",
                border:"none", borderRadius:10, fontSize:"0.875rem", fontWeight:700,
                cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#E09610")}
                onMouseLeave={e => (e.currentTarget.style.background = "#F5A623")}
              >
                Add
              </button>
            </div>
          </div>

          {/* Activity */}
          {local.activity.length > 0 && (
            <div className="inset-cell">
              <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--tertiary)", marginBottom:12 }}>Activity</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {local.activity.map(a => {
                  const actor = TEAM_MEMBERS.find(m => m.id === a.actorId)
                  return (
                    <div key={a.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:22, height:22, borderRadius:"50%", background:actor?.color || "#E8E8ED",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"0.5625rem", fontWeight:800, color:"#fff", flexShrink:0 }}>
                        {actor?.initials?.charAt(0)}
                      </div>
                      <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)" }}>{actor?.name || a.actorId}</span>
                      <span style={{ fontSize:"0.8125rem", color:"var(--tertiary)" }}>{a.action}</span>
                      <span style={{ marginLeft:"auto", fontSize:"0.6875rem", color:"var(--tertiary)" }}>
                        {new Date(a.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modal-up {
          from { opacity:0; transform: scale(0.96) translateY(8px); }
          to   { opacity:1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  )

  return createPortal(modal, document.body)
}
