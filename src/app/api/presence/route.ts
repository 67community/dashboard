import { NextResponse } from "next/server"

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_KEY!

export async function GET() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/kv_store?key=eq.team_presence&select=value`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
    )
    if (!res.ok) return NextResponse.json({})
    const rows = await res.json()
    const v = rows?.[0]?.value
    const data = typeof v === "string" ? JSON.parse(v) : (v ?? {})
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    })
  } catch {
    return NextResponse.json({})
  }
}
