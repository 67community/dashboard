"use client"

import { ExternalLink, RefreshCw, Zap } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { RaidFeedItem } from "@/lib/use-data"

// ── X (Twitter) logo ──────────────────────────────────────────────────────────

function XLogo({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return "just now"
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  } catch { return "" }
}

function extractHandle(text: string): string {
  const m = text.match(/@(\w+)/)
  return m ? `@${m[1]}` : ""
}

// ── Tweet row ─────────────────────────────────────────────────────────────────

export function TweetRow({ item, compact = false }: { item: RaidFeedItem; compact?: boolean }) {
  const handle  = extractHandle(item.text)
  const hasLink = !!item.tweet_url

  return (
    <div style={{
      borderRadius: 10,
      border: "1.5px solid var(--separator)",
      background: "var(--card)",
      padding: compact ? "8px 10px" : "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "#0A0A0A",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <XLogo size={11} />
          </div>
          {handle && (
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--foreground)" }}>{handle}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.625rem", color: "var(--tertiary)" }}>{timeAgo(item.date)}</span>
          {hasLink && (
            <a href={item.tweet_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: "0.625rem", fontWeight: 700,
                color: "#fff", background: "#0A0A0A",
                borderRadius: 99, padding: "2px 7px", textDecoration: "none",
              }}>
              <XLogo size={9} />View
            </a>
          )}
        </div>
      </div>

      {/* Tweet text */}
      <p style={{
        fontSize: compact ? "0.6875rem" : "0.75rem",
        color: "var(--foreground)",
        lineHeight: 1.5,
        margin: 0,
        display: "-webkit-box",
        WebkitLineClamp: compact ? 2 : 4,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {item.text || "(no text)"}
      </p>

      {/* Photo if any */}
      {!compact && item.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.photo} alt="" style={{
          width: "100%", maxHeight: 140, objectFit: "cover",
          borderRadius: 8, marginTop: 2,
        }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
      )}
    </div>
  )
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export function XLiveFeedCard() {
  const { data } = useAppData()
  const feed: RaidFeedItem[] = (data?.raid_feed ?? []) as RaidFeedItem[]
  const latest = feed.slice(0, 3)

  // ── Collapsed ──────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header stat */}
      <div>
        <p className="hero-label" style={{ marginBottom: 8 }}>Live X Posts</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <p className="hero-number">{feed.length > 0 ? feed.length : "—"}</p>
          {feed.length > 0 && (
            <span style={{ fontSize: "0.75rem", color: "var(--tertiary)" }}>tweets tracked</span>
          )}
        </div>
        {latest[0] && (
          <p style={{ fontSize: "0.75rem", color: "var(--tertiary)", marginTop: 4 }}>
            Last: {timeAgo(latest[0].date)}
          </p>
        )}
      </div>

      {/* Latest 2 tweets */}
      {latest.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {latest.slice(0, 2).map((item, i) => (
            <TweetRow key={i} item={item} compact />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--separator)", paddingTop: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <XLogo size={14} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--secondary)", fontWeight: 500 }}>
            Waiting for tweets…
          </p>
        </div>
      )}
    </div>
  )

  // ── Expanded ───────────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Telegram Raid Group
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--tertiary)", marginTop: 2 }}>Real-time $67coin tweets</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Live pulse */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(239,68,68,0.08)", borderRadius: 99, padding: "4px 10px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", display: "block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#EF4444" }}>LIVE</span>
          </div>
          <div style={{ background: "#0A0A0A", borderRadius: 8, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
            <XLogo size={12} />{feed.length}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {feed.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Total Tweets",  value: String(feed.length), color: "#0A0A0A" },
            { label: "With Links",    value: String(feed.filter(f => f.tweet_url).length), color: "#2563EB" },
            { label: "Last 24h",      value: String(feed.filter(f => { try { return Date.now() - new Date(f.date).getTime() < 86_400_000 } catch { return false } }).length), color: "#10B981" },
          ].map(s => (
            <div key={s.label} className="inset-cell" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.25rem", fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "0.5625rem", color: "var(--tertiary)", marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full feed */}
      {feed.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
          {feed.map((item, i) => (
            <TweetRow key={i} item={item} />
          ))}
        </div>
      ) : (
        <div className="inset-cell" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <XLogo size={22} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--secondary)", fontWeight: 600 }}>No tweets yet</p>
          <p style={{ fontSize: "0.75rem", color: "var(--secondary)", marginTop: 4 }}>
            Waiting for new $67coin tweets from Telegram feed
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--secondary)", borderTop: "1px solid var(--separator)", paddingTop: 10 }}>
        <RefreshCw style={{ width: 11, height: 11 }} />
        <span style={{ fontSize: "0.6875rem" }}>
          Synced from Telegram channel · updates every cron run
        </span>
        <a href="https://x.com/search?q=%2467coin&src=typed_query&f=live"
          target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: "0.6875rem", fontWeight: 600, color: "#0A0A0A", textDecoration: "none" }}>
          Search X <ExternalLink style={{ width: 9, height: 9 }} />
        </a>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Telegram Raid Group"
      subtitle="Real-time $67coin tweets · Live"
      icon={
        <span style={{ display: "flex", background: "#0A0A0A", borderRadius: 6, padding: 3 }}>
          <XLogo size={10} />
        </span>
      }
      accentColor="#0A0A0A"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
