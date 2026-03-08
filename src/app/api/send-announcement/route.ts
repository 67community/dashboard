import { NextRequest, NextResponse } from "next/server"

const TOKENS = {
  announce: "8783028314:AAGlhdjo0JRJVC66rH-MDUvWfSTiu86gj9I",
  raid:     "8736950965:AAEgGRJaT1uwvSCA0GF6I88vwKGTkPNinM4",
}
const CHATS = {
  tg_main: "-1003158749697",
  tg_raid: "-1003708062172",
}
const DISCORD_BOT_TOKEN = "MTQ3OTI0NDQ5NjM2MDMwODczNg.GCHgwk.UcGR9RqolR86JMfCDbqbR-CndwNHQn4uhi9Y8A"
const DISCORD_CHANNELS: Record<string, string> = {
  d_coin_announce:      "1458850588271050857",
  d_community_announce: "1458844490239578265",
}

// X Chat (67 Chat group DM)

const SB_URL = "https://oqqwwccercxiwtyedwqm.supabase.co"
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcXd3Y2NlcmN4aXd0eWVkd3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMjgyOSwiZXhwIjoyMDg3Nzk4ODI5fQ.Gox3T828yW7HEP51ijpN8SkImMIzFXFw8o5_FEXt3FU"

async function sendXChat(text: string) {
  // Write to Supabase queue — Mac mini watcher picks it up and sends via Playwright
  const res = await fetch(`${SB_URL}/rest/v1/kv_store?on_conflict=key`, {
    method: "POST",
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json", Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      key: "xchat_queue",
      value: JSON.stringify({ text, ts: new Date().toISOString(), status: "pending" }),
    }),
  })
  if (!res.ok) throw new Error("Supabase write failed")
}

async function sendDiscord(channelId: string, text: string) {
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bot ${DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content: text }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? "Discord error")
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
    // X Chat
    if (ch === "x_chat") {
      try {
        await sendXChat(body.trim())
        results[ch] = "✅ Gönderildi"
      } catch (e: unknown) {
        results[ch] = `❌ ${e instanceof Error ? e.message : "X Chat hata"}`
      }
      continue
    }
    // Discord channels
    if (ch in DISCORD_CHANNELS) {
      try {
        await sendDiscord(DISCORD_CHANNELS[ch], body.trim())
        results[ch] = "✅ Gönderildi"
      } catch (e: unknown) {
        results[ch] = `❌ ${e instanceof Error ? e.message : "Discord hata"}`
      }
      continue
    }
    // Telegram channels
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
