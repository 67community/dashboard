"use client"

import { TrendingUp, RefreshCw } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { MarketItem } from "@/lib/use-data"

function fmtPrice(n: number, kind: string): string {
  if (kind === "index") return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  if (n >= 1)     return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

function CoinLogo({ symbol }: { symbol: string }) {
  const s = symbol.replace("-USD","").replace("=F","").toUpperCase()
  if (s === "BTC") return (
    <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F7931A"/>
      <path d="M22.5 14.2c.3-2.1-1.3-3.2-3.5-4l.7-2.8-1.7-.4-.7 2.7-1.3-.3.7-2.7-1.7-.4-.7 2.8-1.1-.3-2.4-.6-.4 1.8s1.3.3 1.2.3c.7.2.8.6.8 1l-2 7.9c-.1.2-.4.5-.9.4-0 .1-1.3-.3-1.3-.3l-.9 1.9 2.2.6 1.2.3-.7 2.8 1.7.4.7-2.8 1.3.3-.7 2.8 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2-.1-3.2-1.5-3.9 1-.3 1.8-1.1 2-2.7zm-3.6 5c-.5 2-3.9.9-5 .7l.9-3.5c1.1.3 4.7.8 4.1 2.8zm.5-5c-.5 1.8-3.3.9-4.3.7l.8-3.2c1 .2 4.1.7 3.5 2.5z" fill="white"/>
    </svg>
  )
  if (s === "ETH") return (
    <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path d="M16.5 4v8.87l7.5 3.35L16.5 4z" fill="white" fillOpacity=".6"/>
      <path d="M16.5 4L9 16.22l7.5-3.35V4z" fill="white"/>
      <path d="M16.5 21.97v6.03L24 17.62 16.5 21.97z" fill="white" fillOpacity=".6"/>
      <path d="M16.5 28v-6.03L9 17.62 16.5 28z" fill="white"/>
      <path d="M16.5 20.57l7.5-4.35-7.5-3.35v7.7z" fill="white" fillOpacity=".2"/>
      <path d="M9 16.22l7.5 4.35v-7.7L9 16.22z" fill="white" fillOpacity=".6"/>
    </svg>
  )
  if (s === "SOL") return (
    <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#9945FF"/>
      <path d="M9 21h14l-2.5 3H6.5L9 21zm0-6h14l-2.5 3H6.5L9 15zm2.5-6h14l-2.5 3H9l2.5-3z" fill="white"/>
    </svg>
  )
  return <span style={{ fontSize: "0.75rem" }}>🪙</span>
}

function Pill({ item }: { item: MarketItem }) {
  const up    = item.change_pct >= 0
  const color = up ? "#059669" : "#DC2626"
  const bg    = up ? "rgba(5,150,105,0.12)" : "rgba(220,38,38,0.12)"
  const sym   = item.symbol.replace("-USD","").replace("=F","").toUpperCase()
  const is67  = sym === "67" || item.emoji === "🟡"

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: is67 ? "rgba(245,166,35,0.08)" : "var(--fill-primary)",
      border: is67 ? "1.5px solid rgba(245,166,35,0.4)" : "1.5px solid var(--separator)",
      borderRadius: 99,
      padding: is67 ? "4px 8px 4px 5px" : "3px 7px 3px 4px",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      {is67
        ? <span style={{ fontSize: "0.6875rem" }}>{item.emoji}</span>
        : <CoinLogo symbol={item.symbol} />
      }
      <span style={{
        fontSize: is67 ? "0.6875rem" : "0.625rem",
        fontWeight: 700,
        color: is67 ? "#F5A623" : "var(--secondary)",
        letterSpacing: "-0.01em",
      }}>
        ${fmtPrice(item.price, item.kind)}
      </span>
      <span style={{
        fontSize: "0.5625rem", fontWeight: 700, color,
        background: bg, borderRadius: 99, padding: "1px 4px",
      }}>
        {up ? "▲" : "▼"}{Math.abs(item.change_pct).toFixed(1)}%
      </span>
    </div>
  )
}

function TickerStrip({ items }: { items: MarketItem[] }) {
  if (!items.length) return <p style={{ fontSize: "0.8125rem", color: "var(--tertiary)" }}>Loading…</p>
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingBottom: 2 }}>
      {items.map((item, i) => <Pill key={i} item={item} />)}
    </div>
  )
}

export function MarketTickerCard() {
  const { data } = useAppData()
  const market: MarketItem[] = (data?.market_data ?? []) as MarketItem[]
  const crypto = market.filter(m => m.kind === "crypto")

  const collapsed = <TickerStrip items={market} />

  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {crypto.length > 0 && (
        <div>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--secondary)",
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Crypto</p>
          <TickerStrip items={crypto} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--secondary)",
        borderTop: "1px solid var(--separator)", paddingTop: 10 }}>
        <RefreshCw style={{ width: 11, height: 11 }} />
        <span style={{ fontSize: "0.6875rem" }}>Yahoo Finance · 5 min refresh</span>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Market Ticker"
      subtitle="BTC · ETH · SOL · $67"
      icon={<TrendingUp style={{ width: 16, height: 16, color: "#059669" }} />}
      accentColor="#059669"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
