import { NextRequest, NextResponse } from "next/server"

const TG_TOKEN = "8783028314:AAGlhdjo0JRJVC66rH-MDUvWfSTiu86gj9I"
const TARGETS = {
  telegram_main: { id: "-1003158749697", label: "Main Group"  },
  telegram_raid: { id: "-1003708062172", label: "Raid Group"  },
}

async function sendTelegram(chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`
  const res = await fetch(url, {
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
  // targets: string[] — e.g. ["telegram_main", "telegram_raid"]

  if (!body?.trim()) {
    return NextResponse.json({ error: "Mesaj boş olamaz" }, { status: 400 })
  }

  const selectedTargets: string[] = targets ?? []
  const results: Record<string, string> = {}

  for (const key of selectedTargets) {
    const t = TARGETS[key as keyof typeof TARGETS]
    if (!t) continue
    try {
      await sendTelegram(t.id, body.trim())
      results[key] = "✅ Gönderildi"
    } catch (e: unknown) {
      results[key] = `❌ ${e instanceof Error ? e.message : "Hata"}`
    }
  }

  return NextResponse.json({ results })
}
