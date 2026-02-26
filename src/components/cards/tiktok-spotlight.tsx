"use client"

import { ExternalLink, Eye, RefreshCw } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { TikTokVideo } from "@/lib/use-data"

// ── TikTok logo SVG ───────────────────────────────────────────────────────────

function TikTokLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3 6.34 6.34 0 009.49 21.64a6.34 6.34 0 006.34-6.34V9.01a8.16 8.16 0 004.77 1.52V7.07a4.85 4.85 0 01-1.01-.38z"
        fill="currentColor"
      />
    </svg>
  )
}

// ── Time ago helper ───────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  } catch { return "recently" }
}

// ── Video tile ────────────────────────────────────────────────────────────────

function VideoTile({ v, large = false }: { v: TikTokVideo; large?: boolean }) {
  const thumb = v.thumbnail_url
  const thumbH = large ? 200 : 110

  return (
    <a
      href={v.video_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: "1.5px solid rgba(0,0,0,0.07)",
          background: "#0A0A0A",
          transition: "transform 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {/* Thumbnail */}
        <div style={{
          width: "100%", height: thumbH,
          background: "#1A1A1A",
          position: "relative", overflow: "hidden",
        }}>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt="TikTok video"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #1A1A1A, #2A2A2A)",
            }}>
              <TikTokLogo size={32} />
            </div>
          )}

          {/* TikTok watermark */}
          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(0,0,0,0.55)", borderRadius: 6,
            padding: "3px 6px", display: "flex", alignItems: "center", gap: 4,
          }}>
            <TikTokLogo size={11} />
            {v.views_text && (
              <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: "#fff" }}>
                {v.views_text}
              </span>
            )}
          </div>

          {/* Play button */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}>
              <div style={{
                width: 0, height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "10px solid rgba(255,255,255,0.9)",
                marginLeft: 2,
              }} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "9px 11px", background: "#FFFFFF" }}>
          {v.creator && (
            <p style={{
              fontSize: "0.75rem", fontWeight: 700, color: "#09090B",
              marginBottom: 3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
            }}>
              @{v.creator}
            </p>
          )}
          {large && v.description && (
            <p style={{
              fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.45, marginBottom: 5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {v.description}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {v.views_text && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.6875rem", color: "#A1A1AA", fontWeight: 500 }}>
                <Eye style={{ width: 11, height: 11 }} />{v.views_text}
              </span>
            )}
            <span style={{ fontSize: "0.6875rem", color: "#C7C7CC", marginLeft: "auto" }}>
              {timeAgo(v.scraped_at)}
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ tag, href }: { tag: string; href: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 10,
    }}>
      <span style={{
        fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: "#6B7280",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <TikTokLogo size={11} />
        #{tag}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{
          fontSize: "0.6875rem", fontWeight: 600, color: "#09090B",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 3,
          opacity: 0.55,
        }}
      >
        view all <ExternalLink style={{ width: 9, height: 9 }} />
      </a>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "32px 16px", color: "#C7C7CC" }}>
      <div style={{ marginBottom: 10, opacity: 0.5 }}>
        <TikTokLogo size={32} />
      </div>
      <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 4, color: "#A1A1AA" }}>
        No videos yet
      </p>
      <p style={{ fontSize: "0.8125rem", color: "#C7C7CC" }}>
        Mac mini scrapes #67coin every hour
      </p>
    </div>
  )
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export function TikTokSpotlightCard() {
  const { data } = useAppData()
  const videos: TikTokVideo[] = data?.tiktok_spotlight ?? []
  const lastUpdated = data?.last_updated

  const coinVideos  = videos.filter(v => v.hashtag === "67coin")
  const tag67Videos = videos.filter(v => v.hashtag === "67")

  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <p className="hero-label" style={{ marginBottom: 8 }}>Latest TikToks</p>
        <p className="hero-number">{videos.length > 0 ? videos.length : "—"}</p>
        <p style={{ fontSize: "0.875rem", color: "#8E8E93", marginTop: 6 }}>
          {videos.length > 0 ? `#67coin + #67 · ${coinVideos.length + tag67Videos.length} videos` : "waiting for first scrape"}
        </p>
      </div>

      {/* Collapsed preview — show first 2 */}
      {videos.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {videos.slice(0, 2).map((v, i) => (
            <VideoTile key={i} v={v} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 14 }}>
          <div style={{ color: "#A1A1AA" }}><TikTokLogo size={16} /></div>
          <p style={{ fontSize: "0.875rem", color: "#A1A1AA", fontWeight: 500 }}>
            Scraping #67coin hourly
          </p>
        </div>
      )}
    </div>
  )

  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            TikTok Spotlight
          </p>
          {lastUpdated && (
            <p style={{ fontSize: "0.75rem", color: "#C7C7CC", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <RefreshCw style={{ width: 10, height: 10 }} />
              Updated {timeAgo(lastUpdated)}
            </p>
          )}
        </div>
      </div>

      {videos.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ── #67coin section ── */}
          {coinVideos.length > 0 && (
            <div>
              <SectionHeader tag="67coin" href="https://www.tiktok.com/tag/67coin" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {coinVideos.slice(0, 2).map((v, i) => (
                  <VideoTile key={i} v={v} large />
                ))}
              </div>
            </div>
          )}

          {/* divider */}
          {coinVideos.length > 0 && tag67Videos.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", margin: "0 -4px" }} />
          )}

          {/* ── #67 section ── */}
          {tag67Videos.length > 0 && (
            <div>
              <SectionHeader tag="67" href="https://www.tiktok.com/tag/67" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {tag67Videos.slice(0, 2).map((v, i) => (
                  <VideoTile key={i} v={v} large />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info box */}
      <div style={{
        background: "#F9F9F9", border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 12, padding: "12px 14px",
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <RefreshCw style={{ width: 14, height: 14, color: "#A1A1AA", flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#3F3F46", marginBottom: 2 }}>
            Auto-updated every hour
          </p>
          <p style={{ fontSize: "0.75rem", color: "#A1A1AA", lineHeight: 1.5 }}>
            Top 2 from <strong style={{ color: "#09090B" }}>#67coin</strong> (most views) +
            Top 2 from <strong style={{ color: "#09090B" }}>#67</strong> (trending viral).
            Scraped via TikTokApi on Mac mini.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="TikTok Spotlight"
      subtitle="#67coin · Latest"
      icon={<span style={{ display: "flex" }}><TikTokLogo size={16} /></span>}
      accentColor="#09090B"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
