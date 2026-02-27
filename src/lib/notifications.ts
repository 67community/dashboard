// ── Notification Store (localStorage) ────────────────────────────────────────

export type NotifType = "danger" | "warning" | "success" | "info"
export type NotifCategory = "price" | "discord" | "news" | "note" | "whale" | "system"

export interface AppNotification {
  id:        string
  type:      NotifType
  category:  NotifCategory
  message:   string
  timestamp: string
  read:      boolean
}

const STORAGE_KEY = "67_notifications"
const MAX_NOTIFS  = 50

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") }
  catch { return [] }
}

export function addNotification(notif: Omit<AppNotification, "id" | "read">): void {
  if (typeof window === "undefined") return
  const notifs = getNotifications()

  // De-duplicate: skip if same message in last 5 min
  const fiveMinAgo = Date.now() - 5 * 60_000
  const isDupe = notifs.some(
    n => n.message === notif.message && new Date(n.timestamp).getTime() > fiveMinAgo
  )
  if (isDupe) return

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  notifs.unshift({ ...notif, id, read: false })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, MAX_NOTIFS)))
  window.dispatchEvent(new CustomEvent("67_notifications_changed"))
}

export function markAllRead(): void {
  if (typeof window === "undefined") return
  const notifs = getNotifications().map(n => ({ ...n, read: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs))
  window.dispatchEvent(new CustomEvent("67_notifications_changed"))
}

export function clearNotifications(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent("67_notifications_changed"))
}
