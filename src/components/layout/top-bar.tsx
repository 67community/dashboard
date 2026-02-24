"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RefreshCw, LayoutDashboard, KanbanSquare, AlertTriangle, CheckCircle2 } from "lucide-react"
import { TeamAvatarGroup } from "@/components/team/team-avatar"
import { useAppData } from "@/lib/data-context"
import { clsx } from "clsx"

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kanban", label: "Tasks", icon: KanbanSquare },
]

function timeAgo(date: Date | null): string {
  if (!date) return "—"
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export function TopBar() {
  const pathname = usePathname()
  const { lastFetched, loading, refresh, data } = useAppData()
  const alerts = data?.alerts ?? []

  return (
    <div className="sticky top-0 z-50">
      {/* Alert banner */}
      {alerts.length > 0 && (
        <div className="bg-red-600 text-white text-xs font-semibold px-5 py-2.5 flex items-center gap-2.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <div className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
            {alerts.map((a, i) => <span key={i}>{a.message}</span>)}
          </div>
        </div>
      )}

      {/* Main nav — dark like 67coin.com */}
      <header className="bg-[#0D0D0D] border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center shadow-lg shadow-amber-400/20">
                <span className="text-black font-black text-sm tracking-tight">67</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-sm tracking-wide">Mission Control</span>
              </div>
            </div>

            {/* Nav tabs */}
            <nav className="flex items-center gap-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    pathname === href
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right — sync + avatars */}
            <div className="flex items-center gap-4">
              <button onClick={refresh} disabled={loading}
                className="hidden sm:flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors">
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Syncing…" : timeAgo(lastFetched)}</span>
              </button>
              <TeamAvatarGroup />
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
