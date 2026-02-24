"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Task, KanbanColumn } from "@/lib/types"
import { INITIAL_TASKS } from "@/lib/mock-data"
import { KanbanColumnComponent } from "./kanban-column"
import { TaskCard } from "./task-card"
import { TaskDetailModal } from "./task-detail-modal"

const COLUMNS: KanbanColumn[] = ["Backlog", "Todo", "In Progress", "Review", "Done"]

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const getTasksByColumn = (col: KanbanColumn) =>
    tasks.filter((t) => t.column === col)

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === active.id) || null)
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const overId = over.id as string
    const overCol = COLUMNS.includes(overId as KanbanColumn)
      ? (overId as KanbanColumn)
      : tasks.find((t) => t.id === overId)?.column

    if (!overCol) return
    const activeTaskItem = tasks.find((t) => t.id === active.id)
    if (!activeTaskItem || activeTaskItem.column === overCol) return

    setTasks((prev) =>
      prev.map((t) => t.id === active.id ? { ...t, column: overCol } : t)
    )
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    const activeTaskItem = tasks.find((t) => t.id === activeId)
    if (!activeTaskItem) return

    // Reorder within column
    const colTasks = getTasksByColumn(activeTaskItem.column)
    const oldIdx = colTasks.findIndex((t) => t.id === activeId)
    const newIdx = colTasks.findIndex((t) => t.id === overId)

    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      const reordered = arrayMove(colTasks, oldIdx, newIdx)
      setTasks((prev) => [
        ...prev.filter((t) => t.column !== activeTaskItem.column),
        ...reordered,
      ])
    }
  }

  const handleAddTask = (column: KanbanColumn, title: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      priority: "Medium",
      category: "Other",
      column,
      subtasks: [],
      comments: [],
      activity: [],
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t))
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 pb-6">
          {COLUMNS.map((col) => (
            <KanbanColumnComponent
              key={col}
              column={col}
              tasks={getTasksByColumn(col)}
              onOpenTask={setSelectedTask}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeTask && (
            <TaskCard task={activeTask} onOpen={() => {}} isDragOverlay />
          )}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            handleUpdateTask(updated)
            setSelectedTask(updated)
          }}
        />
      )}
    </>
  )
}
