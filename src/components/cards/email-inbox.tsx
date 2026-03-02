"use client"

import { useState } from "react"
import { Mail, Star, Trash2, ExternalLink, RefreshCw, Reply } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

// ── Types ─────────────────────────────────────────────────────
interface Email {
  id:        string
  from:      string
  subject:   string
  preview:   string
  time:      string
  read:      boolean
  starred:   boolean
  tag?:      "exchange" | "partnership" | "media" | "community" | "urgent"
}

const TAG_CONFIG = {
  exchange:    { label: "Exchange",    color: "#6366F1", bg: "rgba(99,102,241,0.1)" },
  partnership: { label: "Partner",     color: "#059669", bg: "rgba(5,150,105,0.1)" },
  media:       { label: "Media",       color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  community:   { label: "Community",   color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  urgent:      { label: "🚨 Urgent",   color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
}

const SAMPLE_EMAILS: Email[] = [
  {
    id: "1", from: "listings@bybit.com", subject: "Re: $67 Token Listing Application",
    preview: "Thank you for your application. Our team has reviewed the details and would like to schedule a follow-up call...",
    time: "2h ago", read: false, starred: true, tag: "exchange",
  },
  {
    id: "2", from: "press@coindesk.com", subject: "Interview Request — Memecoin Spotlight",
    preview: "Hi team, we're running a piece on Solana memecoins with real community stories and would love to feature $67...",
    time: "5h ago", read: false, starred: false, tag: "media",
  },
  {
    id: "3", from: "collab@pumpdotfun", subject: "Featured Project Opportunity",
    preview: "We'd like to feature $67 on our homepage for the upcoming week. Please confirm your CA and social links...",
    time: "1d ago", read: true, starred: false, tag: "partnership",
  },
]

function EmailRow({ email, onToggleStar, onMarkRead, onDelete }: {
  email: Email
  onToggleStar: (id: string) => void
  onMarkRead:   (id: string) => void
  onDelete:     (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const tag = email.tag ? TAG_CONFIG[email.tag] : null

  return (
    <div
      onClick={() => { setExpanded(!expanded); onMarkRead(email.id) }}
      style={{
        padding: "10px 12px", borderRadius: 10, cursor: "pointer",
        background: email.read ? "transparent" : "rgba(245,166,35,0.05)",
        border: "1px solid",
        borderColor: email.read ? "rgba(0,0,0,0.06)" : "rgba(245,166,35,0.15)",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
      onMouseLeave={e => (e.currentTarget.style.background = email.read ? "transparent" : "rgba(245,166,35,0.05)")}
    >
      <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
        {/* Unread dot */}
        <div style={{ width:7, height:7, borderRadius:"50%", marginTop:5, flexShrink:0,
          background: email.read ? "transparent" : "#F5A623" }} />

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <span style={{ fontSize:"0.8125rem", fontWeight: email.read ? 500 : 700, color:"var(--foreground)",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {email.from}
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              {tag && (
                <span style={{ fontSize:"0.6rem", fontWeight:700, color:tag.color,
                  background:tag.bg, padding:"1px 6px", borderRadius:99 }}>
                  {tag.label}
                </span>
              )}
              <span style={{ fontSize:"0.6875rem", color:"var(--tertiary)" }}>{email.time}</span>
            </div>
          </div>
          <p style={{ fontSize:"0.8125rem", fontWeight: email.read ? 500 : 700, color:"var(--foreground)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:1 }}>
            {email.subject}
          </p>
          {!expanded && (
            <p style={{ fontSize:"0.75rem", color:"var(--tertiary)", overflow:"hidden",
              textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:2 }}>
              {email.preview}
            </p>
          )}
          {expanded && (
            <div onClick={e => e.stopPropagation()}>
              <p style={{ fontSize:"0.8125rem", color:"var(--foreground)", lineHeight:1.6, marginTop:8,
                paddingTop:8, borderTop:"1px solid var(--separator)" }}>
                {email.preview}
              </p>
              <div style={{ display:"flex", gap:6, marginTop:10 }}>
                <button style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px",
                  borderRadius:8, border:"1.5px solid var(--separator)", background:"none",
                  cursor:"pointer", fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)" }}>
                  <Reply style={{ width:12, height:12 }} /> Reply
                </button>
                <button style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px",
                  borderRadius:8, border:"1.5px solid var(--separator)", background:"none",
                  cursor:"pointer", fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)" }}>
                  <ExternalLink style={{ width:12, height:12 }} /> Open
                </button>
                <button onClick={() => onDelete(email.id)}
                  style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px",
                  borderRadius:8, border:"1.5px solid rgba(239,68,68,0.2)", background:"none",
                  cursor:"pointer", fontSize:"0.75rem", fontWeight:600, color:"#EF4444" }}>
                  <Trash2 style={{ width:12, height:12 }} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Star */}
        <button onClick={e => { e.stopPropagation(); onToggleStar(email.id) }}
          style={{ background:"none", border:"none", cursor:"pointer", padding:2, flexShrink:0 }}>
          <Star style={{ width:14, height:14,
            color: email.starred ? "#F5A623" : "#D1D5DB",
            fill: email.starred ? "#F5A623" : "none" }} />
        </button>
      </div>
    </div>
  )
}

// ── Main Card ──────────────────────────────────────────────────
export function EmailInboxCard() {
  const [emails, setEmails] = useState<Email[]>(SAMPLE_EMAILS)
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all")

  const unread  = emails.filter(e => !e.read).length
  const starred = emails.filter(e => e.starred).length

  function toggleStar(id: string) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e))
  }
  function markRead(id: string) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e))
  }
  function deleteEmail(id: string) {
    setEmails(prev => prev.filter(e => e.id !== id))
  }

  const filtered = emails.filter(e =>
    filter === "unread"  ? !e.read   :
    filter === "starred" ? e.starred : true
  )

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* Stats row */}
      <div style={{ display:"flex", gap:6 }}>
        {[
          { label:"Unread",  val: unread,  color:"#F5A623" },
          { label:"Starred", val: starred, color:"#6366F1" },
          { label:"Total",   val: emails.length, color:"var(--foreground)" },
        ].map(s => (
          <div key={s.label} className="inset-cell" style={{ flex:1, textAlign:"center" }}>
            <p style={{ fontSize:"1.25rem", fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</p>
            <p style={{ fontSize:"0.6rem", color:"var(--tertiary)", fontWeight:600,
              textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Latest unread */}
      {emails.filter(e => !e.read).slice(0, 2).map(e => (
        <div key={e.id} style={{ padding:"8px 10px", borderRadius:8,
          background:"rgba(245,166,35,0.06)", border:"1px solid rgba(245,166,35,0.15)" }}>
          <p style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.from}</p>
          <p style={{ fontSize:"0.6875rem", color:"var(--foreground)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.subject}</p>
        </div>
      ))}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Filter tabs */}
      <div style={{ display:"flex", gap:6 }}>
        {(["all","unread","starred"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:"4px 12px", borderRadius:99, border:"none", cursor:"pointer",
              fontSize:"0.75rem", fontWeight:700,
              background: filter === f ? "#F5A623" : "rgba(0,0,0,0.06)",
              color: filter === f ? "#000" : "#6E6E73",
              transition:"all 0.15s" }}>
            {f === "all" ? `All (${emails.length})` : f === "unread" ? `Unread (${unread})` : `Starred (${starred})`}
          </button>
        ))}
        <button style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4,
          padding:"4px 10px", borderRadius:99, border:"none", cursor:"pointer",
          fontSize:"0.75rem", fontWeight:600, background:"rgba(0,0,0,0.04)", color:"var(--secondary)" }}>
          <RefreshCw style={{ width:11, height:11 }} /> Refresh
        </button>
      </div>

      {/* Email list */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {filtered.length === 0 && (
          <p style={{ textAlign:"center", color:"var(--tertiary)", fontSize:"0.875rem", padding:"20px 0" }}>
            No emails here
          </p>
        )}
        {filtered.map(e => (
          <EmailRow key={e.id} email={e}
            onToggleStar={toggleStar} onMarkRead={markRead} onDelete={deleteEmail} />
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Email Inbox"
      subtitle="team@67coin.com"
      icon={<Mail style={{ width:16, height:16 }} />}
      accentColor="#6366F1"
      collapsed={collapsed}
      expanded={expanded}
      liveTag
    />
  )
}
