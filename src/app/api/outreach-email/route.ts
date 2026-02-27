import { NextResponse } from "next/server"

const TONE_BY_TYPE: Record<string, string> = {
  creator: `You're reaching out to a TikTok / YouTube / Instagram creator who has been making content featuring the number 67, the 67 hand gesture, or the $67 coin. Tone: excited fan → collaborator. Mention you noticed their content, you're building a movement around 67, and you want to support them and make it official.`,

  merch: `You're reaching out to someone selling 67-branded merchandise (t-shirts, hoodies, accessories) on Amazon, Etsy, Teespring, or their own store. Tone: business-friendly, mutual benefit. Acknowledge they're already building in this space, mention the $67 coin movement and official partnership potential — co-branded drops, official store listing, etc.`,

  music: `You're reaching out to a musician, rapper, or producer who released a song, track, or album featuring the number 67 or 67-related themes. Tone: hype + respect. Tell them the $67 coin community loves their music, mention the potential to make it an official $67 anthem or soundtrack, fan engagement, and mutual growth.`,

  media: `You're reaching out to a media outlet, blog, or journalist covering crypto, memecoins, or internet culture who might be interested in the $67 coin story. Tone: professional, newsworthy angle. Lead with the story: 100% fair launch, viral 67 hand gesture, organic community growth from zero. Keep it brief and intriguing.`,

  podcast: `You're reaching out to a podcast host covering crypto, web3, memecoins, or internet culture. Tone: conversational, peer-to-peer. Pitch a guest episode featuring the $67 story — viral origin, fair launch, growing community. Offer the founder Maverick Trevillian ("67 Kid") as a potential guest.`,

  other: `You're reaching out to someone building around or connected to the 67 brand or $67 coin movement. Tone: warm and curious. Express genuine interest in their work and explore collaboration possibilities.`,
}

export async function POST(req: Request) {
  const { name, type, platform, note } = await req.json()
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 })

  const tone = TONE_BY_TYPE[type] ?? TONE_BY_TYPE.other

  const fallbackByType: Record<string, string> = {
    creator: `Hey ${name},\n\nWe've been following your content on ${platform || "your platform"} and we love how you're representing 67. The $67 coin movement is growing fast and we'd love to make it official — support your content, collaborate on something together, and bring you into the community.\n\nWould you be down for a quick chat?\n\nBest,\nThe 67 Team`,

    merch: `Hey ${name},\n\nWe noticed you're already making 67-branded merch on ${platform || "your platform"} — love that you're building in this space. We're the team behind The Official 67 Coin ($67) and we'd love to explore an official partnership — co-branded drops, listing on our community store, whatever makes sense.\n\nWorth a conversation?\n\nBest,\nThe 67 Team`,

    music: `Hey ${name},\n\nThe $67 community has been listening to your music and we are here for it. We're building the 67 movement around the $67 coin and would love to talk about making your track an official part of it — featured on our platform, community promotion, and more.\n\nLet us know if you'd be open to it.\n\n— The 67 Team`,

    media: `Hey ${name},\n\nWe think there's a story worth covering here: The Official 67 Coin ($67) — 100% fair launch, no team tokens, born from Maverick Trevillian's viral 67 hand gesture, and growing organically from zero. Happy to share more details or connect you with the founders.\n\nInterested?\n\n— The 67 Team`,

    podcast: `Hey ${name},\n\nBig fan of the show. We think the $67 coin story would make a great episode — viral origin, fair launch, real community. We can offer Maverick Trevillian ("67 Kid") as a guest or the founding team. Let us know if there's interest.\n\n— The 67 Team`,

    other: `Hey ${name},\n\nWe came across your work on ${platform || "your platform"} and love what you're doing with 67. The $67 movement is growing and we'd love to connect, support your work, and explore collaboration.\n\nWould you be open to a quick chat?\n\nBest,\nThe 67 Team`,
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      email: fallbackByType[type] ?? fallbackByType.other,
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
        model: "claude-sonnet-4-5",
        max_tokens: 450,
        messages: [{
          role: "user",
          content: `Write a short, human-feeling outreach email for The Official 67 Coin ($67) movement.

Context about the recipient:
- Name/Handle: ${name}
- Type: ${type}
- Platform: ${platform || "unknown"}
${note ? `- Notes: ${note}` : ""}

Tone guidance:
${tone}

Rules:
- Max 5-6 sentences
- Warm and genuine, NOT salesy, spammy, or corporate
- Culture-first tone — connection and collaboration, not investment pitch
- Do NOT mention price, trading, or "invest in $67"
- End with a soft CTA (reply, quick chat, etc.)
- No subject line — just the email body
- Sign off as "The 67 Team"

Return ONLY the email body, nothing else.`,
        }],
      }),
    })
    const data = await res.json()
    return NextResponse.json({ email: data.content?.[0]?.text ?? fallbackByType[type] ?? "" })
  } catch (e) {
    return NextResponse.json({ email: fallbackByType[type] ?? fallbackByType.other })
  }
}
