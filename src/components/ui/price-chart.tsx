"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis } from "recharts"

interface Candle { t: number; o: number; h: number; l: number; c: number }

type Range = "1D" | "7D" | "30D"
const DAYS: Record<Range, string> = { "1D": "1", "7D": "7", "30D": "30" }

function fmtLabel(t: number, range: Range) {
  const d = new Date(t * 1000)
  if (range === "1D") return d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })
  return d.toLocaleDateString([], { month:"short", day:"numeric" })
}

function fmtPrice(n: number) {
  return n < 0.001 ? `$${n.toFixed(6)}` : `$${n.toFixed(5)}`
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Candle }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background:"rgba(10,10,10,0.92)", border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:10, padding:"8px 12px",
    }}>
      <p style={{ fontSize:"0.6875rem", color:"rgba(255,255,255,0.5)", marginBottom:3 }}>
        {new Date(d.t * 1000).toLocaleDateString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
      </p>
      <p style={{ fontSize:"0.9375rem", fontWeight:700, color:"#FFFFFF" }}>{fmtPrice(d.c)}</p>
    </div>
  )
}

interface Props { currentPrice?: number }

export function PriceChart({ currentPrice }: Props) {
  const [range,   setRange]   = useState<Range>("7D")
  const [data,    setData]    = useState<Candle[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setData([])
    fetch(`/api/chart?days=${DAYS[range]}`)
      .then(r => r.json())
      .then(j => { setData(j.candles ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [range])

  const prices = data.map(d => d.c)
  const min    = prices.length ? Math.min(...prices) * 0.995 : 0
  const max    = prices.length ? Math.max(...prices) * 1.005 : 1
  const first  = prices[0] ?? 0
  const last   = prices[prices.length - 1] ?? currentPrice ?? 0
  const up     = last >= first
  const pct    = first > 0 ? ((last - first) / first * 100) : 0
  const color  = up ? "#34C759" : "#FF3B30"

  return (
    <div style={{ background:"#F5F5F7", borderRadius:14, padding:"16px 16px 10px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
        <div>
          <p style={{ fontSize:"0.6875rem", fontWeight:600, letterSpacing:"0.06em",
            textTransform:"uppercase", color:"var(--tertiary)", marginBottom:5 }}>Price Chart</p>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.04em",
              color:"var(--foreground)", fontVariantNumeric:"tabular-nums" }}>
              {fmtPrice(last || currentPrice || 0)}
            </span>
            {prices.length > 0 && (
              <span style={{
                fontSize:"0.75rem", fontWeight:700, padding:"3px 9px", borderRadius:99,
                background: up ? "#E8F8EE" : "#FEF0F0",
                color: up ? "#1A8343" : "#C0392B",
              }}>
                {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}% {range}
              </span>
            )}
          </div>
        </div>

        {/* Range tabs */}
        <div style={{ display:"flex", gap:3, background:"rgba(0,0,0,0.06)", borderRadius:9, padding:3, flexShrink:0 }}>
          {(["1D","7D","30D"] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding:"4px 12px", borderRadius:6, border:"none", cursor:"pointer",
              fontSize:"0.75rem", fontWeight:600, transition:"all 0.15s",
              background: range === r ? "#FFFFFF" : "transparent",
              color:      range === r ? "#1D1D1F" : "#8E8E93",
              boxShadow:  range === r ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div style={{ height:120, opacity: loading ? 0.3 : 1, transition:"opacity 0.3s" }}>
        {loading || data.length === 0 ? (
          <div className="skeleton" style={{ width:"100%", height:"100%", borderRadius:8 }} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top:4, right:2, left:2, bottom:0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={[min, max]} hide />
              <XAxis dataKey="t" hide tickFormatter={t => fmtLabel(t, range)} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="c"
                stroke={color}
                strokeWidth={2}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r:4, fill:color, stroke:"#FFFFFF", strokeWidth:2 }}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
