"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RefreshCw, Bell, X, Check, Settings, Moon, Sun } from "lucide-react"
import { TeamAvatarGroup } from "@/components/team/team-avatar"
import { useAppData } from "@/lib/data-context"
import { useNotifications, useDataNotifications } from "@/lib/use-notifications"
import { SettingsModal } from "@/components/layout/settings-modal"
import { loadAISettings } from "@/lib/ai-settings"
import { useTheme } from "@/lib/use-theme"

const LOGO = "https://raw.githubusercontent.com/67coin/67/main/logo.png"

const NAV = [
  { href: "/",             label: "Dashboard"       },
  { href: "/kanban",       label: "Tasks"           },
]

function timeAgo(d: Date | null) {
  if (!d) return "—"
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  return `${Math.floor(s/3600)}h ago`
}

function notifTimeAgo(ts: string) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

const CATEGORY_ICON: Record<string, string> = {
  price:   "💰", discord: "💬", news: "📰",
  note:    "📝", whale:   "🐋", system: "⚙️",
}
const TYPE_DOT: Record<string, string> = {
  danger: "#EF4444", warning: "#F59E0B", success: "#22C55E", info: "#3B82F6",
}

export function TopBar() {
  const path = usePathname()
  const { lastFetched, loading, refresh, data } = useAppData()
  const { notifs, unreadCount, markAllRead, clear } = useNotifications()
  const [bellOpen, setBellOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { dark, toggle: toggleTheme } = useTheme()
  const bellRef = useRef<HTMLDivElement>(null)

  // Show indicator dot if no API key set
  const [hasKey, setHasKey] = useState(true)
  useEffect(() => {
    const s = loadAISettings()
    const key = s.provider === "openai" ? s.openaiKey : s.claudeKey
    setHasKey(!!key || !!process.env.NEXT_PUBLIC_HAS_AI_KEY)
  }, [settingsOpen])

  // Watch data changes and auto-fire notifications
  useDataNotifications(data)

  // Also merge server-side alerts from data.json into notifications on first load
  const serverAlertsSeeded = useRef(false)
  useEffect(() => {
    if (!data?.alerts?.length || serverAlertsSeeded.current) return
    serverAlertsSeeded.current = true
    // (server alerts already in data.json just show as context — don't re-add)
  }, [data?.alerts])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleBellOpen = () => {
    setBellOpen(o => !o)
  }

  // Merge server alerts + local notifs (server alerts first, then local newest)
  const serverAlerts = data?.alerts ?? []
  const allItems = [
    ...serverAlerts.map(a => ({
      id:        `srv_${a.type}_${a.message.slice(0,20)}`,
      type:      a.type as "danger"|"warning"|"success"|"info",
      category:  "system" as const,
      message:   a.message,
      timestamp: a.timestamp ?? new Date().toISOString(),
      read:      false,
    })),
    ...notifs,
  ]

  const totalUnread = unreadCount + serverAlerts.length

  return (
    <div style={{ position:"sticky", top:0, zIndex:50 }}>
      <style>{`
        @media (max-width: 640px) {
          .topbar-inner      { padding: 0 14px !important; }
          .topbar-logo-text  { display: none !important; }
          .topbar-sync       { display: none !important; }
          .topbar-avatars    { display: none !important; }
          .topbar-nav a      { padding: 5px 12px !important; font-size: 0.75rem !important; }
        }
        @media (max-width: 400px) {
          .topbar-inner { padding: 0 10px !important; }
          .topbar-nav a { padding: 4px 10px !important; font-size: 0.6875rem !important; }
        }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bellShake {
          0%,100%{transform:rotate(0)} 20%{transform:rotate(-15deg)} 40%{transform:rotate(12deg)}
          60%{transform:rotate(-8deg)} 80%{transform:rotate(5deg)}
        }
        .bell-shake { animation: bellShake 0.5s ease; }
      `}</style>
      <header style={{
        background: "#0A0A0A",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        width: "100%",
      }}>
        <div style={{ maxWidth:1440, margin:"0 auto", padding:"0 32px" }} className="topbar-inner">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:52 }}>

            {/* Logo + name */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", overflow:"hidden", flexShrink:0,
                boxShadow:"0 0 12px rgba(245,166,35,0.45)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO} alt="67" width={30} height={30}
                  style={{ width:30, height:30, objectFit:"cover", display:"block" }} />
              </div>
              <span className="topbar-logo-text" style={{ fontSize:"0.8125rem", fontWeight:700,
                color:"rgba(255,255,255,0.85)", letterSpacing:"-0.01em" }}>
                Mission Control
              </span>
            </div>

            {/* Nav */}
            <nav className="topbar-nav" style={{
              display:"flex", alignItems:"center",
              background:"rgba(255,255,255,0.05)",
              borderRadius:8, padding:3, gap:1,
            }}>
              {NAV.map(({ href, label }) => (
                <Link key={href} href={href} style={{
                  padding:"5px 16px", borderRadius:6,
                  fontSize:"0.8125rem", fontWeight:600,
                  textDecoration:"none", transition:"all 0.12s",
                  letterSpacing:"-0.01em",
                  ...(path === href
                    ? { background:"#F5A623", color:"#000", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }
                    : { color:"rgba(255,255,255,0.38)" }),
                }}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <button onClick={refresh} disabled={loading}
                className="topbar-sync"
                style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.6875rem",
                  fontWeight:500, color:"rgba(255,255,255,0.28)", background:"none",
                  border:"none", cursor:"pointer" }}
                onMouseEnter={e => (e.currentTarget.style.color="rgba(255,255,255,0.65)")}
                onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.28)")}>
                <RefreshCw style={{ width:11, height:11 }} className={loading ? "animate-spin" : ""} />
                {loading ? "Syncing…" : timeAgo(lastFetched)}
              </button>

              {/* Bell */}
              <div ref={bellRef} style={{ position:"relative" }}>
                <button onClick={handleBellOpen} className={totalUnread > 0 ? "bell-shake" : ""}
                  style={{
                    position:"relative", background:"none", border:"none", cursor:"pointer",
                    padding:6, borderRadius:8, display:"flex", alignItems:"center",
                    justifyContent:"center", transition:"background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background="transparent")}>
                  <Bell style={{ width:17, height:17,
                    color: totalUnread > 0 ? "#F5A623" : "rgba(255,255,255,0.45)" }} />
                  {totalUnread > 0 && (
                    <span style={{
                      position:"absolute", top:2, right:2,
                      minWidth:14, height:14, borderRadius:99,
                      background:"#EF4444", border:"1.5px solid #0A0A0A",
                      fontSize:"0.5625rem", fontWeight:800, color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      padding:"0 3px",
                    }}>
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {bellOpen && (
                  <div style={{
                    position:"absolute", top:"calc(100% + 10px)", right:0,
                    width:"min(360px, calc(100vw - 24px))",
                    background:"rgba(14,14,16,0.97)",
                    backdropFilter:"blur(24px) saturate(180%)",
                    WebkitBackdropFilter:"blur(24px) saturate(180%)",
                    borderRadius:16, border:"1px solid rgba(255,255,255,0.09)",
                    boxShadow:"0 24px 56px rgba(0,0,0,0.55)",
                    zIndex:9999, overflow:"hidden",
                    animation:"fadeDown 0.18s ease-out",
                  }}>
                    {/* Header */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"14px 18px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize:"0.875rem", fontWeight:700, color:"#fff", letterSpacing:"-0.01em" }}>
                        Notifications
                        {totalUnread > 0 && (
                          <span style={{ background:"#EF4444", color:"#fff", fontSize:"0.625rem",
                            fontWeight:800, padding:"1px 6px", borderRadius:99, marginLeft:7 }}>
                            {totalUnread}
                          </span>
                        )}
                      </span>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {notifs.length > 0 && (
                          <button onClick={markAllRead}
                            style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.6875rem",
                              fontWeight:500, color:"rgba(255,255,255,0.4)", background:"none",
                              border:"none", cursor:"pointer", padding:"2px 6px", borderRadius:6 }}
                            onMouseEnter={e => (e.currentTarget.style.color="#F5A623")}
                            onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.4)")}>
                            <Check style={{ width:11, height:11 }} /> Mark read
                          </button>
                        )}
                        {notifs.length > 0 && (
                          <button onClick={clear}
                            style={{ fontSize:"0.6875rem", fontWeight:500, color:"rgba(255,255,255,0.25)",
                              background:"none", border:"none", cursor:"pointer", padding:"2px 6px",
                              borderRadius:6 }}
                            onMouseEnter={e => (e.currentTarget.style.color="#EF4444")}
                            onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.25)")}>
                            Clear
                          </button>
                        )}
                        <button onClick={() => setBellOpen(false)}
                          style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}>
                          <X style={{ width:14, height:14, color:"rgba(255,255,255,0.35)" }} />
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    <div style={{ maxHeight:340, overflowY:"auto" }}>
                      {allItems.length === 0 ? (
                        <div style={{ padding:"32px 18px", textAlign:"center" }}>
                          <p style={{ fontSize:"1.5rem", marginBottom:8 }}>🔕</p>
                          <p style={{ fontSize:"0.8125rem", color:"rgba(255,255,255,0.3)", fontWeight:500 }}>
                            No notifications yet
                          </p>
                        </div>
                      ) : allItems.map((item, i) => (
                        <div key={item.id} style={{
                          padding:"11px 18px",
                          borderBottom: i < allItems.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                          display:"flex", alignItems:"flex-start", gap:11,
                          background: item.read ? "transparent" : "rgba(245,166,35,0.03)",
                        }}>
                          {/* Category icon */}
                          <div style={{ flexShrink:0, marginTop:1, fontSize:"0.9375rem" }}>
                            {CATEGORY_ICON[item.category] ?? "🔔"}
                          </div>
                          {/* Content */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:"0.8125rem", color: item.read ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.9)",
                              lineHeight:1.45, fontWeight: item.read ? 400 : 500,
                              wordBreak:"break-word" }}>
                              {item.message}
                            </p>
                            <p style={{ fontSize:"0.625rem", color:"rgba(255,255,255,0.25)", marginTop:3 }}>
                              {notifTimeAgo(item.timestamp)}
                            </p>
                          </div>
                          {/* Unread dot */}
                          {!item.read && (
                            <div style={{ flexShrink:0, marginTop:5,
                              width:6, height:6, borderRadius:"50%",
                              background: TYPE_DOT[item.type] ?? "#F5A623" }} />
                          )}
                        </div>
                      ))}
                    </div>

                    {allItems.length > 0 && (
                      <div style={{ padding:"8px 18px", borderTop:"1px solid rgba(255,255,255,0.06)",
                        fontSize:"0.6875rem", color:"rgba(255,255,255,0.2)", textAlign:"center" }}>
                        {allItems.length} notification{allItems.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="topbar-avatars"><TeamAvatarGroup /></div>
            </div>

          </div>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
