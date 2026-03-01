"use client"

import { Users, Mic, Calendar, Zap, Trophy, Shield } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
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
      <span style={{ color:"#A1A1AA", display:"flex" }}>{icon}</span>
      <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#A1A1AA", letterSpacing:"0.06em", textTransform:"uppercase", margin:0 }}>
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
          background:"#E5E7EB",
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
          background:"#E5E7EB",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"0.6rem", fontWeight:700, color:"#6B7280",
        }}>
          +{joins.length - 5}
        </div>
      )}
    </div>
  )
}

function typeConfig(type: string): { bg: string; color: string; label: string } {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    join:  { bg:"#DBEAFE", color:"#1D4ED8", label:"Joined"  },
    ban:   { bg:"#FEE2E2", color:"#B91C1C", label:"Banned"  },
    kick:  { bg:"#FEF3C7", color:"#B45309", label:"Kicked"  },
    spam:  { bg:"#FCE7F3", color:"#BE185D", label:"Spam"    },
    warn:  { bg:"#FEF9C3", color:"#A16207", label:"Warned"  },
  }
  return map[type] ?? { bg:"#F3F4F6", color:"#374151", label:"Event" }
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
  const c = data?.community

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

  // ── Collapsed view ──────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Hero */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p className="hero-label" style={{ marginBottom:8 }}>Discord Members</p>
          <div style={{ display:"flex", alignItems:"center" }}>
            <p className="hero-number">{fmtM}</p>
            <DeltaBadge value={discordDelta} />
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:"#E8F8EE", padding:"6px 12px", borderRadius:99,
          }}>
            <span className="dot-on" style={{ width:7, height:7 }} />
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#1A8343" }}>{onlineNow} online</span>
          </span>
          {voiceChs.length > 0 && (
            <span style={{
              display:"inline-flex", alignItems:"center", gap:5,
              background:"#F0F4FF", padding:"4px 10px", borderRadius:99,
              fontSize:"0.75rem", fontWeight:600, color:"#5865F2",
            }}>
              <Mic style={{ width:11, height:11 }} />
              {voiceChs.reduce((a, v) => a + v.member_count, 0)} in voice
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:16 }}>
        {[
          { label:"New Joins 24h", value: discordDelta != null ? String(Math.max(0, discordDelta)) : String(c?.new_joins_24h ?? "—") },
          { label:"Active Today",  value: activeToday > 0 ? String(activeToday) : "—" },
          { label:"Telegram",      value: (c?.telegram_members ?? 0).toLocaleString(), delta: telegramDelta },
        ].map(s => (
          <div key={s.label} className="inset-cell" style={{ textAlign:"center" }}>
            <p style={{ fontSize:"1.25rem", fontWeight:700, letterSpacing:"-0.03em", color:"#1D1D1F", margin:0 }}>{s.value}</p>
            {s.delta !== undefined && <DeltaBadge value={s.delta} />}
            <p style={{ fontSize:"0.6875rem", fontWeight:500, color:"#8E8E93", marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent members mini-row */}
      {recentJoins.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:4 }}>
          <AvatarStack joins={recentJoins} />
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:"0.75rem", fontWeight:600, color:"#1D1D1F", margin:0 }}>
              {recentJoins[0]?.user}
              {recentJoins[1] ? ` & ${recentJoins.length - 1} others` : ""} recently said hi
            </p>
            <p style={{ fontSize:"0.6875rem", color:"#8E8E93", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {recentJoins[0]?.message || "Introduced themselves in #introductions"}
            </p>
          </div>
        </div>
      )}
    </div>
  )

  // ── Expanded view ──────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

      {/* ── Discord header ── */}
      <div style={{ background:"linear-gradient(135deg, #5865F2, #7289DA)", borderRadius:16, padding:"20px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"rgba(255,255,255,0.55)", letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>Discord</p>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:4 }}>
              <p style={{ fontSize:"3rem", fontWeight:900, color:"#fff", letterSpacing:"-0.055em", lineHeight:1, margin:0 }}>{fmtM}</p>
              {!!discordDelta && (
                <span style={{
                  fontSize:"0.875rem", fontWeight:700,
                  color: discordDelta > 0 ? "#86EFAC" : "#FCA5A5",
                  background: discordDelta > 0 ? "rgba(134,239,172,0.18)" : "rgba(252,165,165,0.18)",
                  borderRadius:99, padding:"3px 9px",
                }}>
                  {discordDelta > 0 ? "+" : ""}{discordDelta.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          {/* Boost badge */}
          {boostCount > 0 && (
            <div style={{ textAlign:"right" }}>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:5,
                background:"rgba(255,255,255,0.15)", borderRadius:99,
                padding:"6px 12px",
              }}>
                <Zap style={{ width:13, height:13, color:"#FBB6FF" }} />
                <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#fff" }}>
                  Lvl {boostLevel} · {boostCount} boosts
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status pills */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:5,
            background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"5px 11px",
            fontSize:"0.75rem", fontWeight:600, color:"#fff",
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#43B581", display:"inline-block" }} />
            {onlineNow} online
          </span>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:5,
            background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"5px 11px",
            fontSize:"0.75rem", fontWeight:600, color:"#fff",
          }}>
            👋 {discordDelta != null
              ? discordDelta > 0 ? `+${discordDelta} joined today` : "0 joined today"
              : `${c?.new_joins_24h ?? 0} joined today`}
          </span>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:5,
            background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"5px 11px",
            fontSize:"0.75rem", fontWeight:600, color:"#fff",
          }}>
            💬 {activeToday} active today
          </span>
          {voiceChs.length > 0 && (
            <span style={{
              display:"inline-flex", alignItems:"center", gap:5,
              background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"5px 11px",
              fontSize:"0.75rem", fontWeight:600, color:"#fff",
            }}>
              <Mic style={{ width:11, height:11 }} />
              {voiceChs.reduce((a, v) => a + v.member_count, 0)} in voice
            </span>
          )}
        </div>
      </div>

      {/* ── Membership + Telegram stats 2×2 ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          { label:"New Joins 24h", value: discordDelta != null ? String(Math.max(0, discordDelta)) : String(c?.new_joins_24h ?? "—"), bg:"#EFF6FF", color:"#2563EB" },
          { label:"Active Today",  value: activeToday > 0 ? String(activeToday) : "—", bg:"#ECFDF5", color:"#059669" },
          { label:"Telegram",      value: (c?.telegram_members ?? 0).toLocaleString(), bg:"#F0F9FF", color:"#0284C7", delta: telegramDelta },
          { label:"Online Now",    value: onlineNow.toLocaleString(), bg:"#F0FDF4", color:"#16A34A" },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"13px 15px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
              <p style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.04em", color:s.color, lineHeight:1, margin:0 }}>{s.value}</p>
              {(s as { delta?: number }).delta !== undefined && !!((s as { delta?: number }).delta) && (
                <DeltaBadge value={(s as { delta?: number }).delta} />
              )}
            </div>
            <p style={{ fontSize:"0.6875rem", fontWeight:600, color:s.color, opacity:0.65, marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="inset-cell">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <p className="hero-label">Goal: 10,000 Members</p>
          <span style={{ fontSize:"0.875rem", fontWeight:800, color:"#5865F2" }}>{pct.toFixed(1)}%</span>
        </div>
        <div className="prog-track" style={{ height:8 }}>
          <div className="prog-fill" style={{ height:8, width:`${pct}%`, background:"linear-gradient(90deg,#5865F2,#7289DA)" }} />
        </div>
        <p style={{ fontSize:"0.75rem", color:"#A1A1AA", marginTop:6 }}>
          {(goal - members).toLocaleString()} members to go
        </p>
      </div>

      {/* ── Voice Channels (live) ── */}
      {voiceChs.length > 0 && (
        <div className="inset-cell">
          <SectionLabel icon={<Mic style={{ width:12, height:12 }} />} label="Voice — Live Now" />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {voiceChs.map((vc) => (
              <div key={vc.name} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"8px 12px", background:"rgba(88,101,242,0.05)", borderRadius:10,
                border:"1px solid rgba(88,101,242,0.12)",
              }}>
                <div>
                  <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"#1D1D1F", margin:0 }}>🔊 {vc.name}</p>
                  <p style={{ fontSize:"0.6875rem", color:"#8E8E93", margin:0 }}>
                    {vc.members.slice(0, 4).map(m => `@${m}`).join(", ")}{vc.member_count > 4 ? ` +${vc.member_count - 4}` : ""}
                  </p>
                </div>
                <span style={{
                  background:"#EFF1FE", color:"#5865F2",
                  borderRadius:99, padding:"3px 9px",
                  fontSize:"0.75rem", fontWeight:700,
                }}>
                  {vc.member_count} {vc.member_count === 1 ? "person" : "people"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Scheduled Events ── */}
      {events.length > 0 && (
        <div className="inset-cell">
          <SectionLabel icon={<Calendar style={{ width:12, height:12 }} />} label="Upcoming Events" />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {events.map((ev, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"9px 12px", background:"rgba(245,166,35,0.05)", borderRadius:10,
                border:"1px solid rgba(245,166,35,0.15)",
              }}>
                <div style={{ flex:1, minWidth:0, marginRight:8 }}>
                  <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"#1D1D1F", margin:0,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.name}</p>
                  {ev.description && (
                    <p style={{ fontSize:"0.6875rem", color:"#8E8E93", margin:0,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.description}</p>
                  )}
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ fontSize:"0.75rem", fontWeight:700, color:"#F5A623", margin:0 }}>
                    {timeToEvent(ev.start)}
                  </p>
                  {(ev.user_count ?? 0) > 0 && (
                    <p style={{ fontSize:"0.6875rem", color:"#A1A1AA", margin:0 }}>
                      {ev.user_count} interested
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Active Channels ── */}
      {topChannels.length > 0 && (
        <div className="inset-cell">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <SectionLabel icon={<span style={{ fontSize:"0.75rem" }}>💬</span>} label="Active Channels" />
            <div style={{ display:"flex", gap:10, fontSize:"0.6rem", color:"#C7C7CC", fontWeight:600, letterSpacing:"0.04em" }}>
              <span>24H</span><span style={{ opacity:0.5 }}>1H</span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {topChannels.map((ch, i) => {
              const max24h = topChannels[0]?.msgs_24h ?? 1
              const barW = Math.max(16, ((ch.msgs_24h ?? ch.msgs_1h) / max24h) * 80)
              return (
                <div key={ch.name} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:"0.75rem", color:"#C7C7CC", fontWeight:700, width:16, textAlign:"right" }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F", flex:1,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    #{ch.name.replace(/^[\p{Emoji}\s]+/u, "")}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                    <div style={{
                      height:6, width:barW,
                      background:"#5865F2", borderRadius:99, opacity:0.65,
                    }} />
                    <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#5865F2", minWidth:28, textAlign:"right" }}>
                      {ch.msgs_24h ?? "—"}
                    </span>
                    {(ch.msgs_1h ?? 0) > 0 && (
                      <span style={{
                        fontSize:"0.6rem", fontWeight:700,
                        color:"#10B981", background:"#DCFCE7",
                        borderRadius:99, padding:"1px 5px",
                      }}>
                        {ch.msgs_1h} live
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Top Contributors Today ── */}
      {topContribs.length > 0 && (
        <div className="inset-cell">
          <SectionLabel icon={<Trophy style={{ width:12, height:12 }} />} label="Most Active Today" />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {topContribs.slice(0, 6).map((c, i) => (
              <div key={c.user_id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{
                  fontSize:"0.6875rem", fontWeight:800, color:"#A1A1AA",
                  width:16, textAlign:"right", flexShrink:0,
                }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}
                </span>
                <img
                  src={c.avatar}
                  alt={c.user}
                  width={24} height={24}
                  style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover", background:"#E5E7EB" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://cdn.discordapp.com/embed/avatars/0.png`
                  }}
                />
                <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F", flex:1,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {c.user}
                </span>
                <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"#5865F2",
                  background:"#EFF1FE", borderRadius:99, padding:"2px 8px", flexShrink:0 }}>
                  {c.msg_count} msgs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mod Events ── */}
      {(modEvents.length > 0 || legacyActivity.filter(a => a.type !== "join").length > 0) && (
        <div className="inset-cell">
          <SectionLabel icon={<Shield style={{ width:12, height:12 }} />} label="Mod Events" />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {/* New mod events from route.ts */}
            {modEvents.map((ev, i) => {
              const cfg = typeConfig(ev.type)
              const fallbackAv = `https://cdn.discordapp.com/embed/avatars/0.png`
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"8px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10,
                }}>
                  <img
                    src={ev.avatar || fallbackAv}
                    alt={ev.user}
                    width={28} height={28}
                    style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackAv }}
                  />
                  <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F", flex:1,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.user}</span>
                  <span style={{ fontSize:"0.6875rem", fontWeight:700, color:cfg.color, background:cfg.bg,
                    borderRadius:99, padding:"2px 8px", flexShrink:0 }}>{ev.detail}</span>
                  <span style={{ fontSize:"0.72rem", color:"#C7C7CC", flexShrink:0 }}>{ev.time_ago}</span>
                </div>
              )
            })}
            {/* Legacy activity from Mac mini (67Bot) */}
            {legacyActivity.filter(a => a.type !== "join").slice(0, 4).map((item, i) => {
              const cfg = typeConfig(item.type)
              const fallbackAv = `https://cdn.discordapp.com/embed/avatars/0.png`
              const label = item.detail ? item.detail.split("·")[0].trim() : cfg.label
              return (
                <div key={`legacy-${i}`} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"8px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10,
                }}>
                  {item.source === "telegram" ? (
                    <span style={{ width:28, height:28, borderRadius:"50%", flexShrink:0,
                      background:"#229ED9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.875rem" }}>✈️</span>
                  ) : (
                    <img src={item.avatar || fallbackAv} alt={item.user} width={28} height={28}
                      style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = fallbackAv }} />
                  )}
                  <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F", flex:1,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.user}</span>
                  <span style={{ fontSize:"0.6875rem", fontWeight:700, color:cfg.color, background:cfg.bg,
                    borderRadius:99, padding:"2px 8px", flexShrink:0 }}>{label}</span>
                  {item.time_ago && <span style={{ fontSize:"0.72rem", color:"#C7C7CC", flexShrink:0 }}>{item.time_ago}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Recent Members from #introductions ── */}
      {recentJoins.length > 0 && (
        <div>
          <SectionLabel icon={<span style={{ fontSize:"0.75rem" }}>👋</span>} label="Recent Introductions (24h)" />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {recentJoins.length === 0 && (
              <p style={{ fontSize:"0.75rem", color:"#A1A1AA", padding:"8px 0" }}>No new introductions in the last 24h</p>
            )}
            {recentJoins.map((j) => (
              <div key={j.user_id} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"9px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10,
              }}>
                <img
                  src={j.avatar}
                  alt={j.user}
                  width={32} height={32}
                  style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover", background:"#E5E7EB" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://cdn.discordapp.com/embed/avatars/${parseInt(j.user_id.slice(-1),16)%5}.png`
                  }}
                />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"#1D1D1F", margin:0 }}>{j.user}</p>
                  {j.message && (
                    <p style={{ fontSize:"0.6875rem", color:"#8E8E93", margin:0,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {j.message}
                    </p>
                  )}
                </div>
                <span style={{ fontSize:"0.7rem", color:"#C7C7CC", flexShrink:0, whiteSpace:"nowrap" }}>
                  {j.time_ago}
                </span>
                <span style={{ fontSize:"0.6875rem", fontWeight:700,
                  color:"#2563EB", background:"#DBEAFE",
                  borderRadius:99, padding:"2px 8px", flexShrink:0 }}>
                  Joined
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )

  return (
    <DashboardCard
      title="Community"
      subtitle="Discord · Telegram · Live"
      icon={<Users style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
