export type TeamRole = "Admin" | "Founder" | "Dev" | "Content" | "Community" | "Build" | "Vision"
export type TeamStatus = "Active" | "Away" | "Inactive"

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  initials: string
  role: TeamRole
  status: TeamStatus
  color: string
  discord_id?: string
}

export type Priority = "Low" | "Medium" | "High" | "Urgent"
export type Category = "Website" | "Discord" | "Content" | "Token" | "Merch" | "Design" | "Other"
export type KanbanColumn = "Backlog" | "Todo" | "In Progress" | "Review" | "Done"

export interface SubTask {
  id: string
  title: string
  done: boolean
}

export interface Comment {
  id: string
  authorId: string
  text: string
  createdAt: string
}

export interface ActivityLog {
  id: string
  actorId: string
  action: string
  timestamp: string
}

export interface Task {
  id: string
  title: string
  description?: string
  assigneeId?: string
  priority: Priority
  category: Category
  column: KanbanColumn
  dueDate?: string
  subtasks: SubTask[]
  comments: Comment[]
  activity: ActivityLog[]
  createdAt: string
}

export interface AgentBot {
  name: string
  running: boolean
  lastRun: string
  schedule: string
}

export interface ExchangeVolume {
  name: string
  volume: number
  logo?: string
  isDex: boolean
}

export interface TokenHealth {
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  holders: number
  ath: number
  cgRank: number
  cmcRank: number
}

export interface SocialPulse {
  followers: number
  engagementRate: number
  postingStreak: number
  bestTweetWeek?: {
    tweetId: string
    likes: number
    replies: number
    text: string
    embedHtml?: string
  }
}

export interface CommunityStats {
  discordMembers: number
  onlineNow: number
  newJoins24h: number
  openTickets: number
  unanswered: number
}

export interface Milestone {
  id: string
  title: string
  target: number
  current: number
  unit: string
  achieved: boolean
}
