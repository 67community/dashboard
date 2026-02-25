import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"

// Presence: { "USER_ID": "online"|"idle"|"dnd"|"offline" }
// Updated by Mac mini update-data.py every 5 minutes

function readPresence(): Record<string, string> {
  const BUNDLED = path.join(process.cwd(), "public", "data.json")
  const LOCAL   = "/Users/oscarbrendon/.openclaw/workspace/mission-control/data.json"
  for (const p of [LOCAL, BUNDLED]) {
    try {
      if (fs.existsSync(p)) {
        const d = JSON.parse(fs.readFileSync(p, "utf-8"))
        return d?.team_presence ?? {}
      }
    } catch {}
  }
  return {}
}

export async function GET() {
  const presence = readPresence()
  return NextResponse.json(presence, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  })
}
