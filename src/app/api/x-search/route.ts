import { NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)
const CACHE: Record<string, { data: unknown[]; ts: number }> = {}
const TTL = 10 * 60 * 1000

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "recent"
  const now = Date.now()
  if (CACHE[type] && now - CACHE[type].ts < TTL) return NextResponse.json(CACHE[type].data)
  try {
    const script = path.join(process.cwd(), "scripts", "x-search.py")
    const { stdout } = await execAsync(`python3 ${script} ${type}`, { timeout: 30000 })
    const data = JSON.parse(stdout)
    CACHE[type] = { data, ts: now }
    return NextResponse.json(data)
  } catch {
    if (CACHE[type]) return NextResponse.json(CACHE[type].data)
    return NextResponse.json([])
  }
}
