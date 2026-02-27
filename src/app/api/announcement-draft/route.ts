import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { title, type, channel } = await req.json()
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    const mocks: Record<string, string> = {
      raid:      `🚨 RAID TIME — The 67 crew is LIVE!\n\nDrop in, show some love, and let's make some noise together 🙌\n\n$67 #67coin #67Kid`,
      event:     `📅 COMMUNITY EVENT — See you there!\n\nBring your energy, bring your friends, and let's build together 🔥\n\n$67 #67coin`,
      listing:   `🏦 NEW LISTING — $67 just keeps growing!\n\nAnother exchange joins the 67 family. The movement is unstoppable 📈\n\n$67 #67coin`,
      milestone: `🏆 MILESTONE HIT — We did it together!\n\nThis community is built different. Thank you for being part of history 💎\n\n$67 #67coin`,
      price:     `📈 PRICE UPDATE — $67 is moving!\n\nThe charts don't lie. Stay strapped in 🚀\n\n$67 #67coin`,
      general:   `📢 FROM THE 67 TEAM\n\n${title}\n\nStay tuned for more updates. The movement never sleeps 🤙\n\n$67 #67coin`,
    }
    return NextResponse.json({ body: mocks[type] ?? mocks.general })
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
        model: "claude-sonnet-4-5",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Write a community announcement for The Official 67 Coin ($67) movement.

Title/topic: ${title}
Type: ${type}
Channel: ${channel}

Rules:
- Energetic, culture-first tone — NOT financial/investment language
- Max 5 sentences
- End with $67 #67coin hashtags
- For Discord: use emoji naturally
- For X: more punchy, Twitter-optimized
- Never mention price targets or investment advice

Return ONLY the announcement text, nothing else.`,
        }],
      }),
    })
    const data = await res.json()
    return NextResponse.json({ body: data.content?.[0]?.text ?? "" })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
