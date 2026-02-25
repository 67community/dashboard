"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RefreshCw, AlertTriangle } from "lucide-react"
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

  return (
    <div style={{ position:"sticky", top:0, zIndex:50 }}>
      {/* Alert */}
      {alerts.length > 0 && (
        <div style={{ background:"#DC2626", color:"#fff", fontSize:"0.75rem", fontWeight:600, padding:"8px 24px", display:"flex", alignItems:"center", gap:8 }}>
          <AlertTriangle style={{ width:14, height:14, flexShrink:0 }} />
          {alerts.map((a, i) => <span key={i}>{a.message}</span>)}
        </div>
      )}

      {/* Nav — dark, 67coin brand */}
      <header style={{ background:"#0A0A0A", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:1440, margin:"0 auto", padding:"0 40px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>

            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, overflow:"hidden", boxShadow:"0 2px 14px rgba(245,166,35,0.50)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO} alt="67" width={34} height={34}
                  style={{ width:34, height:34, objectFit:"cover", borderRadius:"50%", display:"block" }} />
              </div>
              <span style={{ fontSize:"0.875rem", fontWeight:700, color:"rgba(255,255,255,0.88)", letterSpacing:"-0.01em" }}>
                Mission Control
              </span>
            </div>

            {/* Nav tabs */}
            <nav style={{ display:"flex", alignItems:"center", gap:2, background:"rgba(255,255,255,0.06)", borderRadius:12, padding:4 }}>
              {NAV.map(({ href, label }) => (
                <Link key={href} href={href}
                  style={{
                    padding:"7px 20px", borderRadius:9,
                    fontSize:"0.8125rem", fontWeight:600,
                    textDecoration:"none", transition:"all 0.15s",
                    ...(path === href
                      ? { background:"#F5A623", color:"#000" }
                      : { color:"rgba(255,255,255,0.4)" }
                    ),
                  }}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div style={{ display:"flex", alignItems:"center", gap:20 }}>
              <button onClick={refresh} disabled={loading}
                style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.75rem", fontWeight:500, color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer" }}
                onMouseEnter={e => (e.currentTarget.style.color="rgba(255,255,255,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.3)")}>
                <RefreshCw style={{ width:12, height:12 }} className={loading ? "animate-spin" : ""} />
                {loading ? "Syncing…" : timeAgo(lastFetched)}
              </button>
              <TeamAvatarGroup />
            </div>

          </div>
        </div>
      </header>
    </div>
  )
}
