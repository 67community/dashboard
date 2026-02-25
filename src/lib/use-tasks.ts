"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "./supabase"
import { Task, SubTask, Comment, ActivityLog, KanbanColumn, Priority, Category } from "./types"
import { INITIAL_TASKS } from "./mock-data"

// ── DB row → Task ──────────────────────────────────────────────────────────
function rowToTask(
  row: Record<string, unknown>,
  subtasks: Record<string, unknown>[],
  comments: Record<string, unknown>[],
  activity: Record<string, unknown>[]
): Task {
  return {
    id:          row.id as string,
    title:       row.title as string,
    description: row.description as string | undefined,
    assigneeId:  row.assignee_id as string | undefined,
    priority:    row.priority as Priority,
    category:    row.category as Category,
    column:      row.column as KanbanColumn,
    dueDate:     row.due_date as string | undefined,
    createdAt:   row.created_at as string,
    subtasks:    subtasks
      .filter(s => s.task_id === row.id)
      .map(s => ({ id: s.id as string, title: s.title as string, done: s.done as boolean })),
    comments:    comments
      .filter(c => c.task_id === row.id)
      .map(c => ({ id: c.id as string, authorId: c.author_id as string, text: c.text as string, createdAt: c.created_at as string })),
    activity:    activity
      .filter(a => a.task_id === row.id)
      .map(a => ({ id: a.id as string, actorId: a.actor_id as string, action: a.action as string, timestamp: a.timestamp as string })),
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useTasks() {
  const [tasks,   setTasks]   = useState<Task[]>(INITIAL_TASKS)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // ── Fetch all tasks ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) return      // use mock data
    setLoading(true)
    try {
      const [{ data: rows }, { data: subs }, { data: coms }, { data: acts }] = await Promise.all([
        supabase.from("tasks").select("*").order("position"),
        supabase.from("subtasks").select("*").order("position"),
        supabase.from("comments").select("*").order("created_at"),
        supabase.from("activity").select("*").order("timestamp"),
      ])
      if (rows) {
        setTasks(rows.map(r => rowToTask(
          r as Record<string, unknown>,
          (subs ?? []) as Record<string, unknown>[],
          (coms ?? []) as Record<string, unknown>[],
          (acts ?? []) as Record<string, unknown>[],
        )))
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Initial load + realtime ──────────────────────────────────────────────
  useEffect(() => {
    fetchAll()
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel("tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "subtasks" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, fetchAll)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  // ── Move column ──────────────────────────────────────────────────────────
  const moveTask = useCallback(async (taskId: string, newCol: KanbanColumn) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: newCol } : t))
    if (isSupabaseConfigured) {
      await supabase.from("tasks").update({ column: newCol }).eq("id", taskId)
    }
  }, [])

  // ── Create task ──────────────────────────────────────────────────────────
  const createTask = useCallback(async (partial: Partial<Task> & { title: string; column: KanbanColumn }) => {
    const newTask: Task = {
      id:          `t_${Date.now()}`,
      title:       partial.title,
      description: partial.description,
      assigneeId:  partial.assigneeId,
      priority:    partial.priority ?? "Medium",
      category:    partial.category ?? "Other",
      column:      partial.column,
      dueDate:     partial.dueDate,
      createdAt:   new Date().toISOString(),
      subtasks:    [],
      comments:    [],
      activity:    [],
    }
    setTasks(prev => [...prev, newTask])

    if (isSupabaseConfigured) {
      const { data } = await supabase.from("tasks").insert({
        id:          newTask.id,
        title:       newTask.title,
        description: newTask.description,
        assignee_id: newTask.assigneeId,
        priority:    newTask.priority,
        category:    newTask.category,
        column:      newTask.column,
        due_date:    newTask.dueDate,
      }).select().single()
      if (data) setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, id: (data as Record<string,unknown>).id as string } : t))
    }
  }, [])

  // ── Update task ──────────────────────────────────────────────────────────
  const updateTask = useCallback(async (taskId: string, changes: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...changes } : t))
    if (isSupabaseConfigured) {
      const dbChanges: Record<string, unknown> = {}
      if (changes.title)       dbChanges.title       = changes.title
      if (changes.description !== undefined) dbChanges.description = changes.description
      if (changes.assigneeId !== undefined)  dbChanges.assignee_id = changes.assigneeId
      if (changes.priority)    dbChanges.priority    = changes.priority
      if (changes.category)    dbChanges.category    = changes.category
      if (changes.column)      dbChanges.column      = changes.column
      if (changes.dueDate !== undefined)     dbChanges.due_date    = changes.dueDate
      if (Object.keys(dbChanges).length) {
        await supabase.from("tasks").update(dbChanges).eq("id", taskId)
      }
    }
  }, [])

  // ── Delete task ──────────────────────────────────────────────────────────
  const deleteTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    if (isSupabaseConfigured) {
      await supabase.from("tasks").delete().eq("id", taskId)
    }
  }, [])

  // ── Toggle subtask ───────────────────────────────────────────────────────
  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    let newDone = false
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const subs = t.subtasks.map(s => {
        if (s.id !== subtaskId) return s
        newDone = !s.done
        return { ...s, done: newDone }
      })
      return { ...t, subtasks: subs }
    }))
    if (isSupabaseConfigured) {
      await supabase.from("subtasks").update({ done: newDone }).eq("id", subtaskId)
    }
  }, [])

  // ── Add comment ──────────────────────────────────────────────────────────
  const addComment = useCallback(async (taskId: string, authorId: string, text: string) => {
    const comment: Comment = { id: `c_${Date.now()}`, authorId, text, createdAt: new Date().toISOString() }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t))
    if (isSupabaseConfigured) {
      await supabase.from("comments").insert({ id: comment.id, task_id: taskId, author_id: authorId, text })
    }
  }, [])

  // ── Add subtask ──────────────────────────────────────────────────────────
  const addSubtask = useCallback(async (taskId: string, title: string) => {
    const sub: SubTask = { id: `s_${Date.now()}`, title, done: false }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub] } : t))
    if (isSupabaseConfigured) {
      await supabase.from("subtasks").insert({ id: sub.id, task_id: taskId, title, done: false })
    }
  }, [])

  // ── Log activity ─────────────────────────────────────────────────────────
  const logActivity = useCallback(async (taskId: string, actorId: string, action: string) => {
    const log: ActivityLog = { id: `a_${Date.now()}`, actorId, action, timestamp: new Date().toISOString() }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, activity: [...t.activity, log] } : t))
    if (isSupabaseConfigured) {
      await supabase.from("activity").insert({ id: log.id, task_id: taskId, actor_id: actorId, action })
    }
  }, [])

  return {
    tasks, loading, error,
    moveTask, createTask, updateTask, deleteTask,
    toggleSubtask, addComment, addSubtask, logActivity,
    isLive: isSupabaseConfigured,
  }
}
