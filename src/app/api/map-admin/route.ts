import { NextResponse } from "next/server"

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_KEY!
const SB_HEADERS = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" }

export async function GET() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/kv_store?key=eq.map_admin&select=value`,
      { headers: SB_HEADERS, cache: "no-store" }
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

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json() as { id: string; status: "approved" | "rejected" }
    if (!id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 })
    }

    const res = await fetch(
      `${SB_URL}/rest/v1/kv_store?key=eq.map_admin&select=value`,
      { headers: SB_HEADERS, cache: "no-store" }
    )
    if (!res.ok) return NextResponse.json({ error: "Failed to read" }, { status: 500 })
    const rows = await res.json()
    const v = rows?.[0]?.value
    const data = typeof v === "string" ? JSON.parse(v) : (v ?? { items: [] })
    const items = data.items ?? []

    const item = items.find((i: any) => i.id === id)
    if (!item) return NextResponse.json({ error: "Pin not found" }, { status: 404 })
    item.status = status

    const write = await fetch(
      `${SB_URL}/rest/v1/kv_store?key=eq.map_admin`,
      {
        method: "PATCH",
        headers: { ...SB_HEADERS, Prefer: "return=minimal" },
        body: JSON.stringify({ value: JSON.stringify(data) }),
      }
    )
    if (!write.ok) return NextResponse.json({ error: "Failed to write" }, { status: 500 })

    return NextResponse.json({ ok: true, id, status })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
