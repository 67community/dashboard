// AI Settings — stored in localStorage, read by all AI-calling components

export type AIProvider = "claude" | "openai"

export interface AISettings {
  provider: AIProvider
  claudeKey: string   // Anthropic API key
  openaiKey: string   // OpenAI API key
}

const STORAGE_KEY = "67_ai_settings"

const DEFAULTS: AISettings = {
  provider:  "claude",
  claudeKey: "",
  openaiKey: "",
}

export function loadAISettings(): AISettings {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

export function saveAISettings(s: AISettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

/** Returns fetch headers to attach to every AI API call */
export function aiHeaders(s?: AISettings): HeadersInit {
  const settings = s ?? loadAISettings()
  const key = settings.provider === "openai" ? settings.openaiKey : settings.claudeKey
  return {
    "x-ai-provider": settings.provider,
    ...(key ? { "x-api-key": key } : {}),
  }
}
