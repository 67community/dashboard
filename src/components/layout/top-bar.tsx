"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RefreshCw, Bell, X } from "lucide-react"
import { TeamAvatarGroup } from "@/components/team/team-avatar"
import { useAppData } from "@/lib/data-context"

const LOGO = "https://raw.githubusercontent.com/67coin/67/main/logo.png"

const NAV = [
  { href: "/",       label: "Dashboard" },
  { href: "/kanban", label: "Tasks"     },
]

function timeAgo(d: Date | null) {
  if (!d) return "—"
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  return `${Math.floor(s/3600)}h ago`
}

const ALERT_ICON: Record<string, string> = { danger:"🔴", success:"🟢", warning:"🟡", info:"🔵" }

export function TopBar() {
  const path = usePathname()
  const { lastFetched, loading, refresh, data } = useAppData()
  const alerts   = data?.alerts ?? []
  const hasAlert = alerts.length > 0
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div style={{ position:"sticky", top:0, zIndex:50 }}>
      <header style={{
        background: "#0A0A0A",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth:1440, margin:"0 auto", padding:"0 32px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:52 }}>

            {/* Logo + name */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", overflow:"hidden", flexShrink:0,
                boxShadow:"0 0 12px rgba(245,166,35,0.45)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO} alt="67" width={30} height={30}
                  style={{ width:30, height:30, objectFit:"cover", display:"block" }} />
              </div>
              <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"rgba(255,255,255,0.85)", letterSpacing:"-0.01em" }}>
                Mission Control
              </span>
            </div>

            {/* Nav — refined segmented control */}
            <nav style={{
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
                    : { color:"rgba(255,255,255,0.38)" }
                  ),
                }}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <button onClick={refresh} disabled={loading}
                style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.6875rem", fontWeight:500,
                  color:"rgba(255,255,255,0.28)", background:"none", border:"none", cursor:"pointer" }}
                onMouseEnter={e => (e.currentTarget.style.color="rgba(255,255,255,0.65)")}
                onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.28)")}>
                <RefreshCw style={{ width:11, height:11 }} className={loading ? "animate-spin" : ""} />
                {loading ? "Syncing…" : timeAgo(lastFetched)}
              </button>

              {/* Bell — always visible, opens alert dropdown */}
              <div ref={bellRef} style={{ position:"relative" }}>
                <button onClick={() => setBellOpen(o => !o)} style={{
                  position:"relative", background:"none", border:"none", cursor:"pointer",
                  padding:4, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"background 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Bell style={{ width:17, height:17, color: bellOpen ? "#F5A623" : "rgba(255,255,255,0.55)" }} />
                  {hasAlert && (
                    <span style={{
                      position:"absolute", top:2, right:2,
                      width:7, height:7, borderRadius:"50%",
                      background:"#EF4444", border:"1.5px solid #0A0A0A",
                    }} />
                  )}
                </button>

                {/* Dropdown panel */}
                {bellOpen && (
                  <div style={{
                    position:"absolute", top:"calc(100% + 10px)", right:0,
                    width:320, background:"rgba(18,18,20,0.96)",
                    backdropFilter:"blur(20px) saturate(180%)",
                    WebkitBackdropFilter:"blur(20px) saturate(180%)",
                    borderRadius:16,
                    border:"1px solid rgba(255,255,255,0.08)",
                    boxShadow:"0 20px 48px rgba(0,0,0,0.45)",
                    zIndex:200, overflow:"hidden",
                    animation:"fadeDown 0.18s ease-out",
                  }}>
                    {/* Header */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"14px 18px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize:"0.875rem", fontWeight:700, color:"#fff" }}>
                        Alerts {hasAlert && <span style={{ background:"#EF4444", color:"#fff", fontSize:"0.6875rem", fontWeight:800,
                          padding:"1px 6px", borderRadius:99, marginLeft:4 }}>{alerts.length}</span>}
                      </span>
                      <button onClick={() => setBellOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}>
                        <X style={{ width:14, height:14, color:"rgba(255,255,255,0.4)" }} />
                      </button>
                    </div>

                    {/* Alert list */}
                    <div style={{ maxHeight:280, overflowY:"auto" }}>
                      {alerts.length === 0 ? (
                        <div style={{ padding:"28px 18px", textAlign:"center" }}>
                          <p style={{ fontSize:"1.5rem", marginBottom:8 }}>✅</p>
                          <p style={{ fontSize:"0.8125rem", color:"rgba(255,255,255,0.35)", fontWeight:500 }}>All clear — no alerts</p>
                        </div>
                      ) : alerts.map((a, i) => (
                        <div key={i} style={{
                          padding:"12px 18px",
                          borderBottom: i < alerts.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                          display:"flex", alignItems:"flex-start", gap:10,
                        }}>
                          <span style={{ fontSize:"0.9375rem", flexShrink:0, marginTop:1 }}>
                            {ALERT_ICON[a.type] ?? "🔔"}
                          </span>
                          <div>
                            <p style={{ fontSize:"0.8125rem", color:"rgba(255,255,255,0.9)", lineHeight:1.45, fontWeight:500 }}>
                              {a.message}
                            </p>
                            {a.timestamp && (
                              <p style={{ fontSize:"0.6875rem", color:"rgba(255,255,255,0.3)", marginTop:3 }}>
                                {new Date(a.timestamp).toLocaleString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <style>{`@keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>

              <TeamAvatarGroup />
            </div>

          </div>
        </div>
      </header>
    </div>
  )
}
