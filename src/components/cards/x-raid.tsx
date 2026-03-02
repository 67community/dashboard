"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { TweetRow } from "@/components/cards/x-live-feed"
import { useAppData } from "@/lib/data-context"
import type { RaidFeedItem } from "@/lib/use-data"

interface RaidNotif {
  id:   string
  text: string
  link: string
  time: string
}

function timeAgo(utcStr: string) {
  const d = new Date(utcStr.replace(" UTC","Z"))
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  return `${Math.floor(s/3600)}h ago`
}

type Tab = "notif" | "tg"

export function XRaidCard() {
  const [tab,     setTab]  = useState<Tab>("notif")
  const [items,   setItems] = useState<RaidNotif[]>([])
  const [newCount, setNew]  = useState(0)
  const lastIds = useRef<Set<string>>(new Set())
  const { data } = useAppData()
  const feed: RaidFeedItem[] = (data?.raid_feed ?? []) as RaidFeedItem[]

  useEffect(() => {
    function load(initial = false) {
      fetch("/api/raid-feed")
        .then(r => r.json())
        .then((d: RaidNotif[]) => {
          if (!Array.isArray(d)) return
          if (!initial) {
            const added = d.filter(x => !lastIds.current.has(x.id)).length
            if (added > 0) setNew(n => n + added)
          }
          lastIds.current = new Set(d.map(x => x.id))
          setItems(d)
        })
        .catch(() => {})
    }
    load(true)
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  // ── Tab bar ──
  const tabBar = (
    <div style={{ display:"flex", gap:6, marginBottom:12 }} onClick={e=>e.stopPropagation()}>
      {([["notif","𝕏 Notifications"], ["tg","Telegram Raid"]] as [Tab,string][]).map(([key, label]) => (
        <button key={key} onClick={()=>setTab(key)}
          style={{ flex:1, padding:"6px 8px", borderRadius:10, border:"none", cursor:"pointer",
            background: tab===key ? "#0A0A0A" : "#F4F4F5",
            color: tab===key ? "#fff" : "#6E6E73",
            fontSize:"0.6875rem", fontWeight:700, position:"relative" }}>
          {label}
          {key==="notif" && newCount > 0 && (
            <span style={{ position:"absolute", top:-4, right:-4,
              background:"#EF4444", color:"#fff", fontSize:"0.5rem",
              fontWeight:800, padding:"1px 5px", borderRadius:99 }}>{newCount}</span>
          )}
        </button>
      ))}
    </div>
  )

  // ── Notifications tab ──
  const notifView = (full = false) => (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {items.slice(0, full ? 100 : 3).map(item => (
        <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
          onClick={e=>e.stopPropagation()}
          style={{ textDecoration:"none", display:"block", padding:"8px 10px",
            borderRadius:10, background:"#F8F8FA", border:"1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ fontSize:"0.5625rem", fontWeight:800, color:"#0A0A0A", letterSpacing:"0.04em" }}>𝕏 NOTIFICATION</span>
            <span style={{ fontSize:"0.5625rem", color:"#A1A1AA" }}>{timeAgo(item.time)}</span>
          </div>
          <p style={{ fontSize:"0.6875rem", color:"#374151", lineHeight:1.4, margin:0,
            display:"-webkit-box", WebkitLineClamp: full ? 10 : 2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {item.text}
          </p>
        </a>
      ))}
      {items.length === 0 && (
        <div style={{ padding:"20px", textAlign:"center", color:"#A1A1AA", fontSize:"0.75rem" }}>
          😴 Henüz bildirim yok
        </div>
      )}
    </div>
  )

  // ── Telegram Raid tab ──
  const tgView = (full = false) => (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {feed.slice(0, full ? 100 : 3).map((item, i) => (
        <TweetRow key={i} item={item} compact />
      ))}
      {feed.length === 0 && (
        <div style={{ padding:"20px", textAlign:"center", color:"#A1A1AA", fontSize:"0.75rem" }}>
          😴 Henüz raid yok
        </div>
      )}
    </div>
  )

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {tabBar}
      {tab === "notif" ? notifView(false) : tgView(false)}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {tabBar}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:"0.625rem", fontWeight:800, color:"#8E8E93", textTransform:"uppercase", letterSpacing:"0.07em" }}>
          {tab === "notif" ? `${items.length} Notifications` : `${feed.length} Tweets`}
        </span>
        {tab === "notif" && newCount > 0 && (
          <button onClick={()=>setNew(0)} style={{ background:"#EF4444", color:"#fff",
            fontSize:"0.5625rem", fontWeight:800, padding:"1px 8px", borderRadius:99, border:"none", cursor:"pointer" }}>
            +{newCount} new · clear
          </button>
        )}
      </div>
      {tab === "notif" ? notifView(true) : tgView(true)}
    </div>
  )

  return (
    <DashboardCard
      title="X Raid Panel"
      subtitle="Notifications · Telegram Raid"
      icon={<span style={{ fontSize:"0.875rem", fontWeight:900 }}>𝕏</span>}
      accentColor="#0A0A0A"
      collapsed={collapsed}
      expanded={expanded}
      expandedMaxWidth={700}
    />
  )
}
