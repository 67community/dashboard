/**
 * Unified AI call helper — supports Claude (Anthropic) and GPT-4o (OpenAI)
 * Provider + key are read from request headers (x-ai-provider, x-api-key),
 * falling back to environment variables.
 */

export type AIProvider = "claude" | "openai"

export interface AIMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface AICallOptions {
  req:        Request
  messages:   AIMessage[]
  maxTokens?: number
  system?:    string   // system prompt (Claude uses separate field; for OpenAI added as system role msg)
}

export interface AICallResult {
  text:     string
  provider: AIProvider
  model:    string
}

const CLAUDE_MODEL = "claude-sonnet-4-5"
const OPENAI_MODEL = "gpt-4o"

export async function callAI(opts: AICallOptions): Promise<AICallResult> {
  const { req, messages, maxTokens = 1000, system } = opts

  // ── Resolve provider and key ──────────────────────────────────────────────
  const providerHeader = req.headers.get("x-ai-provider") as AIProvider | null
  const keyHeader      = req.headers.get("x-api-key")

  const provider: AIProvider = (providerHeader === "openai" || providerHeader === "claude")
    ? providerHeader
    : "claude"

  // Key priority: header → env var
  const apiKey = provider === "openai"
    ? (keyHeader || process.env.OPENAI_API_KEY || "")
    : (keyHeader || process.env.ANTHROPIC_API_KEY || "")

  return callAIRaw({ provider, apiKey, messages, maxTokens, system })
}

/** Lower-level call — pass provider and apiKey explicitly (no req needed) */
export async function callAIRaw(opts: {
  provider:   AIProvider
  apiKey:     string
  messages:   AIMessage[]
  maxTokens?: number
  system?:    string
}): Promise<AICallResult> {
  const { provider, apiKey, messages, maxTokens = 1000, system } = opts

  if (provider === "openai") {
    return callOpenAI({ messages, maxTokens, system, apiKey })
  } else {
    return callClaude({ messages, maxTokens, system, apiKey })
  }
}

/** Extract AI provider + key from request headers (for passing to sub-functions) */
export function resolveAIConfig(req: Request): { provider: AIProvider; apiKey: string } {
  const providerHeader = req.headers.get("x-ai-provider") as AIProvider | null
  const keyHeader      = req.headers.get("x-api-key")
  const provider: AIProvider = (providerHeader === "openai" || providerHeader === "claude")
    ? providerHeader : "claude"
  const apiKey = provider === "openai"
    ? (keyHeader || process.env.OPENAI_API_KEY || "")
    : (keyHeader || process.env.ANTHROPIC_API_KEY || "")
  return { provider, apiKey }
}

// ── Claude ────────────────────────────────────────────────────────────────────

async function callClaude(opts: {
  messages:  AIMessage[]
  maxTokens: number
  system?:   string
  apiKey:    string
}): Promise<AICallResult> {
  const { messages, maxTokens, system, apiKey } = opts

  if (!apiKey) throw new Error("No Anthropic API key configured")

  // Filter out system messages — Claude uses the system param instead
  const userMessages = messages.filter(m => m.role !== "system")

  const body: Record<string, unknown> = {
    model:      CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages:   userMessages,
  }
  if (system) body.system = system

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":    "application/json",
      "x-api-key":       apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ""
  return { text, provider: "claude", model: CLAUDE_MODEL }
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

async function callOpenAI(opts: {
  messages:  AIMessage[]
  maxTokens: number
  system?:   string
  apiKey:    string
}): Promise<AICallResult> {
  const { messages, maxTokens, system, apiKey } = opts

  if (!apiKey) throw new Error("No OpenAI API key configured")

  // Prepend system message if provided
  const fullMessages: AIMessage[] = system
    ? [{ role: "system", content: system }, ...messages]
    : messages

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:      OPENAI_MODEL,
      max_tokens: maxTokens,
      messages:   fullMessages,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content ?? ""
  return { text, provider: "openai", model: OPENAI_MODEL }
}
