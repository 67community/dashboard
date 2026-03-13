import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, reason: "DISCORD_WEBHOOK_URL not configured" })
  }

  const { message, type } = await req.json()
  if (!message) return NextResponse.json({ ok: false, reason: "no message" })

  // Pick color based on type
  const colorMap: Record<string, number> = {
    success: 0x22C55E,
    danger:  0xEF4444,
    warning: 0xF5A623,
    info:    0x3B82F6,
  }
  const color = colorMap[type] ?? 0xF5A623

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          description: message,
          color,
          footer: { text: "67 Mission Control" },
          timestamp: new Date().toISOString(),
        }],
      }),
    })
    return NextResponse.json({ ok: res.ok })
  } catch (e) {
    return NextResponse.json({ ok: false, reason: String(e) })
  }
}
