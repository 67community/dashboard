import { NextResponse } from "next/server"

// Team Discord IDs
const TEAM_IDS = [
  "1444130836415905993",  // brandon
  "1440075589557158100",  // jamie
  "682831521396031498",   // nick
  "788495124061487154",   // wjp
  "965681608604647514",   // gen
  "767811814557089802",   // oscar
  "201710326347988993",   // crispy
]

// Lanyard API — free, no auth, no bot needed
// Requires: team members join discord.gg/lanyard (one-time)
async function fetchLanyardPresence(userId: string): Promise<string> {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) return "offline"
    const data = await res.json()
    if (!data.success) return "offline"
    // discord_status: "online" | "idle" | "dnd" | "offline"
    return data.data?.discord_status ?? "offline"
  } catch {
    return "offline"
  }
}

export async function GET() {
  // Fetch all team member presences in parallel
  const results = await Promise.all(
    TEAM_IDS.map(async (id) => ({
      id,
      status: await fetchLanyardPresence(id),
    }))
  )

  const presence: Record<string, string> = {}
  for (const { id, status } of results) {
    presence[id] = status
  }

  return NextResponse.json(presence, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  })
}
