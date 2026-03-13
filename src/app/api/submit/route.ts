import { NextResponse } from "next/server"
import { getSecret } from "@/app/api/_lib/secrets"

export async function POST(req: Request) {
  const { title, platform, url, handle, note } = await req.json()
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 })

  const webhookUrl = await getSecret("DISCORD_WEBHOOK_URL")
  const platformEmoji: Record<string, string> = {
    tiktok:"🎵", instagram:"📸", youtube:"▶️", x:"𝕏", reddit:"🤖", news:"📰", irl:"📍", other:"⭐",
  }
  const emoji = platformEmoji[platform] ?? "⭐"
  const ts    = new Date().toLocaleString("en-US", { timeZone:"America/New_York" })

  // Discord webhook embed
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: `👁️ New Community Sighting`,
            color: 0xF5A623,
            fields: [
              { name: `${emoji} What`,     value: title,              inline: false },
              { name: "📡 Platform",        value: platform,           inline: true  },
              ...(url    ? [{ name: "🔗 Link",    value: url,    inline: false }] : []),
              ...(handle ? [{ name: "👤 Submitted by", value: handle, inline: true }] : []),
              ...(note   ? [{ name: "📝 Notes",   value: note,   inline: false }] : []),
            ],
            footer: { text: `67 Sighting Portal · ${ts} EST` },
            thumbnail: { url: "https://raw.githubusercontent.com/67coin/67/main/logo.png" },
          }],
        }),
      })
    } catch (e) {
      console.error("Webhook error:", e)
    }
  }

  return NextResponse.json({ ok: true, message: "Sighting submitted" })
}
