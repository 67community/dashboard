import { NextRequest, NextResponse } from "next/server"

const TG_ANNOUNCE_TOKEN = "8783028314:AAGlhdjo0JRJVC66rH-MDUvWfSTiu86gj9I"
const TG_RAID_TOKEN     = "8736950965:AAEgGRJaT1uwvSCA0GF6I88vwKGTkPNinM4"
const TARGETS = {
  telegram_main: { id: "-1003158749697", label: "Main Group"  },
  telegram_raid: { id: "-1003708062172", label: "Raid Group"  },
}

async function sendTelegram(chatId: string, text: string, token: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
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
  const { body, targets, type } = await req.json()
  const isRaid = type === "raid"
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
      const token = isRaid ? TG_RAID_TOKEN : TG_ANNOUNCE_TOKEN
      await sendTelegram(t.id, body.trim(), token)
      results[key] = "✅ Gönderildi"
    } catch (e: unknown) {
      results[key] = `❌ ${e instanceof Error ? e.message : "Hata"}`
    }
  }

  return NextResponse.json({ results })
}
