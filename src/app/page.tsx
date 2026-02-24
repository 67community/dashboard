"use client"

import { TokenHealthCard }    from "@/components/cards/token-health"
import { SocialPulseCard }    from "@/components/cards/social-pulse"
import { CommunityCard }      from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
import { AgentStatusCard }    from "@/components/cards/agent-status"
import { MilestonesCard }     from "@/components/cards/milestones"
import { useAppData }         from "@/lib/data-context"

export default function Dashboard() {
  const { data } = useAppData()

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#1D1D1F", lineHeight: 1 }}>
            Overview
          </h1>
          <p className="text-sm font-medium mt-1.5" style={{ color: "#6E6E73" }}>
            Everything happening with{" "}
            <span className="font-black gold-text">$67</span>{" "}
            — tap any card to expand.
          </p>
        </div>
        {data?.last_updated && (
          <p className="hidden sm:block text-xs font-medium" style={{ color: "#C7C7CC" }}>
            Updated {new Date(data.last_updated).toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" })}
          </p>
        )}
      </div>

      {/* ── Card grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <TokenHealthCard />
        <SocialPulseCard />
        <CommunityCard />
        <ContentPipelineCard />
        <AgentStatusCard />
        <MilestonesCard />
      </div>

      {/* ── Season 2 Banner ── */}
      <div className="mt-6 relative rounded-[26px] overflow-hidden"
        style={{ background: "#1D1D1F" }}>
        {/* Glow blobs */}
        <div className="absolute" style={{
          width: 300, height: 300, borderRadius: "50%", top: -80, right: -80,
          background: "radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="absolute" style={{
          width: 200, height: 200, borderRadius: "50%", bottom: -60, left: -40,
          background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="relative flex items-center justify-between p-8 sm:p-10">
          <div>
            <p style={{ fontSize: "0.625rem", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#F5A623", marginBottom: "0.75rem" }}>
              Coming Soon
            </p>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "white", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "0.75rem" }}>
              Season 2 is Loading…
            </h2>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", fontWeight: 500, lineHeight: 1.5 }}>
              More exchanges. Bigger community.<br />
              Unstoppable momentum.
            </p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.1em", marginTop: "1rem" }}>
              #67to67Billion
            </p>
          </div>
          {/* Big 67 coin */}
          <div className="hidden sm:flex items-center justify-center flex-shrink-0"
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "linear-gradient(135deg, #F5A623, #FFD966)",
              boxShadow: "0 0 60px rgba(245,166,35,0.4), 0 0 120px rgba(245,166,35,0.1)",
            }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "black", letterSpacing: "-0.05em" }}>67</span>
          </div>
        </div>
      </div>
    </div>
  )
}
