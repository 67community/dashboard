import { NextRequest, NextResponse } from "next/server"
import { getSecret } from "@/app/api/_lib/secrets"

const CHATS = {
  tg_main: "-1003158749697",
  tg_raid: "-1003708062172",
}
const DISCORD_CHANNELS: Record<string, string> = {
  d_coin_announce:      "1458850588271050857",
  d_community_announce: "1458844490239578265",
}

// X Chat (67 Chat group DM)

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_KEY!

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

async function sendDiscord(channelId: string, text: string, discordBotToken: string) {
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bot ${discordBotToken}`, "Content-Type": "application/json" },
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
  if (!body?.trim()) return NextResponse.json({ error: "Message is empty" }, { status: 400 })

  const [tgAnnounceToken, tgRaidToken, discordBotToken] = await Promise.all([
    getSecret("TG_ANNOUNCE_BOT_TOKEN"),
    getSecret("TG_RAID_BOT_TOKEN"),
    getSecret("DISCORD_BOT_TOKEN"),
  ])

  const TOKENS: Record<string, string> = {
    announce: tgAnnounceToken,
    raid:     tgRaidToken,
  }

  const token = TOKENS[bot as keyof typeof TOKENS]
  if (!token) return NextResponse.json({ error: "Invalid bot" }, { status: 400 })

  const results: Record<string, string> = {}
  for (const ch of (channels ?? []) as string[]) {
    // X Chat
    if (ch === "x_chat") {
      try {
        await sendXChat(body.trim())
        results[ch] = "✅ Sent"
      } catch (e: unknown) {
        results[ch] = `❌ ${e instanceof Error ? e.message : "X Chat error"}`
      }
      continue
    }
    // Discord channels
    if (ch in DISCORD_CHANNELS) {
      try {
        await sendDiscord(DISCORD_CHANNELS[ch], body.trim(), discordBotToken)
        results[ch] = "✅ Sent"
      } catch (e: unknown) {
        results[ch] = `❌ ${e instanceof Error ? e.message : "Discord error"}`
      }
      continue
    }
    // Telegram channels
    const chatId = CHATS[ch as keyof typeof CHATS]
    if (!chatId) continue
    try {
      await sendTelegram(chatId, body.trim(), token)
      results[ch] = "✅ Sent"
    } catch (e: unknown) {
      results[ch] = `❌ ${e instanceof Error ? e.message : "Error"}`
    }
  }
  return NextResponse.json({ results })
}
