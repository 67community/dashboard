"use client"

import { useEffect } from "react"
import { ExternalLink, Eye, RefreshCw } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { TikTokVideo } from "@/lib/use-data"

const TIKTOK_REFRESH_MS = 10 * 60 * 1000 // 10 minutes

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

// ── Sub-section label ─────────────────────────────────────────────────────────

function SubLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      marginBottom: 8,
    }}>
      <span style={{ fontSize: "0.75rem" }}>{icon}</span>
      <span style={{
        fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.05em",
        textTransform: "uppercase", color: "var(--secondary)",
      }}>
        {label}
      </span>
    </div>
  )
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
          border: "1.5px solid var(--separator)",
          background: "#0A0A0A",
          transition: "transform 0.15s",
          cursor: "pointer",
          minWidth: large ? 180 : 140,
          width: large ? 180 : 140,
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

          {/* NEW badge for recent videos */}
          {v.video_type === "recent" && (
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: "#10B981", borderRadius: 5,
              padding: "2px 6px",
              fontSize: "0.5rem", fontWeight: 800, color: "#fff",
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>
              NEW
            </div>
          )}

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
              fontSize: "0.75rem", color: "var(--secondary)", lineHeight: 1.45, marginBottom: 5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {v.description}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {v.views_text && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.6875rem", color: "var(--secondary)", fontWeight: 500 }}>
                <Eye style={{ width: 11, height: 11 }} />{v.views_text}
              </span>
            )}
            <span style={{ fontSize: "0.6875rem", color: "var(--tertiary)", marginLeft: "auto" }}>
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
        textTransform: "uppercase", color: "var(--secondary)",
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
    <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--tertiary)" }}>
      <div style={{ marginBottom: 10, opacity: 0.5 }}>
        <TikTokLogo size={32} />
      </div>
      <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 4, color: "var(--secondary)" }}>
        No videos yet
      </p>
      <p style={{ fontSize: "0.8125rem", color: "var(--tertiary)" }}>
        Mac mini scrapes #67coin every hour
      </p>
    </div>
  )
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export function TikTokSpotlightCard() {
  const { data, refresh } = useAppData()
  const videos: TikTokVideo[] = data?.tiktok_spotlight ?? []
  const lastUpdated = data?.last_updated

  // Auto-refresh every 10 minutes to pick up new scraper data
  useEffect(() => {
    const id = setInterval(() => refresh(), TIKTOK_REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  const coinPop  = videos.filter(v => v.hashtag === "67coin" && v.video_type === "popular")
  const coinRec  = videos.filter(v => v.hashtag === "67coin" && v.video_type === "recent")
  const tag67Pop = videos.filter(v => v.hashtag === "67"     && v.video_type === "popular")
  const tag67Rec = videos.filter(v => v.hashtag === "67"     && v.video_type === "recent")

  // Fallback for old data without video_type
  const coinAll  = videos.filter(v => v.hashtag === "67coin")
  const tag67All = videos.filter(v => v.hashtag === "67")
  const coinVideos  = (coinPop.length + coinRec.length)  > 0 ? null : coinAll
  const tag67Videos = (tag67Pop.length + tag67Rec.length) > 0 ? null : tag67All

  const totalCount = videos.length

  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <p className="hero-label" style={{ marginBottom: 8 }}>TikTok Videos</p>
        <p className="hero-number">{totalCount > 0 ? totalCount : "—"}</p>
        <p style={{ fontSize: "0.875rem", color: "var(--tertiary)", marginTop: 6 }}>
          {totalCount > 0 ? `#67coin + #67 · popular & recent` : "waiting for first scrape"}
        </p>
      </div>

      {/* Collapsed preview — top 2 popular from #67coin */}
      {totalCount > 0 ? (
        <div style={{ display: "flex", flexDirection: "row", gap: 8, overflowX: "auto", paddingBottom: 8, paddingTop: 4 }}>
          {(coinPop.length > 0 ? coinPop : coinAll).slice(0, 30).map((v, i) => (
            <VideoTile key={i} v={v} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--separator)", paddingTop: 14 }}>
          <div style={{ color: "var(--secondary)" }}><TikTokLogo size={16} /></div>
          <p style={{ fontSize: "0.875rem", color: "var(--secondary)", fontWeight: 500 }}>
            Scraping #67coin hourly
          </p>
        </div>
      )}
    </div>
  )

  // Helper to render a hashtag section with popular + recent sub-groups
  const renderHashtagSection = (
    tag: string,
    href: string,
    popVideos: TikTokVideo[],
    recVideos: TikTokVideo[],
    fallbackVideos: TikTokVideo[] | null,
  ) => {
    const hasPop = popVideos.length > 0
    const hasRec = recVideos.length > 0
    const hasFallback = fallbackVideos && fallbackVideos.length > 0
    if (!hasPop && !hasRec && !hasFallback) return null

    return (
      <div>
        <SectionHeader tag={tag} href={href} />

        {/* Popular sub-section */}
        {hasPop && (
          <div style={{ marginBottom: hasRec ? 14 : 0 }}>
            <SubLabel icon="🔥" label="Popular" />
            <div style={{ display: "flex", flexDirection: "row", gap: 10, overflowX: "auto", paddingBottom: 8, paddingTop: 4 }}>
              {popVideos.map((v, i) => <VideoTile key={i} v={v} large />)}
            </div>
          </div>
        )}

        {/* Recent sub-section */}
        {hasRec && (
          <div>
            <SubLabel icon="🕐" label="Recent" />
            <div style={{ display: "flex", flexDirection: "row", gap: 10, overflowX: "auto", paddingBottom: 8, paddingTop: 4 }}>
              {recVideos.map((v, i) => <VideoTile key={i} v={v} large />)}
            </div>
          </div>
        )}

        {/* Fallback: old data without video_type */}
        {!hasPop && !hasRec && hasFallback && (
          <div style={{ display: "flex", flexDirection: "row", gap: 10, overflowX: "auto", paddingBottom: 8, paddingTop: 4 }}>
            {fallbackVideos!.slice(0, 30).map((v, i) => <VideoTile key={i} v={v} large />)}
          </div>
        )}
      </div>
    )
  }

  const expanded = (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            TikTok Spotlight
          </p>
          {lastUpdated && (
            <p style={{ fontSize: "0.75rem", color: "var(--tertiary)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <RefreshCw style={{ width: 10, height: 10 }} />
              Updated {timeAgo(lastUpdated)}
            </p>
          )}
        </div>
        <div style={{
          background: "#F9F9F9", borderRadius: 8, padding: "4px 10px",
          fontSize: "0.75rem", fontWeight: 600, color: "var(--secondary)",
        }}>
          {totalCount} videos
        </div>
      </div>

      {totalCount === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ── #67coin section ── */}
          {renderHashtagSection(
            "67coin", "https://www.tiktok.com/tag/67coin",
            coinPop, coinRec, coinVideos,
          )}

          {/* divider */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", margin: "0 -4px" }} />

          {/* ── #67 section ── */}
          {renderHashtagSection(
            "67", "https://www.tiktok.com/tag/67",
            tag67Pop, tag67Rec, tag67Videos,
          )}
        </>
      )}

      {/* Info box */}
      <div style={{
        background: "#F9F9F9", border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 12, padding: "12px 14px",
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <RefreshCw style={{ width: 14, height: 14, color: "var(--secondary)", flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#3F3F46", marginBottom: 2 }}>
            Auto-updated every 10 minutes
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--secondary)", lineHeight: 1.5 }}>
            🔥 <strong style={{ color: "#09090B" }}>Popular</strong> = most views ·
            🕐 <strong style={{ color: "#09090B" }}>Recent</strong> = latest posts · 2 each per tag.
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
