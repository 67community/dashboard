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

// ── Ticker row ────────────────────────────────────────────────────────────────

function TickerRow({ item, large = false }: { item: MarketItem; large?: boolean }) {
  const up      = item.change_pct >= 0
  const color   = up ? "#059669" : "#DC2626"
  const bg      = up ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)"

  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: large ? "12px 14px" : "9px 12px",
      borderRadius: 12,
      border: "1.5px solid rgba(0,0,0,0.06)",
      background: "#fff",
      gap: 12,
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Emoji */}
      <span style={{ fontSize: large ? "1.375rem" : "1.125rem", flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: large ? "0.875rem" : "0.75rem", fontWeight: 700, color: "#1D1D1F", margin: 0, lineHeight: 1.2 }}>{item.name}</p>
        <p style={{ fontSize: "0.625rem", color: "#A1A1AA", margin: 0, marginTop: 1 }}>{item.symbol}</p>
      </div>

      {/* Price */}
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: large ? "1rem" : "0.875rem", fontWeight: 800, color: "#1D1D1F", margin: 0, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
          ${fmtPrice(item.price, item.kind)}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", marginTop: 2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "0.6875rem", fontWeight: 700, color, background: bg, borderRadius: 99, padding: "1px 6px" }}>
            {up
              ? <TrendingUp style={{ width: 9, height: 9 }} />
              : <TrendingDown style={{ width: 9, height: 9 }} />
            }
            {up ? "+" : ""}{item.change_pct.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Mini ticker strip (collapsed) ─────────────────────────────────────────────

function MiniTicker({ item }: { item: MarketItem }) {
  const up    = item.change_pct >= 0
  const color = up ? "#059669" : "#DC2626"
  return (
    <div className="inset-cell" style={{ textAlign: "center", padding: "8px 6px" }}>
      <p style={{ fontSize: "0.625rem", color: "#A1A1AA", margin: 0, marginBottom: 3 }}>{item.emoji} {item.name}</p>
      <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#1D1D1F", margin: 0, letterSpacing: "-0.02em" }}>
        ${fmtPrice(item.price, item.kind)}
      </p>
      <p style={{ fontSize: "0.625rem", fontWeight: 700, color, margin: 0, marginTop: 2 }}>
        {up ? "+" : ""}{item.change_pct.toFixed(2)}%
      </p>
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function MarketTickerCard() {
  const { data } = useAppData()
  const market: MarketItem[] = (data?.market_data ?? []) as MarketItem[]

  const crypto  = market.filter(m => m.kind === "crypto")
  const indices = market.filter(m => m.kind === "index")
  const btc     = market.find(m => m.symbol === "BTC-USD")

  // ── Collapsed ──────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* BTC hero */}
      <div>
        <p className="hero-label" style={{ marginBottom: 8 }}>Bitcoin</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <p className="hero-number">
            {btc ? `$${fmtPrice(btc.price, "crypto")}` : "—"}
          </p>
          {btc && (
            <span style={{
              fontSize: "0.875rem", fontWeight: 700,
              color: btc.change_pct >= 0 ? "#059669" : "#DC2626",
            }}>
              {btc.change_pct >= 0 ? "+" : ""}{btc.change_pct.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Mini grid: all 6 */}
      {market.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {market.map((item, i) => <MiniTicker key={i} item={item} />)}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 14 }}>
          <TrendingUp style={{ width: 20, height: 20, color: "#A1A1AA" }} />
          <p style={{ fontSize: "0.875rem", color: "#A1A1AA" }}>Loading market data…</p>
        </div>
      )}
    </div>
  )

  // ── Expanded ───────────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA", letterSpacing: "0.06em", textTransform: "uppercase" }}>Market Ticker</p>
          <p style={{ fontSize: "0.75rem", color: "#C7C7CC", marginTop: 2 }}>Yahoo Finance · 5 min refresh</p>
        </div>
        <div style={{
          background: btc ? (btc.change_pct >= 0 ? "#DCFCE7" : "#FEE2E2") : "#F3F4F6",
          borderRadius: 8, padding: "4px 10px",
          fontSize: "0.75rem", fontWeight: 700,
          color: btc ? (btc.change_pct >= 0 ? "#059669" : "#DC2626") : "#6B7280",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          {btc && (btc.change_pct >= 0
            ? <TrendingUp style={{ width: 12, height: 12 }} />
            : <TrendingDown style={{ width: 12, height: 12 }} />
          )}
          Market {btc && btc.change_pct >= 0 ? "Up" : "Down"}
        </div>
      </div>

      {/* Crypto section */}
      {crypto.length > 0 && (
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
            🔐 Crypto
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {crypto.map((item, i) => <TickerRow key={i} item={item} large />)}
          </div>
        </div>
      )}

      {/* Indices section */}
      {indices.length > 0 && (
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
            🏛️ Markets
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {indices.map((item, i) => <TickerRow key={i} item={item} large />)}
          </div>
        </div>
      )}

      {/* Empty */}
      {market.length === 0 && (
        <div className="inset-cell" style={{ textAlign: "center", padding: "32px 20px" }}>
          <TrendingUp style={{ width: 40, height: 40, color: "#D1D5DB", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "0.875rem", color: "#6B7280", fontWeight: 600 }}>Loading…</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#A1A1AA", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 10 }}>
        <RefreshCw style={{ width: 11, height: 11 }} />
        <span style={{ fontSize: "0.6875rem" }}>Yahoo Finance · BTC · ETH · SOL · NASDAQ · S&P 500 · Dow Jones</span>
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
