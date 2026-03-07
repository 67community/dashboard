import { NextRequest, NextResponse } from "next/server"

const BOTS = {
  announce: { token: "8783028314:AAGlhdjo0JRJVC66rH-MDUvWfSTiu86gj9I", chatId: "-1003158749697", label: "AnnounceBot" },
  raid:     { token: "8736950965:AAEgGRJaT1uwvSCA0GF6I88vwKGTkPNinM4", chatId: "-1003708062172", label: "RaidBot"     },
}

async function sendTelegram(chatId: string, text: string, token: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.description ?? "Telegram error")
  return data
}

export async function POST(req: NextRequest) {
  const { body, targets } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: "Mesaj boş" }, { status: 400 })

  const results: Record<string, string> = {}
  for (const key of (targets ?? []) as string[]) {
    const bot = BOTS[key as keyof typeof BOTS]
    if (!bot) continue
    try {
      await sendTelegram(bot.chatId, body.trim(), bot.token)
      results[key] = `✅ ${bot.label} gönderdi`
    } catch (e: unknown) {
      results[key] = `❌ ${e instanceof Error ? e.message : "Hata"}`
    }
  }
  return NextResponse.json({ results })
}
