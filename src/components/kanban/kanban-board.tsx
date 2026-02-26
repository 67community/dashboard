"use client"

import { useState } from "react"
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Task, KanbanColumn, Priority, Category } from "@/lib/types"
import { TEAM_MEMBERS } from "@/lib/mock-data"
import { useTasks } from "@/lib/use-tasks"
import { KanbanColumnComponent } from "./kanban-column"
import { TaskCard } from "./task-card"
import { TaskDetailModal } from "./task-detail-modal"
import { Database, Wifi, WifiOff, X } from "lucide-react"

const COLUMNS: KanbanColumn[] = ["Backlog", "Todo", "In Progress", "Review", "Done"]
const PRIORITIES: Priority[]  = ["Urgent", "High", "Medium", "Low"]
const CATEGORIES: Category[]  = ["Website", "Discord", "Content", "Token", "Merch", "Design", "Other"]

const PRIORITY_COLOR: Record<Priority, string> = {
  Urgent:"#FF3B30", High:"#F5A623", Medium:"#34C759", Low:"#8E8E93"
}

interface Filters {
  assignee:  string | null
  priority:  Priority | null
  category:  Category | null
  due:       "overdue" | "today" | "week" | null
}

function FilterBar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const active = Object.values(filters).some(Boolean)
  const today  = new Date().toISOString().slice(0,10)
  const week   = new Date(Date.now() + 7*86400000).toISOString().slice(0,10)

  const pill = (label: string, active: boolean, onClick: () => void, color?: string) => (
    <button key={label} onClick={onClick} style={{
      padding:"5px 12px", borderRadius:99, border:"none", cursor:"pointer",
      fontSize:"0.75rem", fontWeight:700, transition:"all 0.15s",
      background: active ? (color ?? "#1D1D1F") : "#F0F0F2",
      color:      active ? "#FFFFFF" : "#6B6B6B",
      boxShadow:  active ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
    }}>
      {label}
    </button>
  )

  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20, alignItems:"center" }}>
      {/* Assignees */}
      {TEAM_MEMBERS.map(m => (
        <button key={m.id} onClick={() => setFilters({ ...filters, assignee: filters.assignee === m.id ? null : m.id })}
          style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"4px 10px 4px 4px", borderRadius:99, border:"none", cursor:"pointer",
            fontSize:"0.75rem", fontWeight:700, transition:"all 0.15s",
            background: filters.assignee === m.id ? m.color : "#F0F0F2",
            color:      filters.assignee === m.id ? "#fff" : "#6B6B6B",
            boxShadow:  filters.assignee === m.id ? `0 1px 4px ${m.color}55` : "none",
          }}>
          {m.avatar
            ? <img src={m.avatar} alt={m.initials}
                style={{ width:22, height:22, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
            : <span style={{
                width:22, height:22, borderRadius:"50%", background: m.color,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.625rem", fontWeight:800, color:"#fff", flexShrink:0,
              }}>{m.initials}</span>
          }
          {m.name.split(" ")[0]}
        </button>
      ))}

      {/* Divider */}
      <div style={{ width:1, height:22, background:"rgba(0,0,0,0.1)", margin:"0 2px" }} />

      {/* Priorities */}
      {PRIORITIES.map(p => pill(p, filters.priority === p, () => setFilters({ ...filters, priority: filters.priority === p ? null : p }), PRIORITY_COLOR[p]))}

      {/* Divider */}
      <div style={{ width:1, height:22, background:"rgba(0,0,0,0.1)", margin:"0 2px" }} />

      {/* Due date */}
      {(["overdue","today","week"] as const).map(d =>
        pill(d === "overdue" ? "⚠ Overdue" : d === "today" ? "Due Today" : "This Week",
          filters.due === d,
          () => setFilters({ ...filters, due: filters.due === d ? null : d }),
          d === "overdue" ? "#FF3B30" : "#F5A623"
        )
      )}

      {/* Clear */}
      {active && (
        <button onClick={() => setFilters({ assignee:null, priority:null, category:null, due:null })}
          style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:99, border:"none", cursor:"pointer",
            fontSize:"0.75rem", fontWeight:700, background:"rgba(0,0,0,0.06)", color:"#6B6B6B", marginLeft:4 }}>
          <X style={{ width:11, height:11 }} /> Clear
        </button>
      )}
    </div>
  )
}

export function KanbanBoard() {
  const {
    tasks, loading, isLive,
    moveTask, createTask, updateTask,
  } = useTasks()

  const [activeTask,   setActiveTask]   = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<Filters>({ assignee:null, priority:null, category:null, due:null })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const applyFilters = (t: Task) => {
    const today = new Date().toISOString().slice(0,10)
    const week  = new Date(Date.now() + 7*86400000).toISOString().slice(0,10)
    if (filters.assignee && t.assigneeId !== filters.assignee) return false
    if (filters.priority && t.priority  !== filters.priority)  return false
    if (filters.category && t.category  !== filters.category)  return false
    if (filters.due === "overdue" && (!t.dueDate || t.dueDate >= today)) return false
    if (filters.due === "today"   && t.dueDate !== today) return false
    if (filters.due === "week"    && (!t.dueDate || t.dueDate > week || t.dueDate < today)) return false
    return true
  }

  const getTasksByColumn = (col: KanbanColumn) =>
    tasks.filter(t => t.column === col && applyFilters(t))

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveTask(tasks.find(t => t.id === active.id) ?? null)

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const overCol = COLUMNS.includes(over.id as KanbanColumn)
      ? (over.id as KanbanColumn)
      : tasks.find(t => t.id === over.id)?.column
    if (!overCol) return
    const task = tasks.find(t => t.id === active.id)
    if (!task || task.column === overCol) return
    moveTask(task.id, overCol)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null)
    if (!over) return
    const task = tasks.find(t => t.id === active.id as string)
    if (!task) return
    const colTasks = getTasksByColumn(task.column)
    const oldIdx = colTasks.findIndex(t => t.id === active.id)
    const newIdx = colTasks.findIndex(t => t.id === over.id)
    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      arrayMove(colTasks, oldIdx, newIdx) // reorder handled via DB position later
    }
  }

  // ── Task CRUD ─────────────────────────────────────────────────────────────
  const handleAddTask = (column: KanbanColumn, title: string) => {
    createTask({ title, column })
  }

  const handleUpdateTask = async (updated: Task) => {
    await updateTask(updated.id, updated)
    setSelectedTask(updated)
  }

  return (
    <>
      {/* Supabase status bar */}
      <div style={{
        display:"flex", alignItems:"center", gap:8, marginBottom:20,
        padding:"8px 14px", borderRadius:10, width:"fit-content",
        background: isLive ? "rgba(16,185,129,0.08)" : "rgba(245,166,35,0.08)",
        border: `1px solid ${isLive ? "rgba(16,185,129,0.2)" : "rgba(245,166,35,0.2)"}`,
      }}>
        <Database style={{ width:13, height:13, color: isLive ? "#10B981" : "#F5A623" }} />
        {isLive
          ? <><Wifi style={{ width:13, height:13, color:"#10B981" }} /><span style={{ fontSize:"0.75rem", fontWeight:600, color:"#10B981" }}>Supabase Live — changes saved in real-time</span></>
          : <><WifiOff style={{ width:13, height:13, color:"#F5A623" }} /><span style={{ fontSize:"0.75rem", fontWeight:600, color:"#C8820A" }}>Local mode — configure Supabase to persist tasks</span></>
        }
        {loading && <span style={{ fontSize:"0.6875rem", color:"#8E8E93" }}>Syncing…</span>}
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 pb-6">
          {COLUMNS.map(col => (
            <KanbanColumnComponent
              key={col}
              column={col}
              tasks={getTasksByColumn(col)}
              onOpenTask={setSelectedTask}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration:200, easing:"cubic-bezier(0.18,0.67,0.6,1.22)" }}>
          {activeTask && <TaskCard task={activeTask} onOpen={() => {}} isDragOverlay />}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
        />
      )}
    </>
  )
}
