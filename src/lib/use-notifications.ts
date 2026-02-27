"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  getNotifications, addNotification, markAllRead, clearNotifications,
  AppNotification,
} from "./notifications"
import type { DashboardData } from "./use-data"

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [notifs, setNotifs] = useState<AppNotification[]>([])

  const refresh = useCallback(() => setNotifs(getNotifications()), [])

  useEffect(() => {
    refresh()
    window.addEventListener("67_notifications_changed", refresh)
    return () => window.removeEventListener("67_notifications_changed", refresh)
  }, [refresh])

  return {
    notifs,
    unreadCount: notifs.filter(n => !n.read).length,
    markAllRead: () => { markAllRead(); refresh() },
    clear:       () => { clearNotifications(); refresh() },
  }
}

// ── Data Watcher — fires notifications when API data changes ─────────────────

export function useDataNotifications(data: DashboardData | null) {
  const prevRef    = useRef<DashboardData | null>(null)
  const initDone   = useRef(false)           // skip first load (no "new" events yet)

  useEffect(() => {
    if (!data) return

    // On very first load just record state, don't fire anything
    if (!initDone.current) {
      prevRef.current = data
      initDone.current = true
      return
    }

    const prev = prevRef.current
    if (!prev) { prevRef.current = data; return }

    const now = new Date().toISOString()

    // ── Helper: fire notification + send to Discord ──────────────────────────
    function fireAlert(n: Parameters<typeof addNotification>[0]) {
      addNotification(n)
      // Send to Discord webhook (fire-and-forget)
      fetch("/api/discord-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: n.message, type: n.type }),
      }).catch(() => {})
    }

    // ── 1. Price alerts ──────────────────────────────────────────────────────
    const price     = data.token_health?.price           ?? 0
    const ch24      = data.token_health?.price_change_24h ?? 0
    const prevCh24  = prev.token_health?.price_change_24h ?? 0

    if (ch24 <= -10 && prevCh24 > -10) {
      fireAlert({ type:"danger",  category:"price", timestamp:now,
        message:`⚠️ $67 down ${ch24.toFixed(1)}% in 24h  ·  $${price.toFixed(6)}` })
    }
    if (ch24 >= 10 && prevCh24 < 10) {
      fireAlert({ type:"success", category:"price", timestamp:now,
        message:`🚀 $67 up ${ch24.toFixed(1)}% in 24h!  ·  $${price.toFixed(6)}` })
    }
    if (ch24 >= 30 && prevCh24 < 30) {
      fireAlert({ type:"success", category:"price", timestamp:now,
        message:`🔥 $67 PUMPING +${ch24.toFixed(1)}%! Price: $${price.toFixed(6)}` })
    }
    if (ch24 <= -20 && prevCh24 > -20) {
      fireAlert({ type:"danger",  category:"price", timestamp:now,
        message:`🔴 $67 bleeding hard — ${ch24.toFixed(1)}% in 24h. Price: $${price.toFixed(6)}` })
    }

    // ── 2. Whale trade ───────────────────────────────────────────────────────
    const bt     = data.token_health?.biggest_trades
    const prevBt = prev.token_health?.biggest_trades
    if (bt) {
      const buyUsd  = bt.biggest_buy_usd  ?? 0
      const sellUsd = bt.biggest_sell_usd ?? 0
      if (buyUsd >= 5000 && buyUsd !== (prevBt?.biggest_buy_usd ?? 0)) {
        fireAlert({ type:"success", category:"whale", timestamp:now,
          message:`🐋🟢 Whale buy — $${buyUsd.toLocaleString()} of $67` })
      }
      if (sellUsd >= 5000 && sellUsd !== (prevBt?.biggest_sell_usd ?? 0)) {
        fireAlert({ type:"danger", category:"whale", timestamp:now,
          message:`🐋🔴 Whale sell — $${sellUsd.toLocaleString()} of $67` })
      }
    }

    // ── 3. Discord mod alerts ────────────────────────────────────────────────
    const currAct = data.community?.recent_discord_activity ?? []
    const prevAct = prev.community?.recent_discord_activity ?? []
    const prevKeys = new Set(prevAct.map(a => `${a.type}_${a.user}_${a.time_ago}`))
    for (const act of currAct) {
      const key = `${act.type}_${act.user}_${act.time_ago}`
      if (!prevKeys.has(key) && (act.type === "ban" || act.type === "kick" || act.type === "spam")) {
        const emoji = act.type === "ban" ? "🚫" : act.type === "kick" ? "👢" : "⚠️"
        fireAlert({ type:"warning", category:"discord", timestamp:now,
          message:`${emoji} Discord ${act.type}: ${act.user}${act.reason ? ` — ${act.reason}` : ""}` })
      }
    }

    // ── 4. New news articles ─────────────────────────────────────────────────
    const currNews = data.news_feed ?? []
    const prevNews = prev.news_feed ?? []
    const prevNewsIds = new Set(prevNews.map(n => n.id))
    const newArticles = currNews.filter(n => !prevNewsIds.has(n.id)).slice(0, 3)
    for (const article of newArticles) {
      addNotification({ type:"info", category:"news", timestamp:now,
        message:`📰 ${article.title} — ${article.source}` })
    }

    prevRef.current = data
  }, [data])
}

// ── Exported helper for manual use (e.g. team notes save) ────────────────────
export { addNotification }
