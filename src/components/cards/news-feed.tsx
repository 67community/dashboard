"use client"

import { ExternalLink, RefreshCw, Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { NewsItem } from "@/lib/use-data"

// ── source logos ──────────────────────────────────────────────────────────────

function GoogleNewsIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function RSSIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#F97316"/>
      <circle cx="7" cy="17" r="2" fill="white"/>
      <path d="M4 11a9 9 0 0 1 9 9" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M4 4a16 16 0 0 1 16 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

// ── sentiment badge ───────────────────────────────────────────────────────────

function SentimentBadge({ s }: { s?: string }) {
  if (!s || s === "neutral") return null
  const cfg = s === "positive"
    ? { color: "#059669", bg: "#DCFCE7", icon: <TrendingUp style={{ width: 9, height: 9 }} />, label: "Bullish" }
    : { color: "#DC2626", bg: "#FEE2E2", icon: <TrendingDown style={{ width: 9, height: 9 }} />, label: "Bearish" }
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:"0.5625rem", fontWeight:700, color:cfg.color, background:cfg.bg, borderRadius:99, padding:"2px 6px" }}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

// ── News row ──────────────────────────────────────────────────────────────────

function NewsRow({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
  const isCP = item.kind === "crypto_rss"
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{ borderRadius: 10, border: "1.5px solid var(--separator)", background: "var(--card)", padding: compact ? "8px 10px" : "10px 12px", transition: "box-shadow 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          {/* Source icon */}
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            {isCP ? <RSSIcon size={16} /> : <GoogleNewsIcon size={16} />}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: compact ? "0.6875rem" : "0.8125rem",
              fontWeight: 700, color: "var(--foreground)", margin: 0, lineHeight: 1.4,
              display: "-webkit-box", WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: "vertical", overflow: "hidden",
              marginBottom: 5,
            }}>
              {item.title}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.625rem", fontWeight: 600, color: isCP ? "#6366F1" : "#2563EB", background: isCP ? "rgba(99,102,241,0.08)" : "rgba(37,99,235,0.07)", borderRadius: 99, padding: "1px 6px" }}>
                {item.source}
              </span>
              <span style={{ fontSize: "0.625rem", color: "var(--tertiary)" }}>{item.time_ago}</span>
              <SentimentBadge s={item.sentiment} />
              <ExternalLink style={{ width: 9, height: 9, color: "var(--tertiary)", marginLeft: "auto" }} />
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function NewsFeedCard() {
  const { data } = useAppData()
  const news: NewsItem[] = (data?.news_feed ?? []) as NewsItem[]

  const googleNews  = news.filter(n => n.kind === "google")
  const cpNews      = news.filter(n => n.kind === "crypto_rss")
  const latest      = news.slice(0, 3)

  // ── Collapsed ──────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p className="hero-label" style={{ marginBottom: 8 }}>News Mentions</p>
        <p className="hero-number">{news.length > 0 ? news.length : "—"}</p>
        <p style={{ fontSize: "0.875rem", color: "var(--tertiary)", marginTop: 6 }}>
          {news.length > 0 ? `${googleNews.length} Google · ${cpNews.length} CryptoPanic` : "Refreshes every 2h"}
        </p>
      </div>

      {latest.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {latest.map((item, i) => <NewsRow key={i} item={item} compact />)}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--separator)", paddingTop: 14 }}>
          <Newspaper style={{ width: 20, height: 20, color: "var(--secondary)" }} />
          <p style={{ fontSize: "0.875rem", color: "var(--secondary)", fontWeight: 500 }}>No news found yet</p>
        </div>
      )}
    </div>
  )

  // ── Expanded ───────────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>News Feed</p>
          <p style={{ fontSize: "0.75rem", color: "var(--tertiary)", marginTop: 2 }}>Google News · CoinDesk · CoinTelegraph · Decrypt + 5 more</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(37,99,235,0.07)", borderRadius: 8, padding: "4px 10px" }}>
            <GoogleNewsIcon size={12} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#2563EB" }}>{googleNews.length}</span>
          </div>
          {cpNews.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(99,102,241,0.07)", borderRadius: 8, padding: "4px 10px" }}>
              <RSSIcon size={12} />
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6366F1" }}>{cpNews.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {news.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Total Articles", value: String(news.length),       color: "var(--foreground)" },
            { label: "Last 24h",       value: String(news.filter(n => { try { return Date.now() - new Date(n.published).getTime() < 86_400_000 } catch { return false } }).length), color: "#2563EB" },
            { label: "Bullish",        value: String(news.filter(n => n.sentiment === "positive").length || "—"), color: "#059669" },
          ].map(s => (
            <div key={s.label} className="inset-cell" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.125rem", fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "0.5625rem", color: "var(--tertiary)", marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Google News section */}
      {googleNews.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <GoogleNewsIcon size={14} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Google News</span>
            <span style={{ fontSize: "0.625rem", color: "var(--tertiary)", marginLeft: "auto" }}>{googleNews.length} articles</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {googleNews.map((item, i) => <NewsRow key={i} item={item} />)}
          </div>
        </div>
      )}

      {/* CryptoPanic section */}
      {cpNews.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <RSSIcon size={14} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Crypto News Sites</span>
            <span style={{ fontSize: "0.625rem", color: "var(--tertiary)", marginLeft: "auto" }}>{cpNews.length} articles</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cpNews.map((item, i) => <NewsRow key={i} item={item} />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {news.length === 0 && (
        <div className="inset-cell" style={{ textAlign: "center", padding: "32px 20px" }}>
          <Newspaper style={{ width: 40, height: 40, color: "var(--tertiary)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "0.875rem", color: "var(--secondary)", fontWeight: 600 }}>No news yet</p>
          <p style={{ fontSize: "0.75rem", color: "var(--secondary)", marginTop: 4 }}>Refreshes every 2 hours</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--secondary)", borderTop: "1px solid var(--separator)", paddingTop: 10 }}>
        <RefreshCw style={{ width: 11, height: 11 }} />
        <span style={{ fontSize: "0.6875rem" }}>Google News + CoinDesk, CoinTelegraph, Decrypt & 5 more · 2h refresh</span>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="News Feed"
      subtitle="Google News · CoinDesk · CoinTelegraph · Live"
      icon={<Newspaper style={{ width: 16, height: 16, color: "#2563EB" }} />}
      accentColor="#2563EB"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
