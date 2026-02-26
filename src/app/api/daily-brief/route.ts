import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const ctx = await req.json()
  const apiKey = process.env.ANTHROPIC_API_KEY

  // Mock brief if no API key
  if (!apiKey) {
    return NextResponse.json({
      brief: {
        date: ctx.date,
        headline: `$67 community strong — ${ctx.holders ?? "—"} holders, ${ctx.newSightings ?? 0} new sightings today. Keep the momentum going.`,
        sections: [
          {
            icon: "📈", title: "Token Health",
            items: [
              `Price: $${ctx.price?.toFixed(8) ?? "—"} (${ctx.change24h >= 0 ? "+" : ""}${ctx.change24h?.toFixed(2) ?? "—"}% 24h)`,
              `Holders: ${ctx.holders?.toLocaleString() ?? "—"} — keep driving community growth`,
            ],
          },
          {
            icon: "👥", title: "Community",
            items: [
              `Discord: ${ctx.discordMembers?.toLocaleString() ?? "—"} members`,
              `Telegram: ${ctx.telegramMembers?.toLocaleString() ?? "—"} members`,
            ],
          },
          {
            icon: "⚡", title: "Today's Actions",
            items: [
              ctx.newSightings > 0 ? `${ctx.newSightings} new sightings need review — log them to X ASAP` : "No new sightings. Hunt for 67 content today.",
              ctx.activeRaids > 0 ? `${ctx.activeRaids} active raid(s) in progress — keep the energy up` : "Queue up a raid for high-visibility content.",
              ctx.pendingFeatures > 0 ? `${ctx.pendingFeatures} feature request(s) pending Nova's analysis` : "No pending feature requests.",
            ],
          },
        ],
      },
    })
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `You are Nova, the AI operations manager for The Official 67 Coin ($67) on Solana.

Generate a daily team briefing based on this data:
- Date: ${ctx.date}
- Price: $${ctx.price?.toFixed(8) ?? "unknown"} (${ctx.change24h >= 0 ? "+" : ""}${ctx.change24h?.toFixed(2) ?? "?"}% 24h)
- Market Cap: $${ctx.mcap ? (ctx.mcap/1e6).toFixed(2) + "M" : "unknown"}
- Holders: ${ctx.holders?.toLocaleString() ?? "unknown"}
- Discord members: ${ctx.discordMembers?.toLocaleString() ?? "unknown"}
- Telegram members: ${ctx.telegramMembers?.toLocaleString() ?? "unknown"}
- New sightings (unreviewed): ${ctx.newSightings ?? 0}
- Pending feature requests: ${ctx.pendingFeatures ?? 0}
- Active raids: ${ctx.activeRaids ?? 0}
${ctx.sightingTitles?.length ? `- Recent sightings: ${ctx.sightingTitles.join(", ")}` : ""}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "date": "${ctx.date}",
  "headline": "one punchy sentence summarizing the day's state and top priority",
  "sections": [
    {
      "icon": "📈",
      "title": "Token Pulse",
      "items": ["2-3 bullet points about price/holders/momentum"]
    },
    {
      "icon": "👥",
      "title": "Community",
      "items": ["2 bullet points about discord/telegram growth or activity"]
    },
    {
      "icon": "⚔️",
      "title": "Raids & Engagement",
      "items": ["1-2 action items for raids or X engagement today"]
    },
    {
      "icon": "👁️",
      "title": "Sightings Queue",
      "items": ["1-2 bullet points about content to log/share"]
    },
    {
      "icon": "⚡",
      "title": "Priority Actions",
      "items": ["2-3 specific things the team MUST do today, in order of importance"]
    }
  ]
}

Tone: confident, concise, action-oriented. Like a team captain's morning briefing. No fluff.`,
        }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text ?? ""

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({ brief: parsed })
      }
    } catch {}

    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
