"use client"

import { useState, useEffect } from "react"

export type DiscordStatus = "online" | "idle" | "dnd" | "offline"

// Fetches /api/presence every 60s
// Returns { [discord_id]: "online"|"idle"|"dnd"|"offline" }
export function usePresence(): Record<string, DiscordStatus> {
  const [presence, setPresence] = useState<Record<string, DiscordStatus>>({})

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const r = await fetch("/api/presence")
        if (r.ok) setPresence(await r.json())
      } catch {}
    }
    fetch_()
    const id = setInterval(fetch_, 60_000)
    return () => clearInterval(id)
  }, [])

  return presence
}

export const STATUS_COLOR: Record<DiscordStatus, string> = {
  online:  "#23A559",  // Discord green
  idle:    "#F0B232",  // Discord yellow
  dnd:     "#F23F42",  // Discord red
  offline: "#82858A",  // Discord gray
}

export const STATUS_LABEL: Record<DiscordStatus, string> = {
  online:  "Online",
  idle:    "Idle",
  dnd:     "Do Not Disturb",
  offline: "Offline",
}
