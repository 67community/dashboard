"use client"

import { KanbanBoard } from "@/components/kanban/kanban-board"
import { INITIAL_TASKS } from "@/lib/mock-data"

export default function KanbanPage() {
  const total = INITIAL_TASKS.length
  const done = INITIAL_TASKS.filter(t => t.column === "Done").length
  const inProgress = INITIAL_TASKS.filter(t => t.column === "In Progress").length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:32, display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:16 }}>
        <div>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"#C8820A", marginBottom:10 }}>
            Team Board
          </p>
          <h2 style={{ fontSize:"2rem", fontWeight:900, letterSpacing:"-0.04em", color:"#09090B", margin:0, lineHeight:1 }}>
            Tasks
          </h2>
          <p style={{ fontSize:"0.9375rem", color:"#71717A", marginTop:8, fontWeight:500 }}>
            <span style={{ fontWeight:700, color:"#C8820A" }}>{inProgress}</span> in progress ·{" "}
            <span style={{ fontWeight:700, color:"#059669" }}>{done}</span> done ·{" "}
            <span style={{ fontWeight:700, color:"#09090B" }}>{total}</span> total
          </p>
        </div>
        <div style={{ fontSize:"0.75rem", color:"#A1A1AA", background:"#F4F4F5", padding:"8px 14px", borderRadius:10, fontWeight:500, flexShrink:0 }}>
          Drag cards to update status
        </div>
      </div>

      <div className="divider" style={{ marginBottom:28 }} />

      {/* Board */}
      <div style={{ overflowX:"auto", paddingBottom:16 }}>
        <KanbanBoard />
      </div>
    </div>
  )
}
