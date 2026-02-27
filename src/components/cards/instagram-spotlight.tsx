"use client"

import { ExternalLink, Heart, MessageCircle, Play, RefreshCw, Eye } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { InstagramPost } from "@/lib/use-data"

// ── Instagram gradient logo ───────────────────────────────────────────────────

function IGLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-grad-spotlight" cx="30%" cy="107%" r="140%">
          <stop offset="0%"  stopColor="#FFD600" />
          <stop offset="20%" stopColor="#FF7A00" />
          <stop offset="40%" stopColor="#FF0069" />
          <stop offset="70%" stopColor="#D300C5" />
          <stop offset="100%" stopColor="#7638FA" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill="url(#ig-grad-spotlight)" />
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 30) return `${d}d ago`
    return `${Math.floor(d / 30)}mo ago`
  } catch { return "recently" }
}

// ── Post tile ────────────────────────────────────────────────────────────────

function PostTile({ p, large = false }: { p: InstagramPost; large?: boolean }) {
  const thumbH = large ? 160 : 110
  return (
    <a href={p.post_url} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid rgba(0,0,0,0.07)", background: "#fff", transition: "transform 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>

        {/* Thumbnail */}
        <div style={{ width: "100%", height: thumbH, background: "#1A1A1A", position: "relative", overflow: "hidden" }}>
          {p.thumbnail_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={p.thumbnail_url} alt={p.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
            : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IGLogo size={28} />
              </div>
            )
          }

          {/* Video play button */}
          {p.is_video && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Play style={{ width: 12, height: 12, fill: "#fff", color: "#fff", marginLeft: 2 }} />
              </div>
            </div>
          )}

          {/* NEW badge for recent */}
          {p.post_type === "recent" && (
            <div style={{
              position: "absolute", top: 5, right: 5,
              background: "#10B981", borderRadius: 4, padding: "1px 5px",
              fontSize: "0.5rem", fontWeight: 800, color: "#fff",
              textTransform: "uppercase", letterSpacing: "0.05em"
            }}>NEW</div>
          )}

          {/* Reel badge */}
          {p.is_video && (
            <div style={{
              position: "absolute", bottom: 5, left: 5,
              background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "1px 5px",
              fontSize: "0.5rem", fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", gap: 3
            }}>
              <Play style={{ width: 7, height: 7, fill: "#fff" }} />REEL
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "8px 10px" }}>
          <p style={{
            fontSize: "0.6875rem", fontWeight: 600, color: "#09090B",
            marginBottom: 2, lineHeight: 1.35,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: large ? 2 : 1, WebkitBoxOrient: "vertical"
          }}>
            {p.caption || "(no caption)"}
          </p>
          <p style={{ fontSize: "0.625rem", color: "#6B7280", marginBottom: 4 }}>
            @{p.creator}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.625rem", color: "#E1306C", fontWeight: 600 }}>
              <Heart style={{ width: 9, height: 9, fill: "#E1306C" }} />{p.likes_text}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.625rem", color: "#A1A1AA" }}>
              <MessageCircle style={{ width: 9, height: 9 }} />{p.comments}
            </span>
            {p.views_text && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.625rem", color: "#A1A1AA" }}>
                <Eye style={{ width: 9, height: 9 }} />{p.views_text}
              </span>
            )}
            <span style={{ fontSize: "0.625rem", color: "#C7C7CC", marginLeft: "auto" }}>
              {p.created_at ? timeAgo(p.created_at) : ""}
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export function InstagramSpotlightCard() {
  const { data } = useAppData()
  const posts: InstagramPost[] = (data?.instagram_spotlight ?? []) as InstagramPost[]

  const popularPosts = posts.filter(p => p.post_type === "popular")
  const recentPosts  = posts.filter(p => p.post_type === "recent")
  const totalLikes   = posts.reduce((s, p) => s + (p.likes ?? 0), 0)

  // ── Collapsed ──────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <p className="hero-label" style={{ marginBottom: 8 }}>Instagram Posts</p>
        <p className="hero-number">
          {totalLikes >= 1_000_000
            ? `${(totalLikes / 1_000_000).toFixed(1)}M`
            : totalLikes >= 1_000 ? `${Math.round(totalLikes / 1_000)}K` : totalLikes > 0 ? String(totalLikes) : "—"}
        </p>
        <p style={{ fontSize: "0.875rem", color: "#8E8E93", marginTop: 6 }}>
          {posts.length > 0 ? `${posts.length} posts · combined likes` : "fetching #67coin posts…"}
        </p>
      </div>

      {/* Preview grid */}
      {popularPosts.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {popularPosts.slice(0, 2).map((p, i) => <PostTile key={i} p={p} />)}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 14 }}>
          <IGLogo size={20} />
          <p style={{ fontSize: "0.875rem", color: "#A1A1AA", fontWeight: 500 }}>$67coin on Instagram</p>
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
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Instagram Spotlight
          </p>
          <p style={{ fontSize: "0.75rem", color: "#C7C7CC", marginTop: 2 }}>#67coin · #67</p>
        </div>
        <div style={{
          background: "linear-gradient(135deg,#FFD600,#FF7A00,#FF0069)",
          borderRadius: 8, padding: "4px 10px",
          fontSize: "0.75rem", fontWeight: 600, color: "#fff",
          display: "flex", alignItems: "center", gap: 4
        }}>
          <IGLogo size={12} />{posts.length} posts
        </div>
      </div>

      {/* Aggregate stats */}
      {posts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Total Likes",    value: totalLikes >= 1000 ? `${(totalLikes/1000).toFixed(1)}K` : String(totalLikes), color: "#E1306C" },
            { label: "Total Comments", value: String(posts.reduce((s,p) => s + (p.comments ?? 0), 0)), color: "#7638FA" },
            { label: "Reels",          value: String(posts.filter(p => p.is_video).length), color: "#FF7A00" },
          ].map(s => (
            <div key={s.label} className="inset-cell" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.25rem", fontWeight: 800, color: s.color, margin: 0, letterSpacing: "-0.03em" }}>{s.value}</p>
              <p style={{ fontSize: "0.5625rem", color: "#8E8E93", marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Popular posts */}
      {popularPosts.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
            <span style={{ fontSize: "0.75rem" }}>🔥</span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA", letterSpacing: "0.05em", textTransform: "uppercase" }}>Most Liked</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {popularPosts.map((p, i) => <PostTile key={i} p={p} large />)}
          </div>
        </div>
      )}

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
            <span style={{ fontSize: "0.75rem" }}>🕐</span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#A1A1AA", letterSpacing: "0.05em", textTransform: "uppercase" }}>Recently Posted</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {recentPosts.map((p, i) => <PostTile key={i} p={p} large />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="inset-cell" style={{ textAlign: "center", padding: "32px 20px" }}>
          <IGLogo size={40} />
          <p style={{ marginTop: 12, fontSize: "0.875rem", color: "#6B7280", fontWeight: 600 }}>
            No Instagram posts found yet
          </p>
          <p style={{ fontSize: "0.75rem", color: "#A1A1AA", marginTop: 4 }}>
            Mac mini scrapes #67coin every 6 hours via instaloader
          </p>
        </div>
      )}

      {/* Footer links */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["67coin", "67"].map(tag => (
          <a key={tag} href={`https://www.instagram.com/explore/tags/${tag}/`}
            target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: "0.6875rem", fontWeight: 600, color: "#6B7280",
              background: "#F3F4F6", borderRadius: 99, padding: "4px 10px", textDecoration: "none"
            }}>
            #{tag}<ExternalLink style={{ width: 8, height: 8, opacity: 0.5 }} />
          </a>
        ))}
      </div>

      {/* Refresh note */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#A1A1AA" }}>
        <RefreshCw style={{ width: 11, height: 11 }} />
        <span style={{ fontSize: "0.6875rem" }}>Data refreshed every 6 hours via instaloader (Mac mini)</span>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Instagram Spotlight"
      subtitle="#67coin · #67 · Posts & Reels"
      icon={<span style={{ display: "flex" }}><IGLogo size={16} /></span>}
      accentColor="#E1306C"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
