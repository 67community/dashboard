"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis } from "recharts"

interface Candle { t: number; o: number; h: number; l: number; c: number; v: number }

const POOL = "DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6"

type Range = "1D" | "7D" | "30D"

const RANGE_CFG: Record<Range, { res: string; limit: number; label: (t: number) => string }> = {
  "1D":  { res:"hour",  limit:24, label: t => new Date(t*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) },
  "7D":  { res:"hour",  limit:168, label: t => new Date(t*1000).toLocaleDateString([],{weekday:"short"}) },
  "30D": { res:"day",   limit:30,  label: t => new Date(t*1000).toLocaleDateString([],{month:"short",day:"numeric"}) },
}

async function fetchOHLCV(res: string, limit: number): Promise<Candle[]> {
  const url = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${POOL}/ohlcv/${res}?limit=${limit}&currency=usd`
  const r = await fetch(url)
  if (!r.ok) return []
  const j = await r.json()
  const raw = j?.data?.attributes?.ohlcv_list ?? []
  return raw.map(([t, o, h, l, c, v]: number[]) => ({ t, o, h, l, c, v })).reverse()
}

function fmt(n: number) {
  return n < 0.001 ? `$${n.toFixed(6)}` : `$${n.toFixed(5)}`
}

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: {value: number; payload: Candle}[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const date = new Date(d.t * 1000)
  return (
    <div style={{
      background:"rgba(10,10,10,0.92)", border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:10, padding:"8px 12px",
    }}>
      <p style={{ fontSize:"0.6875rem", color:"rgba(255,255,255,0.5)", marginBottom:3 }}>
        {date.toLocaleString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
      </p>
      <p style={{ fontSize:"0.9375rem", fontWeight:700, color:"#FFFFFF" }}>{fmt(d.c)}</p>
    </div>
  )
}

interface Props { currentPrice?: number }

export function PriceChart({ currentPrice }: Props) {
  const [range,  setRange]  = useState<Range>("7D")
  const [data,   setData]   = useState<Candle[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { res, limit } = RANGE_CFG[range]
    setLoading(true)
    fetchOHLCV(res, limit).then(d => { setData(d); setLoading(false) })
  }, [range])

  const prices = data.map(d => d.c)
  const min = Math.min(...prices) * 0.995
  const max = Math.max(...prices) * 1.005
  const first = prices[0] ?? 0
  const last  = prices[prices.length - 1] ?? currentPrice ?? 0
  const up    = last >= first
  const pct   = first > 0 ? ((last - first) / first * 100) : 0
  const color = up ? "#34C759" : "#FF3B30"

  const chartData = data.map(d => ({ ...d, price: d.c }))

  return (
    <div style={{ background:"#F5F5F7", borderRadius:14, padding:"16px 16px 12px", marginBottom:0 }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div>
          <p style={{ fontSize:"0.6875rem", fontWeight:600, letterSpacing:"0.06em",
            textTransform:"uppercase", color:"#8E8E93", marginBottom:4 }}>Price Chart</p>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"1.375rem", fontWeight:800, letterSpacing:"-0.04em", color:"#1D1D1F" }}>
              {fmt(last || currentPrice || 0)}
            </span>
            <span style={{
              fontSize:"0.75rem", fontWeight:700, padding:"2px 8px", borderRadius:99,
              background: up ? "#E8F8EE" : "#FEF0F0",
              color: up ? "#1A8343" : "#C0392B",
            }}>
              {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}% {range}
            </span>
          </div>
        </div>

        {/* Range tabs */}
        <div style={{ display:"flex", gap:4, background:"rgba(0,0,0,0.06)", borderRadius:8, padding:3 }}>
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

      {/* Chart */}
      <div style={{ height:110, opacity: loading ? 0.4 : 1, transition:"opacity 0.2s" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top:4, right:0, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={[min, max]} hide />
              <XAxis dataKey="t" hide tickFormatter={RANGE_CFG[range].label} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={1.75}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r:4, fill:color, stroke:"#fff", strokeWidth:2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div className="skeleton" style={{ width:"100%", height:80 }} />
          </div>
        )}
      </div>
    </div>
  )
}
