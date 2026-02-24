import { TokenHealthCard } from "@/components/cards/token-health"
import { SocialPulseCard } from "@/components/cards/social-pulse"
import { CommunityCard } from "@/components/cards/community"
import { ContentPipelineCard } from "@/components/cards/content-pipeline"
import { AgentStatusCard } from "@/components/cards/agent-status"
import { MilestonesCard } from "@/components/cards/milestones"

export default function Dashboard() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          Everything happening with <span className="font-semibold text-amber-600">$67</span> in one place.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <TokenHealthCard />
        <SocialPulseCard />
        <CommunityCard />
        <ContentPipelineCard />
        <AgentStatusCard />
        <MilestonesCard />
      </div>

      {/* Season 2 banner */}
      <div className="mt-8 rounded-3xl gold-gradient p-6 text-white shadow-lg shadow-amber-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Coming Soon</p>
            <h3 className="text-xl font-black tracking-tight">Season 2 is Loading...</h3>
            <p className="text-sm opacity-80 mt-1">More exchanges. Bigger community. Unstoppable momentum.</p>
          </div>
          <div className="text-5xl font-black opacity-20 select-none">67</div>
        </div>
      </div>
    </div>
  )
}
