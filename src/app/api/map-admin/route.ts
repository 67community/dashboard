import { NextResponse } from "next/server"

const LUIS_TOKEN = process.env.LUIS_TOKEN ?? "***REMOVED_DISCORD_TOKEN***"
const MAP_ADMIN_CHANNEL = "1465826546882449471"

export async function GET() {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${MAP_ADMIN_CHANNEL}/messages?limit=50`,
      { headers: { Authorization: LUIS_TOKEN }, cache: "no-store" }
    )
    if (!res.ok) return NextResponse.json({ items: [], error: "Discord API error: " + res.status })
    const msgs = await res.json()
    const items = msgs
      .filter((m: any) => m.author?.username === "m7-bot" || m.author?.bot)
      .flatMap((m: any) => (m.embeds ?? []).map((e: any) => {
        const fields: Record<string, string> = {}
        for (const f of (e.fields ?? [])) fields[f.name] = f.value
        return {
          id: m.id,
          title: fields["Title"] ?? e.title ?? "Untitled",
          location: fields["Location"] ?? "",
          description: e.description ?? "",
          credit: fields["Credit"] ?? "",
          time: m.timestamp,
          image: e.image?.url ?? null,
          media_count: parseInt((fields["Media"] ?? "0").replace(/\D/g,"")) || 0,
        }
      }))
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ items: [], error: String(e) })
  }
}
