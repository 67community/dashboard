import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
const SB_KEY = "***REMOVED_SERVICE_KEY***"

async function sbGet(key: string) {
  const res = await fetch(
    `${SB_URL}/rest/v1/kv_store?key=eq.${key}&select=value`,
    { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
  )
  const rows = await res.json()
  if (!rows?.[0]?.value) return []
  const v = rows[0].value
  return typeof v === "string" ? JSON.parse(v) : v
}

export async function GET() {
  try {
    // Merge x_recent (from RapidAPI, every 5min) + x_raid_feed (legacy ensonraid)
    const [recent, legacy] = await Promise.all([sbGet("x_recent"), sbGet("x_raid_feed")])

    // Normalize x_recent items to raid format
    const items = (Array.isArray(recent) ? recent : []).map((t: any) => ({
      id:   t.id ?? t.tweet_id ?? "",
      text: t.text ?? t.full_text ?? "",
      link: t.link ?? (t.id ? `https://x.com/i/status/${t.id}` : ""),
      time: t.time ?? t.created_at ?? "",
    }))

    // Add legacy items that aren't duplicates
    const ids = new Set(items.map((i: any) => i.id))
    for (const l of (Array.isArray(legacy) ? legacy : [])) {
      if (!ids.has(l.id)) { items.push(l); ids.add(l.id) }
    }

    // Sort newest first
    items.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return NextResponse.json(items.slice(0, 100))
  } catch {
    return NextResponse.json([])
  }
}
