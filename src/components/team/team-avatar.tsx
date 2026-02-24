"use client"

import { TeamMember } from "@/lib/types"
import { TEAM_MEMBERS } from "@/lib/mock-data"

interface TeamAvatarProps {
  member: TeamMember
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
}

export function TeamAvatar({ member, size = "md", showTooltip = false }: TeamAvatarProps) {
  return (
    <div className="relative group">
      <div
        className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-white shadow-sm ring-2 ring-white cursor-default select-none`}
        style={{ backgroundColor: member.color }}
        title={showTooltip ? `${member.name} — ${member.role}` : undefined}
      >
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          member.initials
        )}
      </div>
      {member.status === "Active" && (
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white" />
      )}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {member.name}
          <div className="text-gray-400">{member.role}</div>
        </div>
      )}
    </div>
  )
}

export function TeamAvatarGroup() {
  return (
    <div className="flex items-center -space-x-2">
      {TEAM_MEMBERS.map((member) => (
        <TeamAvatar key={member.id} member={member} size="sm" showTooltip />
      ))}
      <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium cursor-default">
        +{TEAM_MEMBERS.length}
      </div>
    </div>
  )
}
