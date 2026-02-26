"use client"

import { Users } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

function DeltaBadge({ value }: { value?: number }) {
  if (value === undefined || value === null || value === 0) return null
  const pos = value > 0
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      fontSize: "0.6875rem",
      fontWeight: 700,
      color: pos ? "#16A34A" : "#DC2626",
      background: pos ? "#DCFCE7" : "#FEE2E2",
      borderRadius: 99,
      padding: "2px 7px",
      marginLeft: 6,
      letterSpacing: "0.01em",
    }}>
      {pos ? "+" : ""}{value.toLocaleString()}
    </span>
  )
}

export function CommunityCard() {
  const { data } = useAppData()
  const c = data?.community
  const members = c?.discord_members ?? 0
  const fmtM = members.toLocaleString()
  const goal = 10000
  const pct = Math.min((members / goal) * 100, 100)

  const onlineNow       = c?.online_now ?? 0
  const discordDelta    = c?.discord_delta_24h
  const telegramDelta   = c?.telegram_delta_24h
  const watchlistDelta  = c?.watchlist_delta_24h

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      {/* Hero */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p className="hero-label" style={{ marginBottom:8 }}>Discord Members</p>
          <div style={{ display:"flex", alignItems:"center" }}>
            <p className="hero-number">{fmtM}</p>
            <DeltaBadge value={discordDelta} />
          </div>
        </div>
        <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#E8F8EE", padding:"6px 12px", borderRadius:99, marginTop:4 }}>
          <span className="dot-on" style={{ width:7, height:7 }} />
          <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#1A8343" }}>{onlineNow} online</span>
        </span>
      </div>

      {/* Stats — inset-cell grey boxes */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:16 }}>
        {[
          { label:"New 24h",   value: String(c?.new_joins_24h ?? "—"), delta: undefined },
          { label:"Active 7d", value: (c?.active_7d ?? 0).toLocaleString(), delta: undefined },
          { label:"Telegram",  value: (c?.telegram_members ?? 0).toLocaleString(), delta: telegramDelta },
        ].map(s => (
          <div key={s.label} className="inset-cell" style={{ textAlign:"center" }}>
            <p style={{ fontSize:"1.25rem", fontWeight:700, letterSpacing:"-0.03em", color:"#1D1D1F", margin:0 }}>{s.value}</p>
            {s.delta !== undefined && <DeltaBadge value={s.delta} />}
            <p style={{ fontSize:"0.6875rem", fontWeight:500, color:"#8E8E93", marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Big Discord block */}
      <div style={{ background:"linear-gradient(135deg, #5865F2, #7289DA)", borderRadius:16, padding:"24px 20px", textAlign:"center" }}>
        <p className="hero-label" style={{ color:"rgba(255,255,255,0.5)", marginBottom:10 }}>Discord Members</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <p style={{ fontSize:"4rem", fontWeight:900, color:"#fff", letterSpacing:"-0.055em", lineHeight:1 }}>{fmtM}</p>
          {discordDelta !== undefined && discordDelta !== 0 && (
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
          <span className="dot-on" style={{ background:"#43B581" }} />
          <span style={{ fontSize:"0.875rem", fontWeight:600, color:"rgba(255,255,255,0.75)" }}>{onlineNow} members online</span>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          { label:"New Joins 24h", value: String(c?.new_joins_24h ?? "—"), bg:"#EFF6FF", color:"#2563EB", delta: undefined },
          { label:"Active 7d",     value: (c?.active_7d??0).toLocaleString(), bg:"#ECFDF5", color:"#059669", delta: undefined },
          { label:"Telegram",      value: (c?.telegram_members??0).toLocaleString(), bg:"#F0F9FF", color:"#0284C7", delta: telegramDelta },
          { label:"Watchlist",     value: (c?.watchlist_count??0).toLocaleString(), bg:"#FFF7ED", color:"#EA580C", delta: watchlistDelta },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
              <p style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.04em", color:s.color, lineHeight:1, margin:0 }}>{s.value}</p>
              {s.delta !== undefined && s.delta !== 0 && (
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
      {/* Recent Activity */}
      <div>
        <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#A1A1AA", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>Recent Activity</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { type:"join",    user:"new_member_67",   time:"2m ago" },
            { type:"ban",     user:"scam_bot_123",    time:"15m ago", note:"Spam detected" },
            { type:"join",    user:"crypto_fan_sol",  time:"1h ago" },
            { type:"message", user:"community_mod",   time:"2h ago",  note:"Pinned announcement" },
          ].map((item, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"rgba(0,0,0,0.02)", borderRadius:10 }}>
              <span style={{
                width:8, height:8, borderRadius:"50%", flexShrink:0,
                background: item.type==="join" ? "#10B981" : item.type==="ban" ? "#EF4444" : "#3B82F6"
              }} />
              <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F", flex:1 }}>{item.user}</span>
              {item.note && <span style={{ fontSize:"0.75rem", color:"#8E8E93" }}>{item.note}</span>}
              <span style={{ fontSize:"0.75rem", color:"#C7C7CC", flexShrink:0 }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
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
