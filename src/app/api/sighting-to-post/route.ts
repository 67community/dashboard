import { NextResponse } from "next/server"
import { callAI } from "@/app/api/_lib/ai-call"

export async function POST(req: Request) {
  const { title, platform, url, note } = await req.json()

  try {
    const result = await callAI({
      req,
      maxTokens: 250,
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
    })

    return NextResponse.json({ post: result.text, _provider: result.provider })
  } catch {
    return NextResponse.json({
      post: `👀 67 spotted in the wild!\n\n${title}\n\nThe movement is everywhere 🌎🤙\n\n$67 #67coin #67Kid`,
    })
  }
}
