import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Path to the existing data.json from the old dashboard (kept in sync by update-data.py / GitHub Actions)
const DATA_PATH = path.join(
  process.env.DATA_JSON_PATH ||
  "/Users/oscarbrendon/.openclaw/workspace/mission-control/data.json"
)

export async function GET() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8")
    const data = JSON.parse(raw)
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Could not read data.json", detail: String(err) }, { status: 500 })
  }
}
