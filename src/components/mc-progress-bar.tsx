"use client"

import { useEffect, useRef, useState } from "react"

// ── Milestone scale (log-spaced, equal visual intervals) ──────────────────────
const MILESTONES = [0, 6_700_000, 67_000_000, 670_000_000, 6_700_000_000, 67_000_000_000]
const LABELS     = ["0", "6.7M", "67M", "670M", "6.7B", "67B"]
const N          = MILESTONES.length - 1 // 5 segments

/** Map a market cap value → 0..1 position on the visual bar */
function mcToPosition(mc: number): number {
  if (!mc || mc <= 0) return 0
  if (mc >= MILESTONES[N]) return 1

  for (let i = 0; i < N; i++) {
    const lo = MILESTONES[i]
    const hi = MILESTONES[i + 1]
    if (mc <= hi) {
      const t = (mc - lo) / (hi - lo)
      return (i + t) / N
    }
  }
  return 1
}

function fmtMC(n: number): string {
  if (!n || n <= 0) return "—"
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3)  return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

interface McProgressBarProps {
  mcap: number | null
}

export function McProgressBar({ mcap }: McProgressBarProps) {
  const mc       = mcap ?? 0
  const progress = mcToPosition(mc)           // 0..1
  const pct      = Math.max(progress * 100, 0.6) // minimum visible nub

  // Which milestone segment is active?
  const activeIdx = Math.max(0, MILESTONES.findIndex((m, i) => i > 0 && mc < m) - 1)

  // Animated fill on mount
  const [fillWidth, setFillWidth] = useState(0)
  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    requestAnimationFrame(() => {
      setTimeout(() => setFillWidth(pct), 120)
    })
  }, [pct])

  // Pulse glow on the tip
  const [glow, setGlow] = useState(true)
  useEffect(() => {
    const id = setInterval(() => setGlow(g => !g), 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 0,
      paddingTop: 16,
    }}>
      {/* Current MC label */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
      }}>
        <span style={{
          fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.09em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
        }}>
          Market Cap
        </span>
        <span style={{
          fontSize: "1.375rem", fontWeight: 900, color: "#FFFFFF",
          letterSpacing: "-0.04em", lineHeight: 1,
          textShadow: "0 0 28px rgba(245,166,35,0.5)",
        }}>
          {fmtMC(mc)}
        </span>
        <span style={{
          background: "rgba(245,166,35,0.15)",
          border: "1px solid rgba(245,166,35,0.28)",
          borderRadius: 99, padding: "2px 8px",
          fontSize: "0.625rem", fontWeight: 800,
          color: "#F5A623", letterSpacing: "0.04em",
        }}>
          {progress < 0.001 ? "<0.1%" : `${(progress * 100).toFixed(1)}%`} to 67B
        </span>
      </div>

      {/* Track */}
      <div style={{ position: "relative", width: "100%", maxWidth: "100%" }}>

        {/* Bar track */}
        <div style={{
          width: "100%", height: 14,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 99,
          overflow: "visible",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.07)",
          position: "relative",
        }}>
          {/* Overflow clip wrapper */}
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: 99, overflow: "hidden",
          }}>
            {/* Fill */}
            <div style={{
              height: "100%",
              width: `${fillWidth}%`,
              borderRadius: 99,
              background: "linear-gradient(90deg, #22C55E 0%, #16A34A 20%, #F59E0B 75%, #F5A623 100%)",
              boxShadow: "0 0 24px rgba(245,166,35,0.45)",
              transition: "width 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
            }} />
          </div>

          {/* Milestone tick marks on the bar */}
          {MILESTONES.slice(1, -1).map((_, i) => {
            const pos = ((i + 1) / N) * 100
            const passed = MILESTONES[i + 1] <= mc
            return (
              <div key={i} style={{
                position: "absolute",
                left: `${pos}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 1,
                height: 8,
                background: passed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
                borderRadius: 1,
                zIndex: 2,
                transition: "all 0.4s ease",
              }} />
            )
          })}

          {/* Glowing tip circle */}
          {fillWidth > 0.4 && (
            <div style={{
              position: "absolute",
              left: `${fillWidth}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 18, height: 18, borderRadius: "50%",
              background: "radial-gradient(circle, #FBBF24, #F5A623)",
              boxShadow: glow
                ? "0 0 0 5px rgba(245,166,35,0.25), 0 0 20px rgba(245,166,35,0.7)"
                : "0 0 0 2px rgba(245,166,35,0.1), 0 0 10px rgba(245,166,35,0.3)",
              transition: "box-shadow 0.9s ease, left 1.8s cubic-bezier(0.22,1,0.36,1)",
              border: "2.5px solid rgba(255,255,255,0.95)",
              zIndex: 3,
            }} />
          )}
        </div>

        {/* Milestone labels */}
        <div style={{ position: "relative", height: 22, marginTop: 6 }}>
          {LABELS.map((label, i) => {
            const pos    = (i / N) * 100
            const passed = MILESTONES[i] <= mc
            const isLast = i === N
            return (
              <span key={i} style={{
                position: "absolute",
                left: `${pos}%`,
                transform: i === 0 ? "none" : i === N ? "translateX(-100%)" : "translateX(-50%)",
                fontSize: isLast ? "0.75rem" : "0.6875rem",
                fontWeight: isLast ? 900 : passed ? 700 : 400,
                color: isLast
                  ? "#F5A623"
                  : passed
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.28)",
                letterSpacing: isLast ? "-0.01em" : "0",
                textShadow: isLast ? "0 0 16px rgba(245,166,35,0.7)" : "none",
                whiteSpace: "nowrap",
                transition: "all 0.4s ease",
              }}>
                {label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Target label */}
      <p style={{
        marginTop: 12,
        fontSize: "0.625rem", fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.18)",
      }}>
        #67to67Billion
      </p>
    </div>
  )
}
