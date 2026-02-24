"use client"

import { useState } from "react"
import { X, Calendar, CheckSquare, Square, User } from "lucide-react"
import { Task, Priority, Category, KanbanColumn, SubTask } from "@/lib/types"
import { TEAM_MEMBERS } from "@/lib/mock-data"
import { TeamAvatar } from "@/components/team/team-avatar"

const PRIORITY_STYLES: Record<Priority, string> = {
  Low: "bg-[#F2F2F3] text-[#6B7280] border-[rgba(0,0,0,0.07)]",
  Medium: "bg-blue-50 text-blue-700 border-blue-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Urgent: "bg-red-50 text-red-700 border-red-200",
}

const COLUMNS: KanbanColumn[] = ["Backlog", "Todo", "In Progress", "Review", "Done"]
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"]
const CATEGORIES: Category[] = ["Website", "Discord", "Content", "Token", "Merch", "Design", "Other"]

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
}

export function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
  const [localTask, setLocalTask] = useState<Task>(task)
  const [newSubtask, setNewSubtask] = useState("")

  const update = (patch: Partial<Task>) => {
    const updated = { ...localTask, ...patch }
    setLocalTask(updated)
    onUpdate(updated)
  }

  const toggleSubtask = (id: string) => {
    update({
      subtasks: localTask.subtasks.map((s) =>
        s.id === id ? { ...s, done: !s.done } : s
      ),
    })
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    const st: SubTask = { id: `s-${Date.now()}`, title: newSubtask.trim(), done: false }
    update({ subtasks: [...localTask.subtasks, st] })
    setNewSubtask("")
  }

  const assignee = TEAM_MEMBERS.find((m) => m.id === localTask.assigneeId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.05)] flex-shrink-0">
          <div className="flex-1 pr-4">
            <input
              className="w-full text-lg font-bold text-[#111110] bg-transparent border-none outline-none focus:ring-0 resize-none"
              value={localTask.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2F2F3] hover:bg-[#E8E8EA] flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            {/* Status */}
            <select
              value={localTask.column}
              onChange={(e) => update({ column: e.target.value as KanbanColumn })}
              className="text-xs px-3 py-1.5 bg-[#F2F2F3] rounded-xl border-none outline-none cursor-pointer font-medium text-[#374151]"
            >
              {COLUMNS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Priority */}
            <select
              value={localTask.priority}
              onChange={(e) => update({ priority: e.target.value as Priority })}
              className={`text-xs px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${PRIORITY_STYLES[localTask.priority]}`}
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* Category */}
            <select
              value={localTask.category}
              onChange={(e) => update({ category: e.target.value as Category })}
              className="text-xs px-3 py-1.5 bg-[#F2F2F3] rounded-xl border-none outline-none cursor-pointer font-medium text-[#374151]"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Assignee + Due date */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <select
                value={localTask.assigneeId || ""}
                onChange={(e) => update({ assigneeId: e.target.value || undefined })}
                className="text-xs bg-transparent border-none outline-none cursor-pointer text-[#6B7280]"
              >
                <option value="">Unassigned</option>
                {TEAM_MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {assignee && <TeamAvatar member={assignee} size="sm" />}
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <input
                type="date"
                value={localTask.dueDate || ""}
                onChange={(e) => update({ dueDate: e.target.value || undefined })}
                className="text-xs bg-transparent border-none outline-none cursor-pointer text-[#6B7280]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Description</p>
            <textarea
              className="w-full min-h-[80px] text-sm text-[#374151] bg-[#F2F2F3] rounded-xl p-3 border border-[rgba(120,95,60,0.07)] outline-none focus:border-amber-200 focus:ring-1 focus:ring-amber-200 resize-none transition-colors"
              placeholder="Add a description..."
              value={localTask.description || ""}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          {/* Subtasks */}
          <div>
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Subtasks {localTask.subtasks.length > 0 && `(${localTask.subtasks.filter(s => s.done).length}/${localTask.subtasks.length})`}
            </p>
            <div className="space-y-1.5">
              {localTask.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer group"
                  onClick={() => toggleSubtask(st.id)}
                >
                  {st.done ? (
                    <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-300 group-hover:text-[#9CA3AF] flex-shrink-0" />
                  )}
                  <span className={`text-sm ${st.done ? "line-through text-[#9CA3AF]" : "text-[#374151]"}`}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                className="flex-1 text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 outline-none focus:border-amber-200 focus:ring-1 focus:ring-amber-200 transition-colors placeholder:text-[#9CA3AF]"
                placeholder="Add subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
              />
              <button
                onClick={addSubtask}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Activity */}
          {localTask.activity.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Activity</p>
              <div className="space-y-1.5">
                {localTask.activity.map((a) => {
                  const actor = TEAM_MEMBERS.find((m) => m.id === a.actorId)
                  return (
                    <div key={a.id} className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: actor?.color || "#ccc" }}>
                        {actor?.initials.charAt(0)}
                      </div>
                      <span className="font-medium text-[#6B7280]">{actor?.name || a.actorId}</span>
                      <span>{a.action}</span>
                      <span className="text-[#9CA3AF]">{new Date(a.timestamp).toLocaleDateString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
