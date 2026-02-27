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

    // On very first load: seed initial status notifications
    if (!initDone.current) {
      prevRef.current  = data
      initDone.current = true
      const now = new Date().toISOString()

      // Seed: recent raids count
      const recentRaids = (data.raid_feed ?? []) as { message_id: number; date?: string }[]
      const oneDayAgo   = Date.now() - 24 * 60 * 60 * 1000
      const todayRaids  = recentRaids.filter(r => r.date && new Date(r.date).getTime() > oneDayAgo)
      if (todayRaids.length > 0) {
        addNotification({ type:"success", category:"discord", timestamp:now,
          message:`⚔️ ${todayRaids.length} raid target${todayRaids.length > 1 ? "s" : ""} posted in the last 24h` })
      }

      // Seed: Discord member count
      const members = data.community?.discord_members ?? 0
      if (members > 0) {
        addNotification({ type:"info", category:"discord", timestamp:now,
          message:`👥 Discord: ${members.toLocaleString()} members · ${data.community?.new_joins_24h ?? 0} joined today` })
      }

      // Seed: price status
      const price   = data.token_health?.price           ?? 0
      const change  = data.token_health?.price_change_24h ?? 0
      if (price > 0) {
        const emoji = change >= 5 ? "🚀" : change <= -5 ? "🔴" : "💰"
        addNotification({ type: change >= 5 ? "success" : change <= -5 ? "danger" : "info",
          category:"price", timestamp:now,
          message:`${emoji} $67 price: $${price.toFixed(6)}  (${change >= 0 ? "+" : ""}${change.toFixed(1)}% 24h)` })
      }

      // Seed: backend alerts
      for (const alert of (data.alerts ?? []) as { type: string; message: string; timestamp: string }[]) {
        addNotification({
          type:      alert.type === "danger" ? "danger" : alert.type === "success" ? "success" : "warning",
          category:  "price",
          timestamp: alert.timestamp ?? now,
          message:   alert.message,
        })
      }
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

    // ── 3. Discord alerts (spam / ban / kick / join spike) ───────────────────
    const currAct = data.community?.recent_discord_activity ?? []
    const prevAct = prev.community?.recent_discord_activity ?? []
    const prevKeys = new Set(prevAct.map(a => `${a.type}_${a.user}_${a.time_ago ?? ""}`))
    for (const act of currAct) {
      const key = `${act.type}_${act.user}_${act.time_ago ?? ""}`
      if (!prevKeys.has(key)) {
        if (act.type === "ban") {
          fireAlert({ type:"danger",  category:"discord", timestamp:now,
            message:`🚫 Discord ban: ${act.user}${act.reason ? ` — ${act.reason}` : ""}` })
        } else if (act.type === "kick") {
          fireAlert({ type:"warning", category:"discord", timestamp:now,
            message:`👢 Discord kick: ${act.user}${act.reason ? ` — ${act.reason}` : ""}` })
        } else if (act.type === "spam") {
          fireAlert({ type:"warning", category:"discord", timestamp:now,
            message:`⚠️ Discord spam detected: ${act.user}${act.reason ? ` — ${act.reason}` : ""}` })
        }
      }
    }

    // Discord new member spike (possible join spam / raid)
    const currJoins = data.community?.new_joins_24h ?? 0
    const prevJoins = prev.community?.new_joins_24h  ?? 0
    if (currJoins > prevJoins + 50 && prevJoins > 0) {
      fireAlert({ type:"info", category:"discord", timestamp:now,
        message:`🟢 Discord join spike: +${currJoins - prevJoins} new members (was ${prevJoins}, now ${currJoins})` })
    }

    // ── 4. Telegram raid feed activity ───────────────────────────────────────
    const currRaids = (data.raid_feed ?? []) as { message_id: number; date?: string }[]
    const prevRaids = (prev.raid_feed ?? [])  as { message_id: number; date?: string }[]
    const prevRaidIds = new Set(prevRaids.map(r => r.message_id))
    const newRaids = currRaids.filter(r => !prevRaidIds.has(r.message_id))
    if (newRaids.length >= 5) {
      // 5+ new raids posted = active raid session
      addNotification({ type:"success", category:"discord", timestamp:now,
        message:`⚔️ Raid wave: ${newRaids.length} new targets posted in Telegram raid group` })
    } else if (newRaids.length >= 1) {
      addNotification({ type:"info", category:"discord", timestamp:now,
        message:`⚔️ ${newRaids.length} new raid target${newRaids.length > 1 ? "s" : ""} posted` })
    }

    // ── 5. Backend alerts (price/holder/liquidity from data.json) ────────────
    const currAlerts = (data.alerts ?? []) as { type: string; message: string; timestamp: string }[]
    const prevAlerts = (prev.alerts ?? [])  as { type: string; message: string; timestamp: string }[]
    const prevAlertMsgs = new Set(prevAlerts.map(a => a.message))
    for (const alert of currAlerts) {
      if (!prevAlertMsgs.has(alert.message)) {
        addNotification({
          type:      alert.type === "danger" ? "danger" : alert.type === "success" ? "success" : "warning",
          category:  "price",
          timestamp: alert.timestamp ?? now,
          message:   alert.message,
        })
      }
    }

    // ── 6. New news articles ─────────────────────────────────────────────────
    const currNews = data.news_feed ?? []
    const prevNews = prev.news_feed ?? []
    const prevNewsIds = new Set(prevNews.map((n: { id: string }) => n.id))
    const newArticles = currNews.filter((n: { id: string }) => !prevNewsIds.has(n.id)).slice(0, 3)
    for (const article of newArticles as { id: string; title: string; source: string }[]) {
      addNotification({ type:"info", category:"news", timestamp:now,
        message:`📰 ${article.title} — ${article.source}` })
    }

    prevRef.current = data
  }, [data])
}

// ── Exported helper for manual use (e.g. team notes save) ────────────────────
export { addNotification }
