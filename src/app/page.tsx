"use client"

import { TokenHealthCard } from "@/components/cards/token-health"
import { SocialPulseCard } from "@/components/cards/social-pulse"
import { CommunityCard } from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
import { AgentStatusCard } from "@/components/cards/agent-status"
import { MilestonesCard } from "@/components/cards/milestones"
import { useAppData } from "@/lib/data-context"

export default function Dashboard() {
  const { data } = useAppData()

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#0D0D0D] tracking-tight">
              Overview
            </h2>
            <p className="text-sm text-[#9A9082] mt-1.5 font-medium">
              Everything happening with{" "}
              <span className="font-black gold-text">$67</span>{" "}
              in one place. Click any card to expand.
            </p>
          </div>
          {data?.last_updated && (
            <p className="hidden sm:block text-xs text-[#C8C0B4] font-medium">
              Data from {new Date(data.last_updated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <TokenHealthCard />
        <SocialPulseCard />
        <CommunityCard />
        <ContentPipelineCard />
        <AgentStatusCard />
        <MilestonesCard />
      </div>

      {/* Season 2 Banner */}
      <div className="mt-8 relative overflow-hidden rounded-3xl bg-[#0D0D0D] p-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #F5A623, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #F5A623, transparent)", transform: "translate(-30%, 30%)" }} />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
              style={{ color: "#F5A623" }}>Coming Soon</p>
            <h3 className="text-3xl font-black text-white tracking-tight leading-tight">
              Season 2 is Loading
              <span className="inline-block ml-2 animate-pulse">...</span>
            </h3>
            <p className="text-sm text-white/40 mt-2 font-medium">
              More exchanges. Bigger community. Unstoppable momentum.
            </p>
            <p className="text-xs text-white/25 mt-1 font-bold tracking-widest">#67to67Billion</p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-full gold-gradient shadow-2xl shadow-amber-400/30 flex-shrink-0">
            <span className="text-black font-black text-3xl tracking-tight">67</span>
          </div>
        </div>
      </div>
    </div>
  )
}
