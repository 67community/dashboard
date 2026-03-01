import { NextResponse } from "next/server"
import { callAI } from "@/app/api/_lib/ai-call"

// ── Region system prompts ──────────────────────────────────────────────────────

const REGION_CONTEXT: Record<string, string> = {
  america: `Target audience: American crypto Twitter/TikTok users.
Tone: aggressive hype, pump energy, FOMO-driven.
Language: English. Use crypto slang freely: LFG, wagmi, ngmi, ser, fren, wen moon, gm, based, bullish, rekt, ape in, degen, 1000x.
Reference: American financial freedom narrative, "making it", generational wealth.
$67coin angle: fair launch, no VC, 100% community-owned. The people's coin.
IMPORTANT: Never use em dashes (—) in any output.`,

  china: `目标受众：中国加密货币社区（微博/微信/小红书/抖音用户）。
语言：必须使用简体中文（Simplified Chinese）撰写全部内容。
语气：积极向上、富有感染力、体现集体力量与社区凝聚力。
重点信息：
- $67coin是公平发射（Fair Launch），无预挖，无团队币，无机构介入，100%社区驱动
- 合约地址：9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump（Solana链）
- 67手势由病毒式网红Maverick Trevillian发起，代表真实文化与社区精神
- 强调：低风险入场、早期机会、社区共同致富
表达方式：
- 融入中国互联网常用语（如：一起冲！、稳了、牛市来了、大家一起发财、社区力量是最强的）
- 可以提及"Web3时代的集体财富"、"去中心化才是真正的自由"
- 避免直接说"投资"或"必涨"，用"参与"、"一起建设"等措辞
结尾：引导关注官方推特 @67coinX 或加入社区`,

  europe_asia: `Target audience: European and Southeast/East Asian DeFi & crypto community.
Tone: professional, measured, but genuinely enthusiastic. No cringe hype.
Language: English. Avoid US-centric slang. Use DeFi terminology naturally.
Key angles:
- $67coin is a fully decentralized, fair-launch Solana memecoin - no VCs, no insiders, no team allocation
- The 67 hand gesture is a global cultural moment, spreading organically
- On-chain transparency, real community governance, Solana speed & low fees
- For Europe: emphasize decentralization = financial sovereignty
- For Asia (non-China): emphasize community-first, viral potential, early mover advantage
Tone references: Bankless community, DeFi Dad, European crypto newsletter vibes.
End with a CTA to join the global movement.`,
}

// ── X (Twitter) prompts ────────────────────────────────────────────────────────

const X_PROMPTS: Record<string, string> = {
  tweet: `You are a real person in the 67 community. Write ONE tweet about: {topic}.

Context: $67coin is a Solana memecoin. The face of the movement is Maverick Trevillian - a viral dirt bike creator known for the 67 hand gesture (🤙 but with 67). Fair launch, no VCs, no team tokens, 100% community.

Rules:
- Sound like a real person, NOT a crypto marketer
- Max 280 chars
- No "LFG", "wagmi", "ser", "gm" - those are cringe now
- NEVER use em dashes (—) anywhere in the output
- Can use "67 🤙" naturally
- End with #67coin only
- If it feels like something a bot wrote, rewrite it`,

  thread: `You are a real person in the 67 community. Write a 4-tweet thread about: {topic}.

Context: $67coin (Solana). Maverick Trevillian is the face - dirt bike viral creator, invented the 67 hand gesture. Fair launch, no VCs, no insiders.

Format: 1/4, 2/4, 3/4, 4/4 - one blank line between each.
- Tweet 1: hook that makes people genuinely curious, not hype
- Tweet 2-3: real story, insight, or data - something worth reading
- Tweet 4: natural CTA, not desperate
- Tone: like a friend texting you an alpha, not a PR announcement
- Max 280 chars per tweet`,

  announcement: `Write a short Twitter/Discord announcement about: {topic}.
Sound like it's from the 67 community team - real, direct, no corporate speak.
Max 250 chars. Lead with what matters, not with emojis.`,
}

// ── TikTok prompts ─────────────────────────────────────────────────────────────

const TIK_PROMPTS: Record<string, string> = {
  hook: `Write a TikTok video hook script for $67coin about: {topic}.

The 67 brand: Maverick Trevillian - viral dirt bike creator, made the 67 hand gesture famous. Real kid, real movement, not a dev team in a discord.

Rules:
- First line: something that makes people stop scrolling - a real statement, not fake hype
- Max 4 lines total
- Sound like someone who genuinely believes in this, not a promoter
- Include ONE visual cue in [brackets]
- End with something that makes them want to watch the rest`,

  caption: `Write a TikTok caption for $67coin about: {topic}.
Max 120 chars (leave room for hashtags).
Sound curious and real - like you found something interesting, not selling something.
New line: #67coin #solana #crypto #memecoin #67`,

  cta: `Write a TikTok end-screen line for $67coin about: {topic}.
One sentence max. Don't say "LFG" or "ape in". Sound like a friend saying "hey, look into this".`,
}

// ── Instagram prompts ──────────────────────────────────────────────────────────

const IG_PROMPTS: Record<string, string> = {
  post: `Write an Instagram FEED POST CAPTION for $67coin about: {topic}.
Rules:
- First line: hook that stops the scroll (max 125 chars before "more" cutoff)
- Body: 3-5 short paragraphs, use line breaks, tell a story or share insight
- End: question to drive comments OR CTA to click link in bio
- Add 8-10 hashtags at the bottom (mix: #67coin #solana #crypto #memecoin + relevant niche tags)
- Total: aim for 150-300 words
- Tone: aspirational, community story, slightly inspirational`,

  reel: `Write an Instagram REEL HOOK + CAPTION SCRIPT for $67coin about: {topic}.
Format:
[REEL HOOK - on-screen text, max 8 words, bold and punchy]
[VOICEOVER line 1 - 1 sentence, grabs attention]
[VOICEOVER line 2 - 1 sentence, builds curiosity]
[VOICEOVER line 3 - CTA]
---
CAPTION: (max 125 chars, punchy) + 5 hashtags`,

  story: `Write an Instagram STORY sequence for $67coin about: {topic}.
Format: 3 story slides:
Slide 1: [Big bold question or statement - max 10 words]
Slide 2: [Key insight or fact - 1-2 sentences]
Slide 3: [CTA slide - "Swipe up" or "Link in bio" with action]
Each slide should be visually self-contained. Keep it simple and punchy.`,
}

// ── Mock fallbacks ─────────────────────────────────────────────────────────────

const MOCKS: Record<string, Record<string, string>> = {
  x: {
    tweet:        "🚀 $67coin is building something special - {topic}. The community is STRONG and the vision is clear. This is just the beginning. #67coin",
    thread:       "1/4 🧵 Let's talk about {topic} and why it matters for $67coin...\n\n2/4 The fundamentals are solid - fair launch, strong community, real utility.\n\n3/4 Here's what makes $67 different from every other memecoin out there...\n\n4/4 We're just getting started. Join the movement. #67coin",
    announcement: "📢 Hey 67 Community!\n\nBig update on {topic}! 🔥\n\nStay tuned for more details - this one's gonna be huge. Drop a 67 🤙 if you're ready!",
  },
  tiktok: {
    hook:    "[Camera zooms in] Wait - did you hear about $67coin? 👀\nThis is the token everyone's about to know.\n[Hold up phone] Let me show you why this changes everything.",
    caption: "The next big move is already happening 👀 Don't say we didn't warn you. #67coin #crypto #solana #memecoin #altcoin",
    cta:     "Follow for daily $67 updates 🚀 Link in bio to join the community before it blows up.",
  },
  instagram: {
    post:  "The moment you find a project built by the community, for the community - you hold it. 🤙\n\n$67coin launched fair. No VCs. No team tokens. Just people who believed.\n\nThat's {topic}. And it's just getting started.\n\n#67coin #solana #crypto #memecoin #web3 #cryptotrading #altcoin #defi",
    reel:  "[REEL HOOK: This crypto play no one's talking about]\n[VO 1: $67coin just did something that 99% of projects can't claim.]\n[VO 2: Fair launch, zero insider tokens, 100% community - and it's pumping.]\n[VO 3: Details in bio. Don't miss this one.]\n---\nCaption: The 67 movement is real 🤙 #67coin #solana #crypto",
    story: "Slide 1: Is $67coin the next big Solana gem? 🤔\nSlide 2: Fair launch. No VCs. No team allocation. 100% community-driven on Solana.\nSlide 3: Join the movement → Link in bio 🤙",
  },
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const {
      topic,
      type      = "tweet",
      platform  = "x",
      region    = "america",
      variation = 1,
    } = await req.json() as {
      topic:    string
      type:     string
      platform?: string
      region?:  string
      variation?: number  // 1, 2, 3 — for distinct outputs
    }

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 })
    }

    // Pick base prompt
    const promptMap =
      platform === "tiktok"    ? TIK_PROMPTS :
      platform === "instagram" ? IG_PROMPTS  :
                                 X_PROMPTS

    const baseKey    = Object.keys(promptMap).includes(type) ? type : Object.keys(promptMap)[0]
    const basePrompt = promptMap[baseKey].replace("{topic}", topic)

    // Add region context + live $67 facts
    const regionCtx  = REGION_CONTEXT[region] ?? REGION_CONTEXT.america
    const facts67 = `Current $67coin facts (use these naturally if relevant, don't force all of them):
- Token: $67coin on Solana
- CA: 9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump
- Twitter: @67coinX | Discord: discord.gg/67community
- Face of the movement: Maverick Trevillian (@67Kid) - viral dirt bike creator, invented the "67" hand gesture
- Fair launch on pump.fun - no team tokens, no VCs, 100% community
- ~16,800+ holders, growing daily
- Listed on 14+ exchanges including MEXC, Gate, BingX, BitMart
- The number 67 = a universal hand gesture that unites people worldwide`
    const variationHints = [
      "",
      "Write in a BOLD, punchy, statement-driven style. Short sentences. High energy.",
      "Write in a STORYTELLING style. Start with a relatable moment or observation. Build to the point.",
      "Write in a DATA/FACTS style. Lead with a number or insight. Make people think.",
    ]
    const variationHint = variationHints[variation ?? 1] || ""
    const fullPrompt = `${regionCtx}\n\n${facts67}\n\n---\n\n${basePrompt}${variationHint ? `\n\nSTYLE DIRECTION: ${variationHint}` : ""}`

    try {
      const result = await callAI({
        req,
        maxTokens: 700,
        messages:  [{ role: "user", content: fullPrompt }],
      })

      return NextResponse.json({
        draft:    result.text,
        type:     baseKey,
        topic,
        platform,
        region,
        id:       Date.now(),
        _provider: result.provider,
      })
    } catch {
      // Fall back to mock
      const mockMap  = MOCKS[platform] ?? MOCKS.x
      const mockText = (mockMap[baseKey] ?? Object.values(mockMap)[0]).replace("{topic}", topic)
      return NextResponse.json({ draft: mockText, type: baseKey, topic, platform, region, id: Date.now() })
    }
  } catch (e) {
    console.error("Draft route error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
