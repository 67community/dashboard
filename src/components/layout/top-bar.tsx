"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RefreshCw, LayoutDashboard, Kanban } from "lucide-react"
import { TeamAvatarGroup } from "@/components/team/team-avatar"
import { clsx } from "clsx"

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kanban", label: "Tasks", icon: Kanban },
]

export function TopBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-base tracking-tight">67</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">Mission Control</h1>
              <p className="text-xs text-gray-400 mt-0.5">The Official 67 Coin</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  pathname === href
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Synced 2m ago</span>
            </div>
            <TeamAvatarGroup />
          </div>
        </div>
      </div>
    </header>
  )
}
