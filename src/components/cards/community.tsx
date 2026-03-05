"use client"
import { useState } from "react"
import React from "react"
import type { BestTweet } from "@/lib/use-data"
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts"

import { Heart, MessageCircle, Users, Mic, Calendar, Zap, Trophy, Shield } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import { LeaderboardPanel } from "@/components/cards/leaderboard"
import type { ActivityItem, RecentJoin, TopChannel, VoiceChannel, ScheduledEvent, ModEvent, TopContributor } from "@/lib/use-data"

// ── helpers ───────────────────────────────────────────────────────────────────

function DeltaBadge({ value }: { value?: number }) {
  if (!value) return null
  const pos = value > 0
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:2,
      fontSize:"0.6875rem", fontWeight:700,
      color: pos ? "#16A34A" : "#DC2626",
      background: pos ? "#DCFCE7" : "#FEE2E2",
      borderRadius:99, padding:"2px 7px", marginLeft:6,
    }}>
      {pos ? "+" : ""}{value.toLocaleString()}
    </span>
  )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
      <span style={{ color:"var(--secondary)", display:"flex" }}>{icon}</span>
      <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--secondary)", letterSpacing:"0.06em", textTransform:"uppercase", margin:0 }}>
        {label}
      </p>
    </div>
  )
}

function AvatarStack({ joins }: { joins: RecentJoin[] }) {
  if (!joins?.length) return null
  const show = joins.slice(0, 5)
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
      {show.map((j, i) => (
        <div key={j.user_id} style={{
          width:28, height:28, borderRadius:"50%",
          border:"2px solid #fff",
          marginLeft: i === 0 ? 0 : -8,
          zIndex: 10 - i,
          position:"relative",
          overflow:"hidden",
          background:"var(--fill-primary)",
          flexShrink:0,
        }}>
          <img
            src={j.avatar}
            alt={j.user}
            width={28} height={28}
            style={{ objectFit:"cover", width:"100%", height:"100%" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://cdn.discordapp.com/embed/avatars/${parseInt(j.user_id.slice(-1),16)%5}.png`
            }}
          />
        </div>
      ))}
      {joins.length > 5 && (
        <div style={{
          width:28, height:28, borderRadius:"50%",
          border:"2px solid #fff",
          marginLeft:-8, zIndex:0,
          background:"var(--fill-primary)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"0.6rem", fontWeight:700, color:"var(--secondary)",
        }}>
          +{joins.length - 5}
        </div>
      )}
    </div>
  )
}

function typeConfig(type: string): { bg: string; color: string; label: string } {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    join:  { bg:"rgba(96,165,250,0.15)",  color:"#60A5FA", label:"Joined"  },
    ban:   { bg:"rgba(248,113,113,0.15)", color:"#F87171", label:"Banned"  },
    kick:  { bg:"rgba(251,146,60,0.15)",  color:"#FB923C", label:"Kicked"  },
    spam:  { bg:"rgba(244,114,182,0.15)", color:"#F472B6", label:"Spam"    },
    warn:  { bg:"rgba(252,211,77,0.15)",  color:"#FCD34D", label:"Warned"  },
  }
  return map[type] ?? { bg:"#F3F4F6", color:"var(--foreground)", label:"Event" }
}

function timeToEvent(iso: string): string {
  if (!iso) return ""
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) return "Ongoing"
  const m = Math.floor(diff / 60000)
  if (m < 60) return `in ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `in ${h}h`
  return `in ${Math.floor(h / 24)}d`
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CommunityCard() {
  const { data } = useAppData()
  const [section, setSection] = useState<"overview" | "leaderboard">("overview")
  const c = data?.community
  const sp = data?.social_pulse

  const members       = c?.discord_members   ?? 0
  const fmtM          = members.toLocaleString()
  const goal          = 10000
  const pct           = Math.min((members / goal) * 100, 100)
  const onlineNow     = c?.online_now        ?? 0
  const discordDelta  = c?.discord_delta_24h
  const telegramDelta = c?.telegram_delta_24h
  const recentJoins   = c?.recent_joins      ?? []
  const activeToday   = c?.active_users_today ?? 0
  const topChannels   = (c?.top_channels     ?? []) as TopChannel[]
  const voiceChs      = (c?.voice_channels   ?? []) as VoiceChannel[]
  const events        = (c?.scheduled_events ?? []) as ScheduledEvent[]
  const boostLevel    = c?.boost_level       ?? 0
  const boostCount    = c?.boost_count       ?? 0
  const modEvents     = (c?.mod_events       ?? []) as ModEvent[]
  const topContribs   = (c?.top_contributors ?? []) as TopContributor[]
  const legacyActivity= (c?.recent_discord_activity ?? []) as ActivityItem[]
  // X / Twitter
  const xFollowers    = sp?.twitter_followers    ?? 0
  const bestTweet48h  = sp?.best_tweet_2d
  const bestTweetWeek = sp?.best_tweet_week
  const xDelta        = (sp as Record<string,unknown> & typeof sp)?.follower_change_20h as number ?? sp?.follower_change_24h ?? 0
  const xDelta3d      = (sp as Record<string,unknown> & typeof sp)?.follower_change_3d as number ?? 0
  const xDelta7d      = (sp as Record<string,unknown> & typeof sp)?.follower_change_7d as number ?? sp?.follower_growth_7d ?? 0
  const xCommunity    = sp?.x_community_members  ?? 0
  const xCommunityDelta = sp?.x_community_delta_24h ?? 0
  const xEngagement   = sp?.engagement_rate      ?? 0

  // ── Collapsed view ──────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14, overflow:"hidden" }}>

      {/* Hero */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p className="hero-label" style={{ marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            Discord Members
          </p>
          <div style={{ display:"flex", alignItems:"center" }}>
            <p className="hero-number" style={{ fontSize:"2rem" }}>{fmtM}</p>
            <DeltaBadge value={discordDelta} />
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:"rgba(52,211,153,0.12)", padding:"6px 12px", borderRadius:99,
          }}>
            <span className="dot-on" style={{ width:7, height:7 }} />
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#34D399" }}>{onlineNow} online</span>
          </span>
          {voiceChs.length > 0 && (
            <span style={{
              display:"inline-flex", alignItems:"center", gap:5,
              background:"rgba(88,101,242,0.12)", padding:"4px 10px", borderRadius:99,
              fontSize:"0.75rem", fontWeight:600, color:"#5865F2",
            }}>
              <Mic style={{ width:11, height:11 }} />
              {voiceChs.reduce((a, v) => a + v.member_count, 0)} in voice
            </span>
          )}
        </div>
      </div>

      {/* Discord stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, borderTop:"1px solid var(--separator)", paddingTop:16 }}>
        {[
          { key:"joins",    label:"New Joins 24h", value: discordDelta != null ? String(Math.max(0, discordDelta)) : String(c?.new_joins_24h ?? "—") },
          { key:"telegram", label:<span style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 14.4l-2.965-.924c-.644-.204-.657-.644.136-.953l11.57-4.461c.537-.194 1.006.131.893.16z"/></svg>Telegram</span>, value: (c?.telegram_members ?? 0).toLocaleString(), delta: telegramDelta },
          { key:"active",   label:"Active Today",  value: activeToday > 0 ? String(activeToday) : "—" },
        ].map(s => (
          <div key={s.key} className="inset-cell" style={{ textAlign:"center" }}>
            <p style={{ fontSize:"0.9375rem", fontWeight:700, letterSpacing:"-0.03em", color:"var(--foreground)", margin:0 }}>{s.value}</p>
            {s.delta !== undefined && s.delta !== 0 && <DeltaBadge value={s.delta} />}
            <p style={{ fontSize:"0.6875rem", fontWeight:500, color:"var(--tertiary)", marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* X section */}
      <div style={{ borderTop:"1px solid var(--separator)", paddingTop:16, display:"flex", flexDirection:"column", gap:8 }}>
        {/* X Followers + Community */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div className="inset-cell" style={{ textAlign:"center" }}>
            <p style={{ fontSize:"0.9375rem", fontWeight:700, letterSpacing:"-0.03em", color:"var(--foreground)", margin:0 }}>{xFollowers > 0 ? xFollowers.toLocaleString() : "—"}</p>
            {xDelta !== 0 && <DeltaBadge value={xDelta} />}
            <p style={{ fontSize:"0.6875rem", fontWeight:500, color:"var(--tertiary)", marginTop:4 }}>X Followers</p>
          </div>
          {xCommunity > 0 && (
            <div className="inset-cell" style={{ textAlign:"center" }}>
              <p style={{ fontSize:"0.9375rem", fontWeight:700, letterSpacing:"-0.03em", color:"var(--foreground)", margin:0 }}>{xCommunity.toLocaleString()}</p>
              {xCommunityDelta !== 0 && <DeltaBadge value={xCommunityDelta} />}
              <p style={{ fontSize:"0.6875rem", fontWeight:500, color:"var(--tertiary)", marginTop:4 }}>X Community</p>
            </div>
          )}
        </div>

        {/* Tweets */}
        {[sp?.best_tweet_2d, sp?.best_tweet_week].filter(Boolean).slice(0,2).map((t, i) => (
          <a key={i} href={(t as BestTweet).tweet_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ textDecoration:"none", display:"block", borderRadius:12,
              border:"1px solid var(--separator)", background:"var(--fill-primary)", overflow:"hidden" }}>
            <div style={{ padding:"12px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <img src="https://unavatar.io/twitter/67coinX" width={22} height={22}
                  style={{ borderRadius:"50%", objectFit:"cover", flexShrink:0 }} alt="67" />
                <div>
                  <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--foreground)", margin:0, lineHeight:1.2 }}>The Official 67 Coin</p>
                  <p style={{ fontSize:"0.5625rem", color:"var(--tertiary)", margin:0 }}>@67coinX · {(t as BestTweet).date}</p>
                </div>
                <span style={{ marginLeft:"auto", fontSize:"0.875rem", fontWeight:900, color:"var(--foreground)" }}>𝕏</span>
              </div>
              <p style={{ fontSize:"0.8125rem", color:"var(--foreground)", lineHeight:1.5, margin:"0 0 8px 0",
                display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {(t as BestTweet).text}
              </p>
              <div style={{ display:"flex", gap:14 }}>
                <span style={{ fontSize:"0.75rem", color:"#F43F5E", fontWeight:600 }}>♡ {(t as BestTweet).likes}</span>
                <span style={{ fontSize:"0.75rem", color:"var(--secondary)", fontWeight:600 }}>💬 {(t as BestTweet).replies}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {recentJoins.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:4 }}>
          <AvatarStack joins={recentJoins} />
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)", margin:0 }}>
              {recentJoins[0]?.user}
              {recentJoins[1] ? ` & ${recentJoins.length - 1} others` : ""} recently said hi
            </p>
            <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {recentJoins[0]?.message || "Introduced themselves in #introductions"}
            </p>
          </div>
        </div>
      )}

      {/* Top Contributors preview */}
      {topContribs.length > 0 && (
        <div style={{ borderTop:"1px solid var(--separator)", paddingTop:16 }}>
          <p style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Most Active Today</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {topContribs.slice(0,4).map((c, i) => (
              <div key={c.user_id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:"0.6875rem", width:14, textAlign:"right", flexShrink:0 }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</span>
                <img src={c.avatar} alt={c.user} width={22} height={22} style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover", background:"var(--fill-primary)" }} onError={e=>{(e.target as HTMLImageElement).src="https://cdn.discordapp.com/embed/avatars/0.png"}} />
                <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.user}</span>
                <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#818CF8", background:"rgba(88,101,242,0.15)", borderRadius:99, padding:"2px 7px", flexShrink:0 }}>{c.msg_count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Introductions preview */}
      {recentJoins.length > 0 && (
        <div style={{ borderTop:"1px solid var(--separator)", paddingTop:16 }}>
          <p style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Recent Introductions (24h)</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {recentJoins.slice(0,4).map(j => (
              <div key={j.user_id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:"rgba(0,0,0,0.02)", borderRadius:10 }}>
                <img src={j.avatar} alt={j.user} width={30} height={30}
                  style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover", background:"var(--fill-primary)" }}
                  onError={e=>{(e.target as HTMLImageElement).src=`https://cdn.discordapp.com/embed/avatars/${parseInt(j.user_id.slice(-1),16)%5}.png`}} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", margin:0 }}>{j.user}</p>
                  {j.message && <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{j.message}</p>}
                </div>
                <span style={{ fontSize:"0.6rem", color:"var(--tertiary)", flexShrink:0, whiteSpace:"nowrap" }}>{j.time_ago}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── Expanded view ──────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:6, borderBottom:"1px solid var(--separator)", paddingBottom:12 }}>
        {([
          { id:"overview",     label:"Overview",     icon:<img src="/67logo.png" alt="67" style={{ width:14, height:14, borderRadius:"50%", objectFit:"cover" }} /> },
          { id:"leaderboard",  label:"Leaderboard",  icon:"⚔️" },
        ] as { id: "overview" | "leaderboard"; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.id} onClick={() => setSection(t.id)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer", fontSize:"0.75rem", fontWeight:700, transition:"all 0.15s",
              background: section === t.id ? "#09090B" : "transparent",
              color: section === t.id ? "#fff" : "var(--secondary)",
            }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {section === "leaderboard" && <LeaderboardPanel />}

      {section === "overview" && <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"start" }}>

      {/* ══════════════ LEFT — DISCORD ══════════════ */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* Discord header */}
        <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid rgba(88,101,242,0.18)" }}>
          <div style={{ background:"linear-gradient(135deg, #5865F2, #7289DA)", padding:"18px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <svg width="16" height="12" viewBox="0 0 71 55" fill="none"><path d="M60.1 4.9A58.6 58.6 0 0045.6.9a40.5 40.5 0 00-1.8 3.7 54.2 54.2 0 00-16.2 0A39 39 0 0025.8.9 58.5 58.5 0 0011.3 5C1.6 19.1-1 32.8.3 46.4a59 59 0 0018 9.1 44.7 44.7 0 003.8-6.2 38.4 38.4 0 01-6-2.9l1.5-1.1a42.2 42.2 0 0036.2 0l1.5 1.1a38.4 38.4 0 01-6 2.9 44.7 44.7 0 003.8 6.2 58.7 58.7 0 0018-9.1C72 30.6 68 17 60.1 4.9zM23.7 38.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.4 3.2 6.3 7.2 0 4-2.8 7.2-6.3 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.3 3.2 6.3 7.2 0 4-2.8 7.2-6.3 7.2z" fill="white" opacity="0.7"/></svg>
                  <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"rgba(255,255,255,0.6)", letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>Discord</p>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:4 }}>
                  <p style={{ fontSize:"2.5rem", fontWeight:900, color:"#fff", letterSpacing:"-0.05em", lineHeight:1, margin:0 }}>{fmtM}</p>
                  {!!discordDelta && (
                    <span style={{ fontSize:"0.875rem", fontWeight:700, color: discordDelta > 0 ? "#86EFAC" : "#FCA5A5", background: discordDelta > 0 ? "rgba(134,239,172,0.18)" : "rgba(252,165,165,0.18)", borderRadius:99, padding:"3px 9px" }}>
                      {discordDelta > 0 ? "+" : ""}{discordDelta.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {boostCount > 0 && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"5px 10px" }}>
                  <Zap style={{ width:12, height:12, color:"#FBB6FF" }} />
                  <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#fff" }}>Lvl {boostLevel} · {boostCount}</span>
                </div>
              )}
            </div>
            {/* Status pills */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"4px 10px", fontSize:"0.75rem", fontWeight:600, color:"#fff" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#43B581", display:"inline-block" }} />{onlineNow} online
              </span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"4px 10px", fontSize:"0.75rem", fontWeight:600, color:"#fff" }}>
                👋 {discordDelta != null ? (discordDelta > 0 ? `+${discordDelta} today` : "0 today") : `${c?.new_joins_24h ?? 0} today`}
              </span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"4px 10px", fontSize:"0.75rem", fontWeight:600, color:"#fff" }}>
                💬 {activeToday} active
              </span>
              {voiceChs.length > 0 && (
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"4px 10px", fontSize:"0.75rem", fontWeight:600, color:"#fff" }}>
                  <Mic style={{ width:11, height:11 }} />{voiceChs.reduce((a, v) => a + v.member_count, 0)} in voice
                </span>
              )}
            </div>
          </div>
          {/* Stats grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"rgba(88,101,242,0.08)" }}>
            {[
              { label:"New Joins 24h", value: discordDelta != null ? String(Math.max(0, discordDelta)) : String(c?.new_joins_24h ?? "—"), color:"#2563EB" },
              { label:"Active Today",  value: activeToday > 0 ? String(activeToday) : "—", color:"#059669" },
              { label:"Telegram",      value: (c?.telegram_members ?? 0).toLocaleString(), color:"#0284C7", delta: telegramDelta },
              { label:"Online Now",    value: onlineNow.toLocaleString(), color:"#16A34A" },
            ].map(s => (
              <div key={s.label} style={{ background:"var(--card)", padding:"12px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
                  <p style={{ fontSize:"1.375rem", fontWeight:800, letterSpacing:"-0.04em", color:s.color, lineHeight:1, margin:0 }}>{s.value}</p>
                  {(s as { delta?: number }).delta !== undefined && !!((s as { delta?: number }).delta) && <DeltaBadge value={(s as { delta?: number }).delta} />}
                </div>
                <p style={{ fontSize:"0.6875rem", fontWeight:600, color:s.color, opacity:0.6, marginTop:3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="inset-cell">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <p className="hero-label">Goal: 10,000 Members</p>
            <span style={{ fontSize:"0.875rem", fontWeight:800, color:"#5865F2" }}>{pct.toFixed(1)}%</span>
          </div>
          <div className="prog-track" style={{ height:8 }}>
            <div className="prog-fill" style={{ height:8, width:`${pct}%`, background:"linear-gradient(90deg,#5865F2,#7289DA)" }} />
          </div>
          <p style={{ fontSize:"0.75rem", color:"var(--secondary)", marginTop:5 }}>{(goal - members).toLocaleString()} to go</p>
        </div>

        {/* Voice Channels */}
        {voiceChs.length > 0 && (
          <div className="inset-cell">
            <SectionLabel icon={<Mic style={{ width:12, height:12 }} />} label="Voice — Live Now" />
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {voiceChs.map(vc => (
                <div key={vc.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:"rgba(88,101,242,0.05)", borderRadius:10, border:"1px solid rgba(88,101,242,0.12)" }}>
                  <div>
                    <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", margin:0 }}>🔊 {vc.name}</p>
                    <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", margin:0 }}>{vc.members.slice(0, 4).map(m => `@${m}`).join(", ")}{vc.member_count > 4 ? ` +${vc.member_count - 4}` : ""}</p>
                  </div>
                  <span style={{ background:"rgba(88,101,242,0.15)", color:"#818CF8", borderRadius:99, padding:"3px 9px", fontSize:"0.75rem", fontWeight:700 }}>{vc.member_count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Channels */}
        {topChannels.length > 0 && (
          <div className="inset-cell">
            <SectionLabel icon={<span style={{ fontSize:"0.75rem" }}>💬</span>} label="Active Channels" />
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {topChannels.map((ch, i) => {
                const max24h = topChannels[0]?.msgs_24h ?? 1
                const barPct = Math.max(8, ((ch.msgs_24h ?? ch.msgs_1h) / max24h) * 100)
                return (
                  <div key={ch.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:"0.75rem", color:"var(--tertiary)", fontWeight:700, width:14, textAlign:"right", flexShrink:0 }}>{i + 1}</span>
                    <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", width:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flexShrink:0 }}>#{ch.name.replace(/^[\p{Emoji}\s]+/u, "")}</span>
                    <div style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ flex:1, height:6, background:"rgba(0,0,0,0.06)", borderRadius:99, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${barPct}%`, background:"#5865F2", borderRadius:99, opacity:0.7 }} />
                      </div>
                      <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#5865F2", width:28, textAlign:"right", flexShrink:0 }}>{ch.msgs_24h ?? "—"}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top Contributors */}
        {topContribs.length > 0 && (
          <div className="inset-cell">
            <SectionLabel icon={<Trophy style={{ width:12, height:12 }} />} label="Most Active Today" />
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {topContribs.slice(0, 6).map((c, i) => (
                <div key={c.user_id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:"0.6875rem", fontWeight:800, color:"var(--secondary)", width:16, textAlign:"right", flexShrink:0 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}</span>
                  <img src={c.avatar} alt={c.user} width={24} height={24} style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover", background:"var(--fill-primary)" }} onError={e => { (e.target as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png" }} />
                  <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.user}</span>
                  <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#818CF8", background:"rgba(88,101,242,0.15)", borderRadius:99, padding:"2px 8px", flexShrink:0 }}>{c.msg_count} msgs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mod Events */}
        {(modEvents.length > 0 || legacyActivity.filter(a => a.type !== "join").length > 0) && (
          <div className="inset-cell">
            <SectionLabel icon={<Shield style={{ width:12, height:12 }} />} label="Mod Events" />
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {modEvents.map((ev, i) => {
                const cfg = typeConfig(ev.type)
                const fallbackAv = "https://cdn.discordapp.com/embed/avatars/0.png"
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10 }}>
                    <img src={ev.avatar || fallbackAv} alt={ev.user} width={28} height={28} style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).src = fallbackAv }} />
                    <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.user}</span>
                    <span style={{ fontSize:"0.6875rem", fontWeight:700, color:cfg.color, background:cfg.bg, borderRadius:99, padding:"2px 8px", flexShrink:0 }}>{ev.detail}</span>
                    <span style={{ fontSize:"0.72rem", color:"var(--tertiary)", flexShrink:0 }}>{ev.time_ago}</span>
                  </div>
                )
              })}
              {legacyActivity.filter(a => a.type !== "join").slice(0, 4).map((item, i) => {
                const cfg = typeConfig(item.type)
                const fallbackAv = "https://cdn.discordapp.com/embed/avatars/0.png"
                const label = item.detail ? item.detail.split("·")[0].trim() : cfg.label
                return (
                  <div key={`legacy-${i}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10 }}>
                    {item.source === "telegram" ? (
                      <span style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, background:"#229ED9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.875rem" }}>✈️</span>
                    ) : (
                      <img src={item.avatar || fallbackAv} alt={item.user} width={28} height={28} style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).src = fallbackAv }} />
                    )}
                    <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.user}</span>
                    <span style={{ fontSize:"0.6875rem", fontWeight:700, color:cfg.color, background:cfg.bg, borderRadius:99, padding:"2px 8px", flexShrink:0 }}>{label}</span>
                    {item.time_ago && <span style={{ fontSize:"0.72rem", color:"var(--tertiary)", flexShrink:0 }}>{item.time_ago}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Introductions */}
        {recentJoins.length > 0 && (
          <div>
            <SectionLabel icon={<span style={{ fontSize:"0.75rem" }}>👋</span>} label="Recent Introductions (24h)" />
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {recentJoins.map(j => (
                <div key={j.user_id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10 }}>
                  <img src={j.avatar} alt={j.user} width={32} height={32} style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover", background:"var(--fill-primary)" }} onError={e => { (e.target as HTMLImageElement).src = `https://cdn.discordapp.com/embed/avatars/${parseInt(j.user_id.slice(-1),16)%5}.png` }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", margin:0 }}>{j.user}</p>
                    {j.message && <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{j.message}</p>}
                  </div>
                  <span style={{ fontSize:"0.7rem", color:"var(--tertiary)", flexShrink:0, whiteSpace:"nowrap" }}>{j.time_ago}</span>
                  <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#60A5FA", background:"rgba(96,165,250,0.15)", borderRadius:99, padding:"2px 8px", flexShrink:0 }}>Joined</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Events */}
        {events.length > 0 && (
          <div className="inset-cell">
            <SectionLabel icon={<Calendar style={{ width:12, height:12 }} />} label="Upcoming Events" />
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {events.map((ev, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", background:"rgba(245,166,35,0.05)", borderRadius:10, border:"1px solid rgba(245,166,35,0.15)" }}>
                  <div style={{ flex:1, minWidth:0, marginRight:8 }}>
                    <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.name}</p>
                    {ev.description && <p style={{ fontSize:"0.6875rem", color:"var(--tertiary)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.description}</p>}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <p style={{ fontSize:"0.75rem", fontWeight:700, color:"#F5A623", margin:0 }}>{timeToEvent(ev.start)}</p>
                    {(ev.user_count ?? 0) > 0 && <p style={{ fontSize:"0.6875rem", color:"var(--secondary)", margin:0 }}>{ev.user_count} interested</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>{/* end LEFT col */}

      {/* ══════════════ RIGHT — X / TWITTER ══════════════ */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* X header */}
        <div style={{ borderRadius:16, border:"1px solid rgba(0,0,0,0.12)", overflow:"hidden" }}>
          <div style={{ background:"#F5A623", padding:"20px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.7"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Z"/></svg>
                <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>X / Twitter</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:12 }}>
              <p style={{ fontSize:"2.5rem", fontWeight:900, color:"#fff", letterSpacing:"-0.055em", lineHeight:1, margin:0 }}>{xFollowers > 0 ? xFollowers.toLocaleString() : "—"}</p>
              <span style={{ fontSize:"0.875rem", fontWeight:600, color:"rgba(255,255,255,0.45)" }}>followers</span>
              {xDelta !== 0 && (
                <span style={{ fontSize:"0.875rem", fontWeight:700, color: xDelta > 0 ? "#86EFAC" : "#FCA5A5", background: xDelta > 0 ? "rgba(134,239,172,0.18)" : "rgba(252,165,165,0.18)", borderRadius:99, padding:"3px 9px" }}>
                  {xDelta > 0 ? "+" : ""}{xDelta}
                </span>
              )}
            </div>
            {/* Growth pills */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[{ label:"20h", val:xDelta }, { label:"3d", val:xDelta3d }, { label:"7d", val:xDelta7d }].map(({ label, val }) => (
                <span key={label} style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(255,255,255,0.1)", borderRadius:99, padding:"4px 10px", fontSize:"0.75rem", fontWeight:700, color: val > 0 ? "#86EFAC" : val < 0 ? "#FCA5A5" : "rgba(255,255,255,0.6)" }}>
                  {val > 0 ? "+" : ""}{val} / {label}
                </span>
              ))}

            </div>
          </div>

          {/* Follower Chart */}
          <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px" }}>Follower History</p>
            {sp?.follower_history && sp.follower_history.length > 1 ? (
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={sp.follower_history.slice(-14)} margin={{ top:2, right:0, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="commFGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#F5A623" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize:9, fill:"#C7C7CC" }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" />
                  <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid #F0F0F2", borderRadius:8, fontSize:12, padding:"6px 10px" }} formatter={(v: number | undefined) => [(v ?? 0).toLocaleString(), "Followers"]} />
                  <Area type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} fill="url(#commFGrad2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[{ label:"20h", val:xDelta }, { label:"3 days", val:xDelta3d }, { label:"7 days", val:xDelta7d }].map(({ label, val }) => (
                  <div key={label} style={{ background: val > 0 ? "rgba(5,150,105,0.07)" : val < 0 ? "rgba(239,68,68,0.07)" : "#F5F5F7", borderRadius:10, padding:"10px 12px", textAlign:"center", border:`1px solid ${val > 0 ? "rgba(5,150,105,0.15)" : val < 0 ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.06)"}` }}>
                    <p style={{ fontSize:"1.25rem", fontWeight:800, lineHeight:1, margin:0, color: val > 0 ? "#059669" : val < 0 ? "#EF4444" : "#8E8E93" }}>{val > 0 ? "+" : ""}{val}</p>
                    <p style={{ fontSize:"0.625rem", color:"var(--tertiary)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* X Community stat row */}
          {xCommunity > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"rgba(0,0,0,0.04)", borderTop:"1px solid var(--separator)", borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ background:"var(--card)", padding:"12px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <p style={{ fontSize:"1.375rem", fontWeight:800, letterSpacing:"-0.04em", color:"#F5A623", lineHeight:1, margin:0 }}>{xCommunity.toLocaleString()}</p>
                  {xCommunityDelta !== 0 && <DeltaBadge value={xCommunityDelta} />}
                </div>
                <p style={{ fontSize:"0.6875rem", fontWeight:600, color:"#F5A623", opacity:0.7, marginTop:3 }}>X Community</p>
              </div>
              <div style={{ background:"var(--card)", padding:"12px 14px" }}>
                <p style={{ fontSize:"1.375rem", fontWeight:800, letterSpacing:"-0.04em", color:"#1D9BF0", lineHeight:1, margin:0 }}>{xEngagement > 0 ? `${xEngagement.toFixed(1)}%` : "—"}</p>
                <p style={{ fontSize:"0.6875rem", fontWeight:600, color:"#1D9BF0", opacity:0.7, marginTop:3 }}>Engagement Rate</p>
              </div>
            </div>
          )}

          {/* Engagement Rate + Content Performance */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
            <div style={{ padding:"14px 16px", borderRight:"1px solid rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Engagement Rate</p>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span style={{ fontSize:"2rem", fontWeight:900, color: xEngagement > 2 ? "#059669" : "#F5A623", lineHeight:1 }}>{xEngagement > 0 ? xEngagement.toFixed(1) : "—"}</span>
                {xEngagement > 0 && <span style={{ fontSize:"1rem", fontWeight:700, color:"var(--tertiary)" }}>%</span>}
              </div>
              <div style={{ display:"flex", gap:10, marginTop:8, flexWrap:"wrap" }}>
                {[
                  { v: sp?.avg_engagement?.toLocaleString() ?? "—", l: "Avg / Tweet" },
                  { v: sp?.total_engagement_7d?.toLocaleString() ?? "—", l: "Total 7d" },
                  { v: String(sp?.posting_streak_days ?? "—"), l: "Day Streak" },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--foreground)", margin:0 }}>{v}</p>
                    <p style={{ fontSize:"0.6rem", color:"var(--tertiary)", fontWeight:600 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding:"14px 16px" }}>
              <p style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Content Performance</p>
              {sp?.content_type_stats && Object.keys(sp.content_type_stats).length > 0 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {Object.entries(sp.content_type_stats)
                    .sort(([,a],[,b]) => (b as {avg_eng:number}).avg_eng - (a as {avg_eng:number}).avg_eng)
                    .slice(0, 4)
                    .map(([type, s]) => {
                      const stat = s as { count: number; avg_eng: number }
                      const maxEng = Math.max(...Object.values(sp.content_type_stats).map(v => (v as {avg_eng:number}).avg_eng))
                      const p = maxEng > 0 ? (stat.avg_eng / maxEng) * 100 : 0
                      return (
                        <div key={type}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                            <span style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--foreground)", textTransform:"capitalize" }}>{type}</span>
                            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#F5A623" }}>{stat.avg_eng.toFixed(0)}</span>
                          </div>
                          <div style={{ height:4, borderRadius:99, background:"rgba(0,0,0,0.06)" }}>
                            <div style={{ height:"100%", borderRadius:99, background:"#F5A623", width:`${p}%` }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : <p style={{ fontSize:"0.875rem", color:"var(--tertiary)" }}>No data yet</p>}
            </div>
          </div>

        </div>

        {/* Trending Posts */}
        {(bestTweet48h || bestTweetWeek) && (
          <div>
            <p style={{ fontSize:"0.6875rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Trending Posts</p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {([
                { label:"Best · 48h", tweet: bestTweet48h },
                { label:"Best · 7 days", tweet: bestTweetWeek },
              ] as { label: string; tweet: typeof bestTweet48h }[]).map(({ label, tweet }) => tweet ? (
                <a key={label} href={tweet.tweet_url} target="_blank" rel="noreferrer" style={{ textDecoration:"none", display:"flex", flexDirection:"column", background:"var(--card)", borderRadius:16, overflow:"hidden", border:"1px solid rgba(0,0,0,0.09)", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                  {tweet.img_url && <img src={tweet.img_url} alt="" style={{ width:"100%", height:160, objectFit:"cover" }} />}
                  <div style={{ padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#1D1D1F"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Z"/></svg>
                    </div>
                    <p style={{ fontSize:"0.875rem", color:"var(--foreground)", lineHeight:1.55, margin:0, flex:1, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{tweet.text}</p>
                    <div style={{ display:"flex", gap:14, borderTop:"1px solid var(--separator)", paddingTop:8 }}>
                      <span style={{ fontSize:"0.8125rem", color:"#EF4444", fontWeight:700 }}>❤️ {tweet.likes.toLocaleString()}</span>
                      <span style={{ fontSize:"0.8125rem", color:"#60A5FA", fontWeight:700 }}>💬 {tweet.replies.toLocaleString()}</span>
                      <span style={{ fontSize:"0.75rem", color:"var(--tertiary)", marginLeft:"auto" }}>{new Date(tweet.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </a>
              ) : null)}
            </div>
          </div>
        )}

      </div>{/* end RIGHT col */}

      </div>}{/* end overview section */}

    </div>
  )

  return (
    <DashboardCard compact
      expandedMaxWidth={1100}
      title="Community"
      subtitle="Discord · Telegram · X"
      icon={<Users style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
