"use client"

import { Users } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"
import type { ActivityItem, RecentJoin } from "@/lib/use-data"

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

export function CommunityCard() {
  const { data } = useAppData()
  const c = data?.community
  const members = c?.discord_members ?? 0
  const fmtM    = members.toLocaleString()
  const goal    = 10000
  const pct     = Math.min((members / goal) * 100, 100)

  const onlineNow          = c?.online_now         ?? 0
  const discordDelta       = c?.discord_delta_24h
  const telegramDelta      = c?.telegram_delta_24h
  const recentJoins        = c?.recent_joins        ?? []
  const activeUsersToday   = c?.active_users_today  ?? 0
  const topChannels        = c?.top_channels        ?? []

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
        <span style={{
          display:"inline-flex", alignItems:"center", gap:6,
          background:"#E8F8EE", padding:"6px 12px", borderRadius:99, marginTop:4,
        }}>
          <span className="dot-on" style={{ width:7, height:7 }} />
          <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#1A8343" }}>{onlineNow} online</span>
        </span>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:16 }}>
        {[
          { label:"New 24h",     value: String(c?.new_joins_24h ?? "—"), delta: undefined },
          { label:"Active Today",value: activeUsersToday > 0 ? String(activeUsersToday) : (c?.active_7d ?? 0).toLocaleString(), delta: undefined },
          { label:"Telegram",    value: (c?.telegram_members ?? 0).toLocaleString(), delta: telegramDelta },
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

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Big Discord block */}
      <div style={{ background:"linear-gradient(135deg, #5865F2, #7289DA)", borderRadius:16, padding:"24px 20px", textAlign:"center" }}>
        <p className="hero-label" style={{ color:"rgba(255,255,255,0.5)", marginBottom:10 }}>Discord Members</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <p style={{ fontSize:"4rem", fontWeight:900, color:"#fff", letterSpacing:"-0.055em", lineHeight:1, margin:0 }}>{fmtM}</p>
          {!!discordDelta && (
            <span style={{
              fontSize:"0.875rem", fontWeight:700,
              color: discordDelta > 0 ? "#86EFAC" : "#FCA5A5",
              background: discordDelta > 0 ? "rgba(134,239,172,0.15)" : "rgba(252,165,165,0.15)",
              borderRadius:99, padding:"4px 10px", marginTop:8,
            }}>
              {discordDelta > 0 ? "+" : ""}{discordDelta.toLocaleString()}
            </span>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:10 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#43B581", display:"inline-block" }} />
          <span style={{ fontSize:"0.875rem", fontWeight:600, color:"rgba(255,255,255,0.75)" }}>{onlineNow} members online</span>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          { label:"New Joins 24h", value: String(c?.new_joins_24h ?? "—"), bg:"#EFF6FF", color:"#2563EB", delta: undefined },
          { label:"Active Today",  value: activeUsersToday > 0 ? String(activeUsersToday) : "—", bg:"#ECFDF5", color:"#059669", delta: undefined },
          { label:"Online Now",    value: onlineNow.toLocaleString(), bg:"#F0FDF4", color:"#16A34A", delta: undefined },
          { label:"Telegram",      value: (c?.telegram_members??0).toLocaleString(), bg:"#F0F9FF", color:"#0284C7", delta: telegramDelta },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
              <p style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.04em", color:s.color, lineHeight:1, margin:0 }}>{s.value}</p>
              {s.delta !== undefined && !!s.delta && (
                <span style={{
                  fontSize:"0.75rem", fontWeight:700,
                  color: (s.delta as number) > 0 ? "#16A34A" : "#DC2626",
                  background: (s.delta as number) > 0 ? "#DCFCE7" : "#FEE2E2",
                  borderRadius:99, padding:"2px 7px",
                }}>
                  {(s.delta as number) > 0 ? "+" : ""}{(s.delta as number).toLocaleString()}
                </span>
              )}
            </div>
            <p style={{ fontSize:"0.6875rem", fontWeight:600, color:s.color, opacity:0.65, marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Goal progress */}
      <div className="inset-cell">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <p className="hero-label">Goal: 10,000 Members</p>
          <span style={{ fontSize:"0.875rem", fontWeight:800, color:"#5865F2" }}>{pct.toFixed(1)}%</span>
        </div>
        <div className="prog-track" style={{ height:10 }}>
          <div className="prog-fill" style={{ height:10, width:`${pct}%`, background:"linear-gradient(90deg,#5865F2,#7289DA)" }} />
        </div>
        <p style={{ fontSize:"0.75rem", color:"#A1A1AA", marginTop:8 }}>
          {(goal - members).toLocaleString()} members to go
        </p>
      </div>

      {/* Top active channels */}
      {topChannels.length > 0 && (
        <div className="inset-cell">
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#A1A1AA", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>
            Active Channels (last 1h)
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {topChannels.map((ch) => (
              <div key={ch.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F" }}>#{ch.name}</span>
                <span style={{
                  fontSize:"0.6875rem", fontWeight:700,
                  color:"#5865F2", background:"#EFF1FE",
                  borderRadius:99, padding:"2px 8px",
                }}>
                  {ch.msgs_1h} msgs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Members — from #introductions */}
      {recentJoins.length > 0 && (
        <div>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#A1A1AA", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>
            Recent Members
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {recentJoins.map((j) => (
              <div key={j.user_id} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10,
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
                    <p style={{ fontSize:"0.6875rem", color:"#8E8E93", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {j.message}
                    </p>
                  )}
                </div>
                <span style={{ fontSize:"0.7rem", color:"#C7C7CC", flexShrink:0, whiteSpace:"nowrap" }}>
                  {j.time_ago}
                </span>
                <span style={{
                  fontSize:"0.6875rem", fontWeight:700,
                  color:"#2563EB", background:"#DBEAFE",
                  borderRadius:99, padding:"2px 8px", flexShrink:0,
                }}>
                  Joined
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live stats row */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#A1A1AA", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4 }}>
          Live Stats
        </p>
        {[
          { dot:"#10B981", text:`${c?.new_joins_24h ?? 0} new members joined`, sub:"last 24h" },
          { dot:"#3B82F6", text:`${onlineNow} members online now`, sub:"live" },
          { dot:"#5865F2", text:`${activeUsersToday > 0 ? activeUsersToday : "—"} active users today`, sub:"#chat + #memes" },
          { dot:"#229ED9", text:`${(c?.telegram_members ?? 0).toLocaleString()} Telegram members`, sub:(c?.telegram_delta_24h ?? 0) > 0 ? `+${c!.telegram_delta_24h} today` : "live" },
        ].map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:item.dot }} />
            <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F", flex:1 }}>{item.text}</span>
            <span style={{ fontSize:"0.72rem", color:"#C7C7CC", flexShrink:0, whiteSpace:"nowrap" }}>{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Old activity items from Mac mini (67Bot logs) — only if present */}
      {(c?.recent_discord_activity ?? []).length > 0 && (
        <div>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#A1A1AA", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>
            Mod Events
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {(c!.recent_discord_activity as ActivityItem[]).map((item, i) => {
              const typeConfig: Record<string, { bg:string; color:string; label:string }> = {
                active: { bg:"#DCFCE7", color:"#15803D", label:"Active" },
                join:   { bg:"#DBEAFE", color:"#1D4ED8", label:"Joined" },
                ban:    { bg:"#FEE2E2", color:"#B91C1C", label:"Banned" },
                kick:   { bg:"#FEF3C7", color:"#B45309", label:"Warned" },
                spam:   { bg:"#FCE7F3", color:"#BE185D", label:"Spam"   },
              }
              const cfg = typeConfig[item.type] ?? typeConfig.active
              const displayLabel  = item.detail ? item.detail.split("·")[0].trim() : cfg.label
              const displayDetail = item.detail?.includes("·") ? item.detail.split("·").slice(1).join("·").trim() : ""
              const fallbackAvatar= `https://cdn.discordapp.com/embed/avatars/${(parseInt(item.user_id?.slice(-1)??"0",16)||0)%5}.png`
              const isTg          = item.source === "telegram"
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10 }}>
                  {isTg ? (
                    <span style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, background:"#229ED9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.875rem" }}>✈️</span>
                  ) : (
                    <img src={item.avatar||fallbackAvatar} alt={item.user} width={28} height={28}
                      style={{ borderRadius:"50%", flexShrink:0, objectFit:"cover", background:"#E5E7EB" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar }} />
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.user}</p>
                    {displayDetail && <p style={{ fontSize:"0.6875rem", color:"#8E8E93", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayDetail}</p>}
                  </div>
                  <span style={{ fontSize:"0.6875rem", fontWeight:700, color:cfg.color, background:cfg.bg, borderRadius:99, padding:"2px 8px", flexShrink:0 }}>{displayLabel}</span>
                  {item.time_ago && <span style={{ fontSize:"0.72rem", color:"#C7C7CC", flexShrink:0, whiteSpace:"nowrap" }}>{item.time_ago}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <DashboardCard
      title="Community"
      subtitle="Discord · Telegram"
      icon={<Users style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
