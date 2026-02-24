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
        <div className="bg-[#FF3B30] text-white text-xs font-semibold px-6 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {alerts.map((a, i) => <span key={i}>{a.message}</span>)}
        </div>
      )}

      {/* ── Nav bar — frosted glass like macOS ── */}
      <header
        className="border-b"
        style={{
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center shadow-sm"
                style={{ boxShadow: "0 2px 8px rgba(245,166,35,0.35)" }}>
                <span className="text-black font-black text-sm">67</span>
              </div>
              <span className="text-sm font-bold text-[#1D1D1F] tracking-tight">Mission Control</span>
            </div>

            {/* Nav */}
            <nav className="flex items-center gap-0.5 bg-[#F5F5F7] rounded-2xl p-1">
              {NAV.map(({ href, label }) => (
                <Link key={href} href={href}
                  className={clsx(
                    "px-5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200",
                    path === href
                      ? "bg-white text-[#1D1D1F] shadow-sm"
                      : "text-[#6E6E73] hover:text-[#1D1D1F]"
                  )}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-5">
              <button onClick={refresh} disabled={loading}
                className="hidden sm:flex items-center gap-1.5 text-[#8E8E93] hover:text-[#1D1D1F] text-xs font-medium transition-colors">
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
