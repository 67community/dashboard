import { NextResponse } from "next/server"
import { callAIRaw, resolveAIConfig, type AIProvider } from "@/app/api/_lib/ai-call"
// ── Types ─────────────────────────────────────────────────────────────────────

interface DiscoveredTarget {
  id:       string
  name:     string
  type:     "creator" | "merch" | "music" | "media" | "other"
  platform: string
  link?:    string
  contact?: string
  note:     string
  source:   string
}

// ── YouTube search ────────────────────────────────────────────────────────────

async function searchYouTube(query: string, type: "creator" | "music"): Promise<DiscoveredTarget[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return []

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search")
    url.searchParams.set("part", "snippet")
    url.searchParams.set("q", query)
    url.searchParams.set("type", "video")
    url.searchParams.set("maxResults", "8")
    url.searchParams.set("order", "viewCount")
    url.searchParams.set("key", apiKey)

    const res  = await fetch(url.toString())
    const data = await res.json()
    if (!data.items) return []

    const seen = new Set<string>()
    return data.items
      .filter((item: any) => {
        const ch = item.snippet.channelTitle
        if (seen.has(ch)) return false
        seen.add(ch)
        return true
      })
      .map((item: any) => ({
        id:       `yt_${item.id.videoId}`,
        name:     item.snippet.channelTitle,
        type,
        platform: "YouTube",
        link:     `https://www.youtube.com/channel/${item.snippet.channelId}`,
        note:     `Video: "${item.snippet.title.slice(0, 80)}" — ${item.snippet.description?.slice(0, 100) ?? ""}`,
        source:   "YouTube API",
      }))
  } catch {
    return []
  }
}

// ── DuckDuckGo scrape (no API key needed) ─────────────────────────────────────

async function searchDDG(query: string, type: "merch" | "creator" | "media" | "other"): Promise<DiscoveredTarget[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const res  = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)" },
    })
    const html = await res.text()

    // Extract result titles + URLs from DDG HTML
    const results: DiscoveredTarget[] = []
    const linkRe = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi
    const snipRe = /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]+)<\/a>/gi

    const links: string[][] = []
    let m
    while ((m = linkRe.exec(html)) !== null) {
      links.push([m[1], m[2].trim()])
    }
    const snips: string[] = []
    while ((m = snipRe.exec(html)) !== null) snips.push(m[1].trim())

    for (let i = 0; i < Math.min(links.length, 5); i++) {
      const [href, title] = links[i]
      if (!href || !title) continue
      // Skip ads/irrelevant
      if (href.includes("duckduckgo.com")) continue

      let platform = "Web"
      if (href.includes("amazon."))       platform = "Amazon"
      else if (href.includes("etsy."))    platform = "Etsy"
      else if (href.includes("tiktok."))  platform = "TikTok"
      else if (href.includes("youtube.")) platform = "YouTube"
      else if (href.includes("spotify.")) platform = "Spotify"
      else if (href.includes("twitter.") || href.includes("x.com")) platform = "X"

      results.push({
        id:       `ddg_${Date.now()}_${i}`,
        name:     title.slice(0, 60),
        type,
        platform,
        link:     href,
        note:     snips[i]?.slice(0, 120) ?? "",
        source:   "Web Search",
      })
    }

    return results
  } catch {
    return []
  }
}

// ── Generate email draft for a target ────────────────────────────────────────

async function draftEmail(
  target: DiscoveredTarget,
  provider: AIProvider,
  apiKey: string,
): Promise<string> {
  if (!apiKey) return generateFallbackEmail(target)

  const toneMap: Record<string, string> = {
    creator: "Excited fan becoming collaborator. Mention you noticed their content, want to support and make it official.",
    merch:   "Business-friendly, mutual benefit. Acknowledge they're already building in this space. Propose official partnership / co-branded drops.",
    music:   "Hype + respect. Community loves their music. Invite them to make it the official $67 soundtrack.",
    media:   "Professional. Pitch the story: 100% fair launch, viral 67 hand gesture, organic community.",
    other:   "Warm and curious. Express genuine interest, explore collaboration.",
  }

  try {
    const result = await callAIRaw({
      provider,
      apiKey,
      maxTokens: 400,
      messages: [{
        role: "user",
        content: `Write a short outreach email for The Official 67 Coin ($67) movement to:

Name: ${target.name}
Type: ${target.type}
Platform: ${target.platform}
Context: ${target.note}

Tone: ${toneMap[target.type] ?? toneMap.other}

Rules:
- Max 5 sentences
- Warm, human, NOT salesy
- Culture-first (not investment/price talk)
- Soft CTA at end
- Sign off as "The 67 Team"
- Return ONLY the email body`,
      }],
    })
    return result.text || generateFallbackEmail(target)
  } catch {
    return generateFallbackEmail(target)
  }
}

function generateFallbackEmail(t: DiscoveredTarget): string {
  const map: Record<string, string> = {
    creator: `Hey ${t.name},\n\nWe've been following your work on ${t.platform} and love how you're representing 67. The $67 coin movement is growing fast and we'd love to make it official — support your content, collaborate, and bring you into the community.\n\nWould you be down for a quick chat?\n\n— The 67 Team`,
    merch:   `Hey ${t.name},\n\nWe noticed you're already creating 67-themed products on ${t.platform} — love that you're building in this space. We're the team behind The Official 67 Coin ($67) and would love to explore an official partnership.\n\nWorth a conversation?\n\n— The 67 Team`,
    music:   `Hey ${t.name},\n\nThe $67 community has been listening and we are here for it. We'd love to talk about making your music an official part of the 67 movement — featured placement, community promotion, and more.\n\nLet us know if you're open to it.\n\n— The 67 Team`,
    media:   `Hey ${t.name},\n\nWe think there's a story here worth covering: The Official 67 Coin — 100% fair launch, no team tokens, born from a viral hand gesture, growing organically. Happy to share more or connect you with the founders.\n\n— The 67 Team`,
    other:   `Hey ${t.name},\n\nWe came across your work on ${t.platform} and love what you're building around 67. The $67 movement is growing and we'd love to connect and explore collaboration.\n\nWould you be open to a chat?\n\n— The 67 Team`,
  }
  return map[t.type] ?? map.other
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { provider, apiKey } = resolveAIConfig(req)
  const [
    ytCreators,
    ytMusic,
    amazonMerch,
    etsyMerch,
    tiktokCreators,
    mediaResults,
  ] = await Promise.all([
    searchYouTube("67coin solana crypto",          "creator"),
    searchYouTube("67 coin music rap song",        "music"),
    searchDDG("\"67 coin\" OR \"67coin\" t-shirt amazon merch", "merch"),
    searchDDG("\"67\" coin crypto t-shirt etsy handmade",       "merch"),
    searchDDG("\"67coin\" OR \"official 67 coin\" tiktok creator", "creator"),
    searchDDG("\"$67 coin\" OR \"67coin\" blog article news review",   "media"),
  ])

  // Deduplicate by name
  const allRaw = [...ytCreators, ...ytMusic, ...amazonMerch, ...etsyMerch, ...tiktokCreators, ...mediaResults]
  const seen   = new Set<string>()
  const deduped = allRaw.filter(t => {
    const key = t.name.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Generate email drafts concurrently
  const withEmails = await Promise.all(
    deduped.slice(0, 15).map(async t => ({
      ...t,
      emailDraft: await draftEmail(t, provider, apiKey),
    }))
  )

  return NextResponse.json({
    targets:     withEmails,
    discoveredAt: new Date().toISOString(),
    count:        withEmails.length,
  })
}
