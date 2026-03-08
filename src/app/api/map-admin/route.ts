import { NextResponse } from "next/server"

const SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
const SB_KEY = "***REMOVED_SERVICE_KEY***"

export async function GET() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/kv_store?key=eq.map_admin&select=value`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
    )
    if (!res.ok) return NextResponse.json({ items: [] })
    const rows = await res.json()
    const v = rows?.[0]?.value
    const data = typeof v === "string" ? JSON.parse(v) : v
    return NextResponse.json({ items: data?.items ?? [] })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
