import { NextRequest, NextResponse } from "next/server"

const TG_OFFICIAL_BOT  = "8783028314:AAGlhdjo0JRJVC66rH-MDUvWfSTiu86gj9I"
const TG_OFFICIAL_CHAT = "-1003158749697"
const TG_RAID_BOT      = "8736950965:AAEgGRJaT1uwvSCA0GF6I88vwKGTkPNinM4"
const TG_RAID_CHATS    = ["-1003158749697", "-1003708062172"]

async function sendTg(token: string, chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const { channel, body } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: "Empty body" }, { status: 400 })
  const results: any[] = []

  if (channel === "telegram") {
    const r = await sendTg(TG_OFFICIAL_BOT, TG_OFFICIAL_CHAT, body)
    results.push({ chat: TG_OFFICIAL_CHAT, ok: r.ok })
  } else if (channel === "raid") {
    for (const chatId of TG_RAID_CHATS) {
      const r = await sendTg(TG_RAID_BOT, chatId, body)
      results.push({ chat: chatId, ok: r.ok })
    }
  } else if (channel === "discord") {
    return NextResponse.json({ ok: false, error: "Discord not configured yet" }, { status: 400 })
  }

  return NextResponse.json({ ok: results.every(r => r.ok), results })
}
