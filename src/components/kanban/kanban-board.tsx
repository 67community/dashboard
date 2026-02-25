"use client"

import { useState } from "react"
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Task, KanbanColumn } from "@/lib/types"
import { useTasks } from "@/lib/use-tasks"
import { KanbanColumnComponent } from "./kanban-column"
import { TaskCard } from "./task-card"
import { TaskDetailModal } from "./task-detail-modal"
import { Database, Wifi, WifiOff } from "lucide-react"

const COLUMNS: KanbanColumn[] = ["Backlog", "Todo", "In Progress", "Review", "Done"]

export function KanbanBoard() {
  const {
    tasks, loading, isLive,
    moveTask, createTask, updateTask,
  } = useTasks()

  const [activeTask,   setActiveTask]   = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const getTasksByColumn = (col: KanbanColumn) =>
    tasks.filter(t => t.column === col)

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
