"use client"

import { TokenHealthCard }    from "@/components/cards/token-health"
import { SocialPulseCard }    from "@/components/cards/social-pulse"
import { CommunityCard }      from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
import { AgentStatusCard }    from "@/components/cards/agent-status"
import { MilestonesCard }     from "@/components/cards/milestones"
import { useAppData }         from "@/lib/data-context"

export default function Dashboard() {
  const { data, livePrice, liveChange24h } = useAppData()
  const up = (liveChange24h ?? data?.token_health?.price_change_24h ?? 0) >= 0

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-10">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* Eyebrow */}
            <p className="display-label mb-2" style={{ color: "#C8820A" }}>
              The Official 67 Coin · Mission Control
            </p>
            {/* Title */}
            <h1 style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#1A1A18",
              lineHeight: 1.05,
            }}>
              Operations Overview
            </h1>
            <p className="mt-2" style={{ fontSize: "0.9375rem", color: "#7A7570", fontWeight: 500 }}>
              Tap any card to expand full details — everything{" "}
              <span style={{ color: "#1A1A18", fontWeight: 700 }}>$67</span>{" "}
              in one place.
            </p>
          </div>

          {/* Live price chip */}
          {livePrice && (
            <div className="hidden sm:flex flex-col items-end flex-shrink-0 gap-1.5">
              <div className="px-4 py-2 rounded-[14px]"
                style={{ background: "#1A1A18" }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Live Price
                </p>
                <p style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.04em", color: "white", lineHeight: 1 }}>
                  ${livePrice < 0.001 ? livePrice.toFixed(6) : livePrice.toFixed(5)}
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${up ? "badge-up" : "badge-down"}`}>
                {up ? "▲" : "▼"} {Math.abs(liveChange24h ?? 0).toFixed(2)}% 24h
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mt-8 h-px" style={{ background: "rgba(120,95,60,0.10)" }} />
      </div>

      {/* ── Card grid — 3 columns on large, 2 on medium, 1 on mobile ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <TokenHealthCard />
        <SocialPulseCard />
        <CommunityCard />
        <ContentPipelineCard />
        <AgentStatusCard />
        <MilestonesCard />
      </div>

      {/* ── Season 2 Banner ── */}
      <div className="mt-6 relative rounded-[28px] overflow-hidden"
        style={{ background: "#0D0D0D" }}>
        {/* Warm glow blobs */}
        <div className="absolute pointer-events-none" style={{
          width: 360, height: 360, borderRadius: "50%",
          top: -100, right: -80,
          background: "radial-gradient(circle, rgba(245,166,35,0.16) 0%, transparent 65%)",
        }} />
        <div className="absolute pointer-events-none" style={{
          width: 220, height: 220, borderRadius: "50%",
          bottom: -80, left: -40,
          background: "radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 65%)",
        }} />

        <div className="relative flex items-center justify-between p-8 sm:p-12">
          <div>
            <p style={{
              fontSize: "0.625rem", fontWeight: 800,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#F5A623", marginBottom: "0.875rem",
            }}>
              Coming Soon
            </p>
            <h2 style={{
              fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
              fontWeight: 900, color: "white",
              letterSpacing: "-0.04em", lineHeight: 1.1,
              marginBottom: "0.875rem",
            }}>
              Season 2 is Loading…
            </h2>
            <p style={{
              fontSize: "0.9375rem", color: "rgba(255,255,255,0.42)",
              fontWeight: 500, lineHeight: 1.6,
            }}>
              More exchanges. Bigger community.<br />
              Unstoppable momentum.
            </p>
            <p style={{
              fontSize: "0.75rem", color: "rgba(255,255,255,0.18)",
              fontWeight: 700, letterSpacing: "0.1em", marginTop: "1.25rem",
            }}>
              #67to67Billion
            </p>
          </div>

          {/* 67 coin circle */}
          <div className="hidden sm:flex items-center justify-center flex-shrink-0"
            style={{
              width: 110, height: 110, borderRadius: "50%",
              background: "linear-gradient(135deg, #F5A623, #FFD966)",
              boxShadow: "0 0 60px rgba(245,166,35,0.45), 0 0 120px rgba(245,166,35,0.12)",
            }}>
            <span style={{ fontSize: "2.75rem", fontWeight: 900, color: "black", letterSpacing: "-0.05em" }}>67</span>
          </div>
        </div>
      </div>
    </div>
  )
}
