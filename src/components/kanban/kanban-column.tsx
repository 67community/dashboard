"use client"

import { useState } from "react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { Task, KanbanColumn as KanbanColumnType } from "@/lib/types"
import { TaskCard } from "./task-card"

const COLUMN_STYLES: Record<KanbanColumnType, { dot: string; badge: string }> = {
  Backlog: { dot: "bg-[#9CA3AF]", badge: "bg-[#F2F2F3] text-[#6B7280]" },
  Todo: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700" },
  "In Progress": { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700" },
  Review: { dot: "bg-purple-400", badge: "bg-purple-50 text-purple-700" },
  Done: { dot: "bg-green-400", badge: "bg-green-50 text-green-700" },
}

interface KanbanColumnProps {
  column: KanbanColumnType
  tasks: Task[]
  onOpenTask: (task: Task) => void
  onAddTask: (column: KanbanColumnType, title: string) => void
}

export function KanbanColumnComponent({ column, tasks, onOpenTask, onAddTask }: KanbanColumnProps) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")

  const { setNodeRef, isOver } = useDroppable({ id: column })
  const styles = COLUMN_STYLES[column]

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask(column, newTitle.trim())
      setNewTitle("")
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 min-w-[260px] w-[260px]">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
          <h3 className="text-sm font-semibold text-[#374151]">{column}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-6 h-6 rounded-lg bg-[#F2F2F3] hover:bg-[#E8E8EA] flex items-center justify-center transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2.5 min-h-[120px] p-2 rounded-2xl transition-colors ${
          isOver ? "bg-[#FFF8EC] border-2 border-[#F5A623]/40 border-dashed" : "bg-[#F2F2F3]/50"
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>

        {/* Add task inline */}
        {adding && (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[rgba(0,0,0,0.07)] p-3 shadow-sm">
            <textarea
              autoFocus
              className="w-full text-sm text-[#374151] bg-transparent resize-none outline-none min-h-[60px] placeholder:text-[#9CA3AF]"
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd() }
                if (e.key === "Escape") { setAdding(false); setNewTitle("") }
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setNewTitle("") }}
                className="px-3 py-1.5 bg-[#F2F2F3] hover:bg-[#E8E8EA] text-gray-600 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {tasks.length === 0 && !adding && (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}
