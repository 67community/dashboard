import { NextResponse } from "next/server"

const LUIS_TOKEN = process.env.LUIS_TOKEN ?? "MTQ2ODcwOTkzODk1OTM1NjAwNw.GR7Ziz.example"
const MAP_ADMIN_CHANNEL = "1465826546882449471"
const M7_BOT_NAME = "m7-bot"

export async function GET() {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${MAP_ADMIN_CHANNEL}/messages?limit=50`,
      { headers: { Authorization: LUIS_TOKEN } }
    )
    if (!res.ok) return NextResponse.json({ items: [], error: "Discord API error" })
    const msgs = await res.json()
    const items = msgs
      .filter((m: any) => m.author?.username === M7_BOT_NAME || m.author?.bot)
      .flatMap((m: any) => (m.embeds ?? []).map((e: any) => {
        const fields: Record<string, string> = {}
        for (const f of (e.fields ?? [])) fields[f.name] = f.value
        return {
          id: m.id,
          title: fields["Title"] ?? e.title ?? "Untitled",
          location: fields["Location"] ?? "",
          description: fields["Description"] ?? e.description ?? "",
          credit: fields["Credit"] ?? fields["Submitted by"] ?? "",
          time: m.timestamp,
          image: e.image?.url ?? e.thumbnail?.url ?? null,
          media_count: parseInt(fields["Media"] ?? "0") || 0,
        }
      }))
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ items: [], error: String(e) })
  }
}
