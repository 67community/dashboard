import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXd3Y2NlcmN4aXd0eWVkd3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMjgyOSwiZXhwIjoyMDg3Nzk4ODI5fQ.Gox3T828yW7HEP51ijpN8SkImMIzFXFw8o5_FEXt3FU"

export async function GET() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/kv_store?key=eq.x_raid_feed&select=value`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
    )
    const rows = await res.json()
    return NextResponse.json(rows?.[0]?.value ?? [])
  } catch {
    return NextResponse.json([])
  }
}
