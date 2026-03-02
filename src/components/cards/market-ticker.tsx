"use client"

import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { MarketItem } from "@/lib/use-data"

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(n: number, kind: string): string {
  if (kind === "index") return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  if (n >= 1)     return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

// ── Single pill ───────────────────────────────────────────────────────────────

function Pill({ item }: { item: MarketItem }) {
  const up    = item.change_pct >= 0
  const color = up ? "#059669" : "#DC2626"
  const bg    = up ? "rgba(5,150,105,0.09)" : "rgba(220,38,38,0.09)"

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#FFF",
      border: "1.5px solid var(--separator)",
      borderRadius: 99,
      padding: "4px 10px 4px 8px",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: "0.75rem", lineHeight: 1 }}>{item.emoji}</span>
      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
        {item.symbol.replace("-USD","").replace("=F","")}
      </span>
      <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
        ${fmtPrice(item.price, item.kind)}
      </span>
      <span style={{
        fontSize: "0.625rem", fontWeight: 700, color,
        background: bg, borderRadius: 99, padding: "1px 5px",
      }}>
        {up ? "▲" : "▼"}{Math.abs(item.change_pct).toFixed(2)}%
      </span>
    </div>
  )
}

// ── Scrollable ticker strip ───────────────────────────────────────────────────

function TickerStrip({ items }: { items: MarketItem[] }) {
  if (!items.length) return (
    <p style={{ fontSize: "0.8125rem", color: "var(--tertiary)" }}>Loading…</p>
  )
  return (
    <div style={{
      display: "flex", gap: 6, flexWrap: "wrap",
      overflowX: "auto", paddingBottom: 2,
    }}>
      {items.map((item, i) => <Pill key={i} item={item} />)}
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function MarketTickerCard() {
  const { data } = useAppData()
  const market: MarketItem[] = (data?.market_data ?? []) as MarketItem[]

  const crypto  = market.filter(m => m.kind === "crypto")
  const indices = market.filter(m => m.kind === "index")

  // ── Collapsed — all pills in one horizontal strip ─────────────────────────
  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <TickerStrip items={market} />
    </div>
  )

  // ── Expanded — separated by section with labels ───────────────────────────
  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {crypto.length > 0 && (
        <div>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--secondary)",
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
            🔐 Crypto
          </p>
          <TickerStrip items={crypto} />
        </div>
      )}

      {indices.length > 0 && (
        <div>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--secondary)",
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
            🏛️ Markets
          </p>
          <TickerStrip items={indices} />
        </div>
      )}

      {market.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--secondary)", fontSize: "0.875rem", padding: "20px 0" }}>
          Loading market data…
        </p>
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
      subtitle="BTC · ETH · SOL · NASDAQ · S&P 500"
      icon={<TrendingUp style={{ width: 16, height: 16, color: "#059669" }} />}
      accentColor="#059669"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
