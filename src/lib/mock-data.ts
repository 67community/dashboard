import { TeamMember, Task, Milestone, AgentBot, TokenHealth, SocialPulse, CommunityStats } from "./types"

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "oscar", name: "Oscar Brendon", initials: "OB", role: "Dev", status: "Active", color: "#6366f1" },
  { id: "jamie", name: "Jamie Trevillian", initials: "JT", role: "Founder", status: "Active", color: "#F5A623" },
  { id: "brandon", name: "Brandon Trevillian", initials: "BT", role: "Founder", status: "Active", color: "#f97316" },
  { id: "weston", name: "Weston", initials: "WJ", role: "Vision", status: "Active", color: "#8b5cf6" },
  { id: "crispy", name: "Crispy", initials: "CR", role: "Build", status: "Active", color: "#10b981" },
]

export const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Redesign Mission Control dashboard",
    description: "Rebuild the dashboard with Next.js + Tailwind. Light theme, Apple meets Notion aesthetic.",
    assigneeId: "oscar",
    priority: "Urgent",
    category: "Website",
    column: "In Progress",
    dueDate: "2026-03-01",
    subtasks: [
      { id: "s1", title: "Setup Next.js project", done: true },
      { id: "s2", title: "Build card components", done: true },
      { id: "s3", title: "Build Kanban board", done: false },
      { id: "s4", title: "Connect APIs", done: false },
    ],
    comments: [],
    activity: [
      { id: "a1", actorId: "weston", action: "Created task", timestamp: "2026-02-25T10:00:00Z" },
      { id: "a2", actorId: "oscar", action: "Moved to In Progress", timestamp: "2026-02-25T11:00:00Z" },
    ],
    createdAt: "2026-02-25T10:00:00Z",
  },
  {
    id: "t2",
    title: "Set up Supabase database",
    description: "Configure Supabase for tasks, team members, and real-time updates.",
    assigneeId: "oscar",
    priority: "High",
    category: "Website",
    column: "Todo",
    dueDate: "2026-03-02",
    subtasks: [
      { id: "s5", title: "Create Supabase project", done: false },
      { id: "s6", title: "Set up tables (tasks, members, milestones)", done: false },
      { id: "s7", title: "Configure RLS policies", done: false },
    ],
    comments: [],
    activity: [
      { id: "a3", actorId: "weston", action: "Created task", timestamp: "2026-02-25T10:05:00Z" },
    ],
    createdAt: "2026-02-25T10:05:00Z",
  },
  {
    id: "t3",
    title: "Discord growth campaign — Phase 1",
    description: "Implement daily GM check-in, Meme Monday, Game Night rituals.",
    assigneeId: "crispy",
    priority: "High",
    category: "Discord",
    column: "Todo",
    dueDate: "2026-03-07",
    subtasks: [
      { id: "s8", title: "Set up MEE6 XP leveling", done: false },
      { id: "s9", title: "Create #gm-check-in channel", done: false },
      { id: "s10", title: "Schedule Meme Monday posts", done: false },
    ],
    comments: [],
    activity: [],
    createdAt: "2026-02-25T10:10:00Z",
  },
  {
    id: "t4",
    title: "X Raid automation — session refresh",
    description: "Add fresh sessions to maintain 100+ active raid accounts.",
    assigneeId: "oscar",
    priority: "Medium",
    category: "Content",
    column: "Backlog",
    subtasks: [],
    comments: [],
    activity: [],
    createdAt: "2026-02-25T10:15:00Z",
  },
  {
    id: "t5",
    title: "67 merch store setup",
    description: "Research and set up Shopify or Printful integration for 67 branded merch.",
    assigneeId: "brandon",
    priority: "Medium",
    category: "Merch",
    column: "Backlog",
    subtasks: [],
    comments: [],
    activity: [],
    createdAt: "2026-02-25T10:20:00Z",
  },
  {
    id: "t6",
    title: "Bybit listing follow-up",
    description: "Follow up with Bybit team on listing application status. Send additional materials if needed.",
    assigneeId: "jamie",
    priority: "High",
    category: "Token",
    column: "Review",
    dueDate: "2026-02-28",
    subtasks: [],
    comments: [],
    activity: [],
    createdAt: "2026-02-24T09:00:00Z",
  },
  {
    id: "t7",
    title: "Weekly community report — Feb 25",
    description: "Compile weekly stats: new members, engagement, top posts, token performance.",
    assigneeId: "crispy",
    priority: "Low",
    category: "Content",
    column: "Done",
    subtasks: [],
    comments: [],
    activity: [],
    createdAt: "2026-02-18T09:00:00Z",
  },
]

export const MILESTONES: Milestone[] = [
  { id: "m1", title: "5K Discord Members", target: 5000, current: 1466, unit: "members", achieved: false },
  { id: "m2", title: "10K X Followers", target: 10000, current: 8200, unit: "followers", achieved: false },
  { id: "m3", title: "Top 1000 CMC", target: 1000, current: 1711, unit: "rank", achieved: false },
  { id: "m4", title: "$10M Market Cap", target: 10000000, current: 1570000, unit: "USD", achieved: false },
  { id: "m5", title: "100 Exchange Listings", target: 100, current: 14, unit: "exchanges", achieved: false },
]

export const AGENT_BOTS: AgentBot[] = [
  { name: "X Raid Bot", running: true, lastRun: "2 min ago", schedule: "Every 3 min" },
  { name: "Price Alert", running: true, lastRun: "5 min ago", schedule: "Every 5 min" },
  { name: "Whale Alert", running: false, lastRun: "2h ago", schedule: "Every 10 min" },
  { name: "Welcome Bot", running: true, lastRun: "On join", schedule: "On event" },
  { name: "Hype Messages", running: true, lastRun: "1h ago", schedule: "Every 4h" },
  { name: "Weekly Report", running: true, lastRun: "2d ago", schedule: "Weekly" },
]

export const TOKEN_HEALTH: TokenHealth = {
  price: 0.00157,
  change24h: -2.3,
  marketCap: 1570000,
  volume24h: 12400,
  holders: 4821,
  ath: 0.04363,
  cgRank: 2509,
  cmcRank: 1711,
}

export const SOCIAL_PULSE: SocialPulse = {
  followers: 8200,
  engagementRate: 4.2,
  postingStreak: 7,
}

export const COMMUNITY_STATS: CommunityStats = {
  discordMembers: 1466,
  onlineNow: 113,
  newJoins24h: 0,
  openTickets: 0,
  unanswered: 0,
}
