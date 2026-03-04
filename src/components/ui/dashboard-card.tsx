"use client"

import { useState, ReactNode, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X, Maximize2 } from "lucide-react"

interface Props {
  title: string
  subtitle?: string
  icon: ReactNode
  accentColor: string
  collapsed: ReactNode
  expanded: ReactNode
  className?: string
  liveTag?: boolean
  onOpen?: () => void
  onClose?: () => void
  expandedMaxWidth?: number
  noAutoOpen?: boolean   // disable card-level click → only expand icon opens modal
  compact?: boolean      // smaller header + tighter padding
}

export function DashboardCard({
  title, subtitle, icon, accentColor, collapsed, expanded, className = "", liveTag, onOpen, onClose, noAutoOpen, compact, expandedMaxWidth
}: Props) {
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollY               = useRef(0)

  // Portal needs document to be available (SSR guard)
  useEffect(() => { setMounted(true) }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      scrollY.current = window.scrollY
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); onClose?.() } }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  const modal = open && mounted ? createPortal(
    <div
      className="mc-modal-wrap"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.40)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "fade-in 0.18s ease both",
        }}
        onClick={() => setOpen(false)}
      />

      {/* Sheet */}
      <div
        className="anim-slide-up mc-modal-sheet"
        style={{
          position: "relative",
          width: "100%", maxWidth: expandedMaxWidth ?? 560,
          maxHeight: "88vh",
          display: "flex", flexDirection: "column",
          background: "var(--card)",
          borderRadius: 24,
          boxShadow:
            "0 0 0 0.5px rgba(0,0,0,0.08), " +
            "0 8px 32px rgba(0,0,0,0.12), " +
            "0 40px 80px rgba(0,0,0,0.16)",
          overflow: "hidden",
        }}
      >
        {/* Accent line */}
        <div style={{ height: 3, background: `linear-gradient(90deg,${accentColor},${accentColor}33)`, flexShrink: 0 }} />

        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1, letterSpacing: "-0.01em" }}>{title}</p>
              {subtitle && <p style={{ fontSize: "0.8125rem", color: "var(--tertiary)", marginTop: 3, fontWeight: 500 }}>{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); onClose?.() }}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--fill-primary)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--input-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--fill-primary)")}
          >
            <X style={{ width: 14, height: 14, color: "var(--secondary)" }} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", flex: 1, padding: 24 }}>{expanded}</div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      {/* ── Grid tile ───────────────────────────────────────── */}
      <div
        onClick={noAutoOpen ? undefined : () => { setOpen(true); onOpen?.() }}
        className={`mc-card ${noAutoOpen ? "" : "mc-card-hover"} flex flex-col overflow-hidden ${noAutoOpen ? "" : "select-none"} ${className}`}
        style={{ cursor: noAutoOpen ? "default" : "pointer", position: "relative", height: "100%", width: "100%" }}
      >
        {/* Stripe-style ambient glow — unique per card */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(ellipse at 0% 0%, ${accentColor}14 0%, transparent 55%)`,
        }} />
        {/* Diagonal ray lines — subtle, matching hero */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `repeating-linear-gradient(112deg, transparent, transparent 22px, ${accentColor}07 22px, ${accentColor}07 23px)`,
        }} />

        {/* Accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg,${accentColor},${accentColor}33)`, flexShrink: 0, position: "relative", zIndex: 1 }} />

        <div className="mc-card-body" style={compact ? { gap: 8, paddingBottom: 12 } : undefined}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div>
                <p style={{ fontSize: compact ? "0.8125rem" : "0.9375rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1, letterSpacing: "-0.01em" }}>{title}</p>
                {!compact && subtitle && <p style={{ fontSize: "0.8125rem", color: "var(--tertiary)", marginTop: 3, fontWeight: 500 }}>{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {liveTag && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: "0.625rem", fontWeight: 700, color: "#059669",
                  background: "#ECFDF5", padding: "2px 8px", borderRadius: 99,
                }}>
                  <span className="dot-on" style={{ width: 6, height: 6 }} />
                  LIVE
                </span>
              )}
              <button
                onClick={e => { e.stopPropagation(); setOpen(true); onOpen?.() }}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--fill-primary)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--input-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--fill-primary)")}
              >
                <Maximize2 style={{ width: 12, height: 12, color: "var(--secondary)" }} />
              </button>
            </div>
          </div>

          {/* Collapsed body */}
          <div className="flex-1" style={compact ? { overflow: "hidden" } : undefined}>{collapsed}</div>
        </div>
      </div>

      {/* ── Modal (portal → document.body) ─────────────────── */}
      {modal}
    </>
  )
}
