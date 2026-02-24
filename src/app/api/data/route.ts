import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Priority: env var → local workspace path → public/ (bundled in repo)
const PATHS = [
  process.env.DATA_JSON_PATH,
  "/Users/oscarbrendon/.openclaw/workspace/mission-control/data.json",
  path.join(process.cwd(), "public", "data.json"),
].filter(Boolean) as string[]

export async function GET() {
  for (const p of PATHS) {
    try {
      if (!fs.existsSync(p)) continue
      const raw = fs.readFileSync(p, "utf-8")
      const data = JSON.parse(raw)
      return NextResponse.json(data, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      })
    } catch {}
  }
  return NextResponse.json({ error: "data.json not found" }, { status: 500 })
}
