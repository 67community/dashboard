import { NextRequest, NextResponse } from "next/server"

const TOKENS = {
  announce: "8783028314:AAGlhdjo0JRJVC66rH-MDUvWfSTiu86gj9I",
  raid:     "8736950965:AAEgGRJaT1uwvSCA0GF6I88vwKGTkPNinM4",
}
const CHATS = {
  tg_main: "-1003158749697",
  tg_raid: "-1003708062172",
}

async function sendTelegram(chatId: string, text: string, token: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.description ?? "Telegram error")
}

export async function POST(req: NextRequest) {
  const { body, bot, channels } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: "Mesaj boş" }, { status: 400 })

  const token = TOKENS[bot as keyof typeof TOKENS]
  if (!token) return NextResponse.json({ error: "Geçersiz bot" }, { status: 400 })

  const results: Record<string, string> = {}
  for (const ch of (channels ?? []) as string[]) {
    const chatId = CHATS[ch as keyof typeof CHATS]
    if (!chatId) continue
    try {
      await sendTelegram(chatId, body.trim(), token)
      results[ch] = "✅ Gönderildi"
    } catch (e: unknown) {
      results[ch] = `❌ ${e instanceof Error ? e.message : "Hata"}`
    }
  }
  return NextResponse.json({ results })
}
