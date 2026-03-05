import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const path = join(process.cwd(), "public", "data.json")
    const raw  = readFileSync(path, "utf-8")
    const data = JSON.parse(raw)
    return NextResponse.json(data.x_notifications ?? [])
  } catch {
    return NextResponse.json([])
  }
}
