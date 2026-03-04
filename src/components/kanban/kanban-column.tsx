"use client"

import { useState } from "react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { Task, KanbanColumn as KanbanColumnType } from "@/lib/types"
import { TaskCard } from "./task-card"
import { TEAM_MEMBERS } from "@/lib/mock-data"

const COL: Record<KanbanColumnType, { dot: string; bg: string; text: string }> = {
  Backlog:      { dot:"#A1A1AA", bg:"rgba(161,161,170,0.15)", text:"#A1A1AA" },
  Todo:         { dot:"#60A5FA", bg:"rgba(96,165,250,0.15)",  text:"#60A5FA" },
  "In Progress":{ dot:"#FCD34D", bg:"rgba(252,211,77,0.15)",  text:"#FCD34D" },
  Review:       { dot:"#A78BFA", bg:"rgba(167,139,250,0.15)", text:"#A78BFA" },
  Done:         { dot:"#34D399", bg:"rgba(52,211,153,0.15)",  text:"#34D399" },
}

interface Props {
  column: KanbanColumnType
  tasks: Task[]
  onOpenTask: (task: Task) => void
  onAddTask: (column: KanbanColumnType, title: string, assigneeId?: string) => void
  onDeleteTask?: (id: string) => void
}

export function KanbanColumnComponent({ column, tasks, onOpenTask, onAddTask, onDeleteTask }: Props) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined)
  const { setNodeRef, isOver } = useDroppable({ id: column })
  const s = COL[column]

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask(column, newTitle.trim(), assigneeId)
      setNewTitle(""); setAssigneeId(undefined); setAdding(false)
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, minWidth:268, width:268 }}>
      {/* Column header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 4px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:s.dot, display:"inline-block", flexShrink:0 }} />
          <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)" }}>{column}</span>
          <span style={{ fontSize:"0.6875rem", fontWeight:700, padding:"2px 7px", borderRadius:99, background:s.bg, color:s.text }}>
            {tasks.length}
          </span>
        </div>
        <button onClick={() => setAdding(true)}
          style={{ width:26, height:26, borderRadius:8, background:"var(--fill-primary)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Plus style={{ width:14, height:14, color:"var(--secondary)" }} />
        </button>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef}
        style={{
          display:"flex", flexDirection:"column", gap:8,
          minHeight:120, padding:8, borderRadius:16, transition:"all 0.15s",
          background: isOver ? "rgba(245,166,35,0.08)" : "rgba(255,255,255,0.03)",
          border: isOver ? "2px dashed rgba(245,166,35,0.45)" : "2px solid transparent",
        }}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => <TaskCard key={task.id} task={task} onOpen={onOpenTask} onDelete={onDeleteTask} />)}
        </SortableContext>

        {adding && (
          <div style={{ background:"var(--card)", borderRadius:14, border:"1px solid var(--separator)", padding:14, boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
            <textarea autoFocus
              style={{ width:"100%", fontSize:"0.875rem", color:"var(--foreground)", background:"transparent", border:"none", outline:"none", resize:"none", minHeight:60 }}
              placeholder="Task title…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd() }
                if (e.key === "Escape") { setAdding(false); setNewTitle("") }
              }}
            />
            {/* Assignee picker */}
            <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
              {TEAM_MEMBERS.map(m => (
                <button key={m.id} onClick={() => setAssigneeId(assigneeId === m.id ? undefined : m.id)}
                  title={m.name}
                  style={{ padding:0, background:"none", border:"none", cursor:"pointer", borderRadius:"50%",
                    outline: assigneeId === m.id ? `2px solid #F5A623` : "2px solid transparent",
                    outlineOffset: 1, transition:"outline 0.15s" }}>
                  <img src={m.avatar} alt={m.name}
                    style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover", display:"block",
                      opacity: assigneeId && assigneeId !== m.id ? 0.35 : 1, transition:"opacity 0.15s" }} />
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleAdd}
                style={{ padding:"6px 14px", background:"#F5A623", color:"#000", fontSize:"0.75rem", fontWeight:700, borderRadius:9, border:"none", cursor:"pointer" }}>
                Add
              </button>
              <button onClick={() => { setAdding(false); setNewTitle(""); setAssigneeId(undefined) }}
                style={{ padding:"6px 14px", background:"var(--fill-primary)", color:"var(--secondary)", fontSize:"0.75rem", fontWeight:600, borderRadius:9, border:"none", cursor:"pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {tasks.length === 0 && !adding && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:64, fontSize:"0.75rem", color:"#D4D4D8", fontWeight:500 }}>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}
