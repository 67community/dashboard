"use client"

import { useState } from "react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { Task, KanbanColumn as KanbanColumnType } from "@/lib/types"
import { TaskCard } from "./task-card"

const COL: Record<KanbanColumnType, { dot: string; bg: string; text: string }> = {
  Backlog:      { dot:"#A1A1AA", bg:"#F4F4F5", text:"#71717A" },
  Todo:         { dot:"#3B82F6", bg:"#EFF6FF", text:"#2563EB" },
  "In Progress":{ dot:"#F59E0B", bg:"#FFFBEB", text:"#D97706" },
  Review:       { dot:"#8B5CF6", bg:"#F5F3FF", text:"#7C3AED" },
  Done:         { dot:"#10B981", bg:"#ECFDF5", text:"#059669" },
}

interface Props {
  column: KanbanColumnType
  tasks: Task[]
  onOpenTask: (task: Task) => void
  onAddTask: (column: KanbanColumnType, title: string) => void
  onDeleteTask?: (id: string) => void
}

export function KanbanColumnComponent({ column, tasks, onOpenTask, onAddTask, onDeleteTask }: Props) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const { setNodeRef, isOver } = useDroppable({ id: column })
  const s = COL[column]

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask(column, newTitle.trim())
      setNewTitle(""); setAdding(false)
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, minWidth:268, width:268 }}>
      {/* Column header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 4px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:s.dot, display:"inline-block", flexShrink:0 }} />
          <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"#09090B" }}>{column}</span>
          <span style={{ fontSize:"0.6875rem", fontWeight:700, padding:"2px 7px", borderRadius:99, background:s.bg, color:s.text }}>
            {tasks.length}
          </span>
        </div>
        <button onClick={() => setAdding(true)}
          style={{ width:26, height:26, borderRadius:8, background:"#F4F4F5", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Plus style={{ width:14, height:14, color:"#71717A" }} />
        </button>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef}
        style={{
          display:"flex", flexDirection:"column", gap:8,
          minHeight:120, padding:8, borderRadius:16, transition:"all 0.15s",
          background: isOver ? "#FFFBEB" : "rgba(244,244,245,0.5)",
          border: isOver ? "2px dashed rgba(245,166,35,0.45)" : "2px solid transparent",
        }}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => <TaskCard key={task.id} task={task} onOpen={onOpenTask} onDelete={onDeleteTask} />)}
        </SortableContext>

        {adding && (
          <div style={{ background:"#FFFFFF", borderRadius:14, border:"1px solid rgba(0,0,0,0.07)", padding:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <textarea autoFocus
              style={{ width:"100%", fontSize:"0.875rem", color:"#09090B", background:"transparent", border:"none", outline:"none", resize:"none", minHeight:60 }}
              placeholder="Task title…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd() }
                if (e.key === "Escape") { setAdding(false); setNewTitle("") }
              }}
            />
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button onClick={handleAdd}
                style={{ padding:"6px 14px", background:"#F5A623", color:"#000", fontSize:"0.75rem", fontWeight:700, borderRadius:9, border:"none", cursor:"pointer" }}>
                Add
              </button>
              <button onClick={() => { setAdding(false); setNewTitle("") }}
                style={{ padding:"6px 14px", background:"#F4F4F5", color:"#71717A", fontSize:"0.75rem", fontWeight:600, borderRadius:9, border:"none", cursor:"pointer" }}>
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
