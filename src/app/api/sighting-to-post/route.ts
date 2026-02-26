import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { title, platform, url, note } = await req.json()
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      post: `👀 67 spotted in the wild!\n\n${title}\n\nThe movement is everywhere 🌎🤙\n\n$67 #67coin #67Kid`,
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
        max_tokens: 250,
        messages: [{
          role: "user",
          content: `Write a punchy, viral X (Twitter) post for The Official 67 Coin about this community sighting:

Sighting: ${title}
Platform: ${platform}
${url ? `Link: ${url}` : ""}
${note ? `Context: ${note}` : ""}

Rules:
- Max 240 characters (Twitter limit)
- Energy, culture-first — NOT financial advice
- Use 1-2 relevant emojis naturally
- End with $67 #67coin
- Make people want to retweet it
- Highlight how $67 is everywhere/unstoppable

Return ONLY the tweet text, nothing else.`,
        }],
      }),
    })
    const data = await res.json()
    return NextResponse.json({ post: data.content?.[0]?.text ?? "" })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
