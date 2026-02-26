import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { name, type, platform, note } = await req.json()
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      email: `Hey ${name},\n\nWe came across your work on ${platform || "your platform"} and love what you're doing with 67.\n\nThe $67 movement is growing fast and we'd love to connect, support your work, and potentially collaborate.\n\nWould you be open to a quick chat?\n\nBest,\nThe 67 Team`,
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
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `Write a short, human-feeling outreach email for The Official 67 Coin ($67) movement reaching out to:

Name/Handle: ${name}
Type: ${type} (creator/merch/builder/media/podcast/other)
Platform: ${platform || "unknown"}
${note ? `Notes: ${note}` : ""}

Rules:
- Max 5 sentences
- Warm, not salesy or spammy
- Culture-first tone (not "invest in our token")
- Mention you found their work, want to connect/support/collaborate
- Don't mention price, trading, or investment
- End with a soft CTA (quick chat, reply, etc.)
- No subject line, just the email body
- Sign off as "The 67 Team"

Return ONLY the email body, nothing else.`,
        }],
      }),
    })
    const data = await res.json()
    return NextResponse.json({ email: data.content?.[0]?.text ?? "" })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
