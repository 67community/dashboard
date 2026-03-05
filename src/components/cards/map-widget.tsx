"use client"

import { useState } from "react"
import { useAppData } from "@/lib/data-context"
import { DashboardCard } from "@/components/ui/dashboard-card"

interface Post {
  id: string
  author: string
  avatar?: string
  content: string
  channel: string
  time_ago: string
  pending?: boolean
}

export function MapWidgetCard() {
  const { data } = useAppData()
  const [approved, setApproved] = useState<Set<string>>(new Set())
  const [rejected, setRejected] = useState<Set<string>>(new Set())

  const allActivity: Post[] = (data?.community?.recent_discord_activity ?? []).map((a: any) => ({
    id:      a.id ?? a.user_id ?? String(Math.random()),
    author:  a.user ?? a.username ?? "Unknown",
    avatar:  a.avatar,
    content: a.message ?? a.content ?? "",
    channel: a.channel ?? "#general",
    time_ago: a.time_ago ?? "",
    pending: a.pending ?? false,
  }))

  // Also pull from recent_joins as latest posts
  const recentJoins: Post[] = (data?.community?.recent_joins ?? []).slice(0, 5).map((j: any) => ({
    id:      j.user_id ?? String(Math.random()),
    author:  j.user ?? "Unknown",
    avatar:  j.avatar,
    content: j.message || "👋 Just joined the server!",
    channel: "#introductions",
    time_ago: j.time_ago ?? "",
    pending: false,
  }))

  const recentPosts = (allActivity.filter(p => !p.pending).slice(0, 5).length > 0
    ? allActivity.filter(p => !p.pending).slice(0, 5)
    : recentJoins)

  const pendingPosts = allActivity
    .filter(p => p.pending)
    .filter(p => !approved.has(p.id) && !rejected.has(p.id))

  return (
    <DashboardCard title="Community Posts" subtitle="Discord activity feed">
      {/* Latest Posts */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Latest Posts
        </p>

        {recentPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--secondary)", fontSize: 13 }}>
            No recent posts
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentPosts.map(post => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Admin: Pending Approval */}
      <div style={{ borderTop: "1px solid var(--separator)", paddingTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--secondary)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
            Needs Approval
          </p>
          {pendingPosts.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: "#EF4444", color: "#fff", borderRadius: 99, padding: "2px 8px" }}>
              {pendingPosts.length}
            </span>
          )}
        </div>

        {pendingPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--secondary)", fontSize: 13 }}>
            ✅ All caught up
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendingPosts.map(post => (
              <div key={post.id} style={{
                background: "var(--fill-primary)", borderRadius: 12, padding: "12px 14px",
                border: "1px solid var(--separator)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Avatar avatar={post.avatar} name={post.author} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)" }}>{post.author}</span>
                    <span style={{ fontSize: 11, color: "var(--secondary)", marginLeft: 6 }}>{post.channel}</span>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--secondary)" }}>{post.time_ago}</span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--foreground)", lineHeight: 1.5, opacity: 0.85 }}>
                  {post.content.slice(0, 200)}{post.content.length > 200 ? "…" : ""}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setApproved(p => new Set([...p, post.id]))}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer",
                      background: "#22C55E", color: "#fff", fontWeight: 600, fontSize: 13 }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => setRejected(p => new Set([...p, post.id]))}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, cursor: "pointer",
                      background: "transparent", color: "#EF4444", fontWeight: 600, fontSize: 13,
                      border: "1px solid #EF4444" }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  )
}

function PostRow({ post }: { post: Post }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 12px",
      background: "var(--fill-primary)", borderRadius: 12, border: "1px solid var(--separator)" }}>
      <Avatar avatar={post.avatar} name={post.author} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)" }}>{post.author}</span>
          <span style={{ fontSize: 11, color: "var(--secondary)" }}>{post.channel}</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--secondary)", whiteSpace: "nowrap" }}>{post.time_ago}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--foreground)", opacity: 0.8, lineHeight: 1.4,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as any}>
          {post.content || <span style={{ fontStyle: "italic", color: "var(--secondary)" }}>No message</span>}
        </p>
      </div>
    </div>
  )
}

function Avatar({ avatar, name }: { avatar?: string; name: string }) {
  if (avatar) return (
    <img src={avatar} alt={name} style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
  )
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, color: "#fff" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
