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
          <h2 className="text-2xl font-bold" style={{ color: "#1A1A18", letterSpacing: "-0.04em", fontWeight: 900 }}>Tasks</h2>
          <p className="text-sm mt-1" style={{ color: "#7A7570" }}>
            <span className="font-semibold" style={{ color: "#C8820A" }}>{inProgress}</span> in progress ·{" "}
            <span className="font-semibold" style={{ color: "#1A6E3F" }}>{done}</span> done ·{" "}
            <span className="font-semibold" style={{ color: "#3C3630" }}>{total}</span> total
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-xl" style={{ color: "#7A7570", background: "#EDE8DF" }}>
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
