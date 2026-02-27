import { NextResponse } from "next/server"
import { callAI } from "@/app/api/_lib/ai-call"

export async function POST(req: Request) {
  const { what, why, how } = await req.clone().json()

  if (!what || !why) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const result = await callAI({
      req,
      maxTokens: 600,
      messages: [{
        role: "user",
        content: `You are Nova, the AI for The Official 67 Coin ($67) Mission Control dashboard. A team member submitted a feature request.

FEATURE REQUEST:
- What: ${what}
- Why: ${why}
${how ? `- How they see it working: ${how}` : ""}

Respond with a concise implementation plan in this exact JSON format:
{
  "plan": "2-3 sentence plan of how to build this",
  "priority": "high|medium|low",
  "effort": "X days/hours estimate",
  "tags": ["tag1", "tag2"]
}

Be practical. Consider that this is a Next.js dashboard. Keep it short and actionable.`,
      }],
    })

    const text = result.text
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({ ...parsed, _provider: result.provider })
      }
    } catch {}

    return NextResponse.json({
      plan: text,
      priority: "medium",
      effort: "TBD",
      tags: ["feature"],
      _provider: result.provider,
    })
  } catch {
    // Mock response if no API key configured
    return NextResponse.json({
      plan: `**Implementation Plan**\n\n**What:** ${what}\n\n**Priority:** Medium\n\n**Steps:**\n1. Analyze requirements\n2. Design solution\n3. Build & test\n4. Deploy\n\n**Estimated effort:** 2-3 days`,
      priority: "medium",
      effort: "2-3 days",
      tags: ["feature", "enhancement"],
    })
  }
}
