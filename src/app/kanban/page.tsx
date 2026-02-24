"use client"

import { KanbanBoard } from "@/components/kanban/kanban-board"
import { INITIAL_TASKS } from "@/lib/mock-data"

export default function KanbanPage() {
  const total = INITIAL_TASKS.length
  const done = INITIAL_TASKS.filter((t) => t.column === "Done").length
  const inProgress = INITIAL_TASKS.filter((t) => t.column === "In Progress").length

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-semibold text-amber-600">{inProgress}</span> in progress ·{" "}
            <span className="font-semibold text-green-600">{done}</span> done ·{" "}
            <span className="font-semibold text-gray-600">{total}</span> total
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
          Drag cards between columns to update status
        </div>
      </div>

      {/* Kanban board (horizontal scroll on small screens) */}
      <div className="overflow-x-auto pb-4">
        <KanbanBoard />
      </div>
    </div>
  )
}
