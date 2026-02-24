"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, GripVertical } from "lucide-react"
import { Task, Priority, Category } from "@/lib/types"
import { TEAM_MEMBERS } from "@/lib/mock-data"
import { TeamAvatar } from "@/components/team/team-avatar"

const PRIORITY_STYLES: Record<Priority, string> = {
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
}

const CATEGORY_STYLES: Record<Category, string> = {
  Website: "bg-violet-100 text-violet-700",
  Discord: "bg-indigo-100 text-indigo-700",
  Content: "bg-pink-100 text-pink-700",
  Token: "bg-amber-100 text-amber-700",
  Merch: "bg-teal-100 text-teal-700",
  Design: "bg-rose-100 text-rose-700",
  Other: "bg-gray-100 text-gray-600",
}

interface TaskCardProps {
  task: Task
  onOpen: (task: Task) => void
  isDragOverlay?: boolean
}

export function TaskCard({ task, onOpen, isDragOverlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const assignee = TEAM_MEMBERS.find((m) => m.id === task.assigneeId)
  const doneSubtasks = task.subtasks.filter((s) => s.done).length

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm group cursor-pointer select-none
        ${isDragging ? "opacity-40" : ""}
        ${isDragOverlay ? "drag-overlay shadow-xl" : "hover:border-gray-200 hover:shadow-md transition-all"}
      `}
      onClick={() => onOpen(task)}
    >
      {/* Drag handle + title row */}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>
        <p className="text-sm font-medium text-gray-800 leading-snug flex-1">{task.title}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-2.5 ml-5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_STYLES[task.category]}`}>
          {task.category}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 ml-5">
        <div className="flex items-center gap-3">
          {task.subtasks.length > 0 && (
            <span className="text-xs text-gray-400">
              ✓ {doneSubtasks}/{task.subtasks.length}
            </span>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          )}
        </div>
        {assignee && <TeamAvatar member={assignee} size="sm" showTooltip />}
      </div>
    </div>
  )
}
