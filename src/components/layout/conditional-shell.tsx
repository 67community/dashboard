"use client"

import { usePathname } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const isPublic = path.startsWith("/submit")

  if (isPublic) {
    return <>{children}</>
  }

  return (
    <>
      {/* Ambient blobs */}
      <div aria-hidden style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-10%", left:"-5%",  width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)", filter:"blur(40px)" }} />
        <div style={{ position:"absolute", top:"30%",  right:"-8%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",  filter:"blur(40px)" }} />
        <div style={{ position:"absolute", bottom:"5%",left:"20%",  width:700, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)", filter:"blur(50px)" }} />
      </div>
      <TopBar />
      <main className="page-main">{children}</main>
    </>
  )
}
