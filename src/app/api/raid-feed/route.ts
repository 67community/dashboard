import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
const SB_KEY = "***REMOVED_SERVICE_KEY***"

export async function GET() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/kv_store?key=eq.x_raid_feed&select=value`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
    )
    const rows = await res.json()
    const v = rows?.[0]?.value
    const data = typeof v === "string" ? JSON.parse(v) : v
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([])
  }
}
