"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RefreshCw, Bell } from "lucide-react"
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

export function TopBar() {
  const path = usePathname()
  const { lastFetched, loading, refresh, data } = useAppData()
  const alerts = data?.alerts ?? []
  const hasAlert = alerts.length > 0

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

              {/* Alert bell — replaces the ugly full-width red bar */}
              {hasAlert && (
                <div style={{ position:"relative", cursor:"pointer" }}
                  title={alerts.map(a => a.message).join(" · ")}>
                  <Bell style={{ width:16, height:16, color:"rgba(255,255,255,0.5)" }} />
                  <span style={{
                    position:"absolute", top:-3, right:-3,
                    width:7, height:7, borderRadius:"50%",
                    background:"#EF4444",
                    border:"1.5px solid #0A0A0A",
                  }} />
                </div>
              )}

              <TeamAvatarGroup />
            </div>

          </div>
        </div>
      </header>
    </div>
  )
}
