"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { TeamAvatarGroup } from "@/components/team/team-avatar"
import { useAppData } from "@/lib/data-context"
import { clsx } from "clsx"

const NAV = [
  { href: "/",        label: "Dashboard" },
  { href: "/kanban",  label: "Tasks"     },
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
    <div className="sticky top-0 z-50">
      {/* ── Alert banner ── */}
      {alerts.length > 0 && (
        <div style={{ background: "#C0392B" }} className="text-white text-xs font-semibold px-6 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {alerts.map((a, i) => <span key={i}>{a.message}</span>)}
        </div>
      )}

      {/* ── Nav bar — dark as per 67coin.com ── */}
      <header style={{ background: "#0D0D0D", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center"
                style={{ boxShadow: "0 2px 12px rgba(245,166,35,0.40)" }}>
                <span className="text-black font-black text-sm">67</span>
              </div>
              <span className="text-sm font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.90)" }}>
                Mission Control
              </span>
            </div>

            {/* Nav pills */}
            <nav className="flex items-center gap-0.5 rounded-2xl p-1" style={{ background: "rgba(255,255,255,0.07)" }}>
              {NAV.map(({ href, label }) => (
                <Link key={href} href={href}
                  className={clsx(
                    "px-5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200",
                    path === href
                      ? "text-black"
                      : "hover:text-white"
                  )}
                  style={path === href
                    ? { background: "#F5A623", color: "#000" }
                    : { color: "rgba(255,255,255,0.45)" }
                  }>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right — sync + avatars */}
            <div className="flex items-center gap-5">
              <button onClick={refresh} disabled={loading}
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.color="rgba(255,255,255,0.70)")}
                onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
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
