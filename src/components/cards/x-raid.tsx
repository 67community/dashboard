"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { TweetRow } from "@/components/cards/x-live-feed"
import { useAppData } from "@/lib/data-context"
import type { RaidFeedItem } from "@/lib/use-data"

interface RaidNotif { id: string; text: string; link: string; time: string }

function timeAgo(utcStr: string) {
  const d = new Date(utcStr.replace(" UTC","Z"))
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  return `${Math.floor(s/3600)}h ago`
}

export function XRaidCard() {
  const [tab,      setTab]  = useState<"notif"|"tg">("notif")
  const [items,    setItems] = useState<RaidNotif[]>([])
  const [newCount, setNew]   = useState(0)
  const lastIds = useRef<Set<string>>(new Set())
  const { data } = useAppData()
  const feed: RaidFeedItem[] = (data?.raid_feed ?? []) as RaidFeedItem[]

  useEffect(() => {
    function load(initial = false) {
      fetch("/api/raid-feed").then(r=>r.json()).then((d: RaidNotif[]) => {
        if (!Array.isArray(d)) return
        if (!initial) {
          const added = d.filter(x => !lastIds.current.has(x.id)).length
          if (added > 0) setNew(n => n + added)
        }
        lastIds.current = new Set(d.map(x => x.id))
        setItems(d)
      }).catch(()=>{})
    }
    load(true)
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  const panel = (
    <div style={{ display:"flex", flexDirection:"column" }}>
      {/* Tab bar */}
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {(["notif","tg"] as const).map(key => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex:1, padding:"6px 8px", borderRadius:10, border:"none", cursor:"pointer",
              background: tab===key ? "#0A0A0A" : "#F4F4F5",
              color: tab===key ? "#fff" : "#6E6E73",
              fontSize:"0.6875rem", fontWeight:700, position:"relative" }}>
            {key === "notif" ? "𝕏 Notifications" : "Telegram Raid"}
            {key==="notif" && newCount > 0 && (
              <span style={{ position:"absolute", top:-4, right:-4,
                background:"#EF4444", color:"#fff", fontSize:"0.5rem",
                fontWeight:800, padding:"1px 5px", borderRadius:99 }}>{newCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* X Notifications */}
      {tab === "notif" && (
        <div style={{ maxHeight:300, overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>
          {items.length === 0
            ? <div style={{ padding:20, textAlign:"center", color:"var(--secondary)", fontSize:"0.75rem" }}>😴 Henüz bildirim yok</div>
            : items.map(item => (
                <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration:"none", display:"block", padding:"8px 10px",
                    borderRadius:10, background:"#F8F8FA", border:"1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:"0.5625rem", fontWeight:800, color:"#0A0A0A" }}>𝕏 NOTIFICATION</span>
                    <span style={{ fontSize:"0.5625rem", color:"var(--secondary)" }}>{timeAgo(item.time)}</span>
                  </div>
                  <p style={{ fontSize:"0.6875rem", color:"var(--foreground)", lineHeight:1.4, margin:0,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {item.text}
                  </p>
                </a>
              ))}
        </div>
      )}

      {/* Telegram Raid */}
      {tab === "tg" && (
        <div style={{ maxHeight:300, overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>
          {feed.length === 0
            ? <div style={{ padding:20, textAlign:"center", color:"var(--secondary)", fontSize:"0.75rem" }}>😴 Henüz raid yok</div>
            : feed.map((item, i) => <TweetRow key={i} item={item} compact />)}
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="X Raid Panel"
      subtitle="Notifications · Telegram Raid"
      icon={<span style={{ fontSize:"0.875rem", fontWeight:900 }}>𝕏</span>}
      accentColor="#0A0A0A"
      collapsed={panel}
      expanded={panel}
      expandedMaxWidth={700}
      noAutoOpen
    />
  )
}
