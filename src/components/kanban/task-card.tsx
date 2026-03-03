"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, GripVertical, Trash2 } from "lucide-react"
import { Task, Priority, Category } from "@/lib/types"
import { TEAM_MEMBERS } from "@/lib/mock-data"
import { TeamAvatar } from "@/components/team/team-avatar"

const PRIORITY: Record<Priority, { bg:string; color:string }> = {
  Low:    { bg:"#F4F4F5", color:"#71717A" },
  Medium: { bg:"#EFF6FF", color:"#2563EB" },
  High:   { bg:"#FFF7ED", color:"#C2410C" },
  Urgent: { bg:"#FEF2F2", color:"#DC2626" },
}
const CATEGORY: Record<Category, { bg:string; color:string }> = {
  Website: { bg:"#F5F3FF", color:"#7C3AED" },
  Discord: { bg:"#EEF2FF", color:"#4338CA" },
  Content: { bg:"#FDF2F8", color:"#BE185D" },
  Token:   { bg:"#FFFBEB", color:"#D97706" },
  Merch:   { bg:"#F0FDFA", color:"#0F766E" },
  Design:  { bg:"#FFF1F2", color:"#BE123C" },
  Other:   { bg:"#F4F4F5", color:"#71717A" },
}

function getUrgency(task: Task): { borderColor: string; bg: string } | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (task.priority === "Urgent") return { borderColor: "#DC2626", bg: "rgba(220,38,38,0.04)" }

  if (task.dueDate) {
    const due = new Date(task.dueDate)
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const diffDays = Math.floor((dueDay.getTime() - today.getTime()) / 86400000)

    if (diffDays < 0)  return { borderColor: "#DC2626", bg: "rgba(220,38,38,0.05)" }   // overdue
    if (diffDays === 0) return { borderColor: "#EA580C", bg: "rgba(234,88,12,0.05)" }   // today
    if (diffDays <= 7)  return { borderColor: "#D97706", bg: "rgba(217,119,6,0.04)" }   // this week
  }
  return null
}

interface Props { task: Task; onOpen: (task: Task) => void; onDelete?: (id: string) => void; isDragOverlay?: boolean }

export function TaskCard({ task, onOpen, onDelete, isDragOverlay = false }: Props) {
  const [hovered, setHovered] = useState(false)
  const urgency = getUrgency(task)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const assignee = TEAM_MEMBERS.find(m => m.id === task.assigneeId)
  const doneSubtasks = task.subtasks.filter(s => s.done).length
  const P = PRIORITY[task.priority]
  const C = CATEGORY[task.category]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onOpen(task)}
    >
      <div style={{
        position:"relative",
        background: urgency ? urgency.bg : "#FFFFFF",
        borderRadius:14,
        border: urgency ? `1px solid ${urgency.borderColor}40` : "1px solid rgba(0,0,0,0.06)",
        borderLeft: urgency ? `3px solid ${urgency.borderColor}` : "1px solid rgba(0,0,0,0.06)",
        padding:"14px 14px",
        boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
        cursor:"pointer",
        opacity: isDragging ? 0.4 : 1,
        transition:"box-shadow 0.15s, border-color 0.15s",
        ...(isDragOverlay ? { boxShadow:"0 16px 40px rgba(0,0,0,0.14)", transform:"rotate(1.5deg) scale(1.03)" } : {}),
      }}
        onMouseEnter={e => { setHovered(true); if (!isDragging) { (e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.borderColor="rgba(0,0,0,0.10)" }}}
        onMouseLeave={e => { setHovered(false); (e.currentTarget as HTMLDivElement).style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor="rgba(0,0,0,0.06)"}}
      >
        {/* Delete button — appears on hover */}
        {onDelete && hovered && !isDragOverlay && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            style={{
              position:"absolute", top:8, right:8,
              width:24, height:24, borderRadius:7,
              background:"#FEF2F2", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.15s", zIndex:2,
            }}
            onMouseEnter={e => (e.currentTarget.style.background="#FECACA")}
            onMouseLeave={e => (e.currentTarget.style.background="#FEF2F2")}
          >
            <Trash2 style={{ width:11, height:11, color:"#DC2626" }} />
          </button>
        )}

        {/* Grip + title */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
          <button
            {...attributes} {...listeners}
            onClick={e => e.stopPropagation()}
            style={{ marginTop:2, padding:2, background:"none", border:"none", cursor:"grab", flexShrink:0, opacity:0.3, color:"var(--secondary)" }}>
            <GripVertical style={{ width:13, height:13 }} />
          </button>
          <p style={{ fontSize:"0.8125rem", fontWeight:600, color:"#09090B", lineHeight:1.5, flex:1, paddingRight: hovered && onDelete ? 20 : 0 }}>{task.title}</p>
        </div>

        {/* Tags */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10, marginLeft:19 }}>
          <span style={{ fontSize:"0.6875rem", fontWeight:600, padding:"2px 8px", borderRadius:99, background:P.bg, color:P.color }}>
            {task.priority}
          </span>
          <span style={{ fontSize:"0.6875rem", fontWeight:600, padding:"2px 8px", borderRadius:99, background:C.bg, color:C.color }}>
            {task.category}
          </span>
        </div>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10, marginLeft:19 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {task.subtasks.length > 0 && (
              <span style={{ fontSize:"0.6875rem", color:"var(--secondary)", fontWeight:500 }}>
                ✓ {doneSubtasks}/{task.subtasks.length}
              </span>
            )}
            {task.dueDate && (
              <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.6875rem", color:"var(--secondary)" }}>
                <Calendar style={{ width:11, height:11 }} />
                {new Date(task.dueDate).toLocaleDateString("en-US", { month:"short", day:"numeric" })}
              </div>
            )}
          </div>
          {assignee && <TeamAvatar member={assignee} size="sm" />}
        </div>
      </div>
    </div>
  )
}
