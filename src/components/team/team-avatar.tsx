"use client"

import { useState } from "react"
import { TeamMember } from "@/lib/types"
import { TEAM_MEMBERS } from "@/lib/mock-data"

function discordUrl(member: TeamMember) {
  if (member.discord_id) return `https://discord.com/users/${member.discord_id}`
  return null
}

const SIZE = { sm: 28, md: 36, lg: 44 }

export function TeamAvatar({ member, size = "md" }: { member: TeamMember; size?: "sm"|"md"|"lg" }) {
  const [hover, setHover] = useState(false)
  const px = SIZE[size]
  const url = discordUrl(member)

  const avatarCircle = (
    <div style={{
      width:px, height:px, borderRadius:"50%",
      background: member.color,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize: px <= 28 ? "0.5625rem" : px <= 36 ? "0.6875rem" : "0.875rem",
      fontWeight:800, color:"#fff",
      cursor: url ? "pointer" : "default", userSelect:"none",
      boxShadow: hover
        ? `0 0 0 2.5px ${member.color}55, 0 4px 12px ${member.color}44`
        : "0 0 0 2px rgba(10,10,10,0.8)",
      transition:"box-shadow 0.2s",
      position:"relative", zIndex: hover ? 10 : 1,
    }}>
      {member.avatar
        ? <img src={member.avatar} alt={member.name}
            style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} />
        : member.initials
      }
    </div>
  )

  return (
    <div
      style={{ position:"relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Avatar circle — clickable if discord_id present */}
      {url
        ? <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration:"none", display:"block" }}>
            {avatarCircle}
          </a>
        : avatarCircle
      }

      {/* Active dot */}
      {member.status === "Active" && (
        <div style={{
          position:"absolute", bottom:-1, right:-1,
          width: px <= 28 ? 8 : 10,
          height: px <= 28 ? 8 : 10,
          borderRadius:"50%", background:"#34C759",
          border:"2px solid #0A0A0A",
          zIndex:2,
        }} />
      )}

      {/* Premium hover tooltip */}
      {hover && (
        <div style={{
          position:"absolute", top:"calc(100% + 10px)", left:"50%", transform:"translateX(-50%)",
          zIndex:200, pointerEvents:"none",
          animation:"tooltipFade 0.16s ease-out",
        }}>
          {/* Arrow */}
          <div style={{
            position:"absolute", top:-5, left:"50%", transform:"translateX(-50%)",
            width:10, height:10, background:"rgba(18,18,20,0.96)",
            clipPath:"polygon(50% 0%, 0% 100%, 100% 100%)",
          }} />

          <div style={{
            background:"rgba(18,18,20,0.96)",
            backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:14, padding:"12px 14px",
            minWidth:148, boxShadow:"0 12px 32px rgba(0,0,0,0.4)",
          }}>
            {/* Color bar + name */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ width:3, height:32, borderRadius:99, background:member.color, flexShrink:0 }} />
              <div>
                <p style={{ fontSize:"0.875rem", fontWeight:800, color:"#FFFFFF", letterSpacing:"-0.02em", lineHeight:1.2 }}>
                  {member.name}
                </p>
                <p style={{ fontSize:"0.6875rem", fontWeight:500, color:"rgba(255,255,255,0.4)", marginTop:2 }}>
                  {member.role}
                </p>
              </div>
            </div>

            {/* Status row */}
            <div style={{ display:"flex", alignItems:"center", gap:6,
              paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{
                width:7, height:7, borderRadius:"50%",
                background: member.status === "Active" ? "#34C759" : "#FF3B30",
                boxShadow: member.status === "Active" ? "0 0 6px #34C75988" : "none",
              }} />
              <span style={{ fontSize:"0.6875rem", fontWeight:600,
                color: member.status === "Active" ? "#34C759" : "#FF3B30" }}>
                {member.status}
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tooltipFade {
          from { opacity:0; transform:translateX(-50%) translateY(-4px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}

export function TeamAvatarGroup() {
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      {TEAM_MEMBERS.map((m, i) => (
        <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -8, position:"relative", zIndex: TEAM_MEMBERS.length - i }}>
          <TeamAvatar member={m} size="sm" />
        </div>
      ))}
    </div>
  )
}
