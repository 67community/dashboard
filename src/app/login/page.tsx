"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-client"

const DISCORD_ICON = (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.634 1.347A18.22 18.22 0 0 0 14.25 0a.068.068 0 0 0-.072.034c-.183.325-.385.749-.527 1.083a16.845 16.845 0 0 0-5.3 0A10.96 10.96 0 0 0 7.818.034.071.071 0 0 0 7.746 0a18.17 18.17 0 0 0-4.384 1.347.064.064 0 0 0-.03.025C.533 5.525-.32 9.57.1 13.562a.077.077 0 0 0 .03.052c1.84 1.351 3.625 2.172 5.376 2.714a.073.073 0 0 0 .079-.026c.414-.566.783-1.163 1.099-1.79a.072.072 0 0 0-.04-.1 12.02 12.02 0 0 1-1.71-.814.073.073 0 0 1-.007-.12c.115-.086.23-.175.339-.266a.069.069 0 0 1 .072-.01c3.589 1.638 7.478 1.638 11.024 0a.069.069 0 0 1 .073.009c.11.09.224.18.34.267a.073.073 0 0 1-.006.12 11.24 11.24 0 0 1-1.711.813.072.072 0 0 0-.039.1c.322.628.69 1.224 1.098 1.79a.072.072 0 0 0 .079.027c1.759-.542 3.544-1.363 5.383-2.714a.074.074 0 0 0 .03-.05c.5-5.177-.838-9.174-3.548-12.96a.058.058 0 0 0-.03-.027ZM7.348 11.11c-1.144 0-2.087-1.05-2.087-2.34 0-1.29.924-2.34 2.087-2.34 1.172 0 2.105 1.059 2.087 2.34 0 1.29-.924 2.34-2.087 2.34Zm7.717 0c-1.144 0-2.087-1.05-2.087-2.34 0-1.29.924-2.34 2.087-2.34 1.173 0 2.106 1.059 2.087 2.34 0 1.29-.915 2.34-2.087 2.34Z" fill="currentColor"/>
  </svg>
)


const TELEGRAM_ICON = (
  <svg width="20" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.05 1.577c-.393-.016-.784.08-1.117.235-.484.186-4.92 1.902-9.41 3.64-2.26.873-4.518 1.748-6.192 2.396-1.674.648-2.862 1.116-3.05 1.196-.848.36-1.635.772-1.955 1.456-.16.342-.17.72-.004 1.073.166.354.5.632.91.825.37.174.674.312 1.882.87l.04.018c.727.334 1.193.55 1.665.816.47.265.937.59 1.584 1.166l.037.034c2.814 2.493 5.136 4.676 6.328 5.82.378.362.727.696 1.162.964.434.268.972.475 1.566.346.594-.128 1.048-.54 1.357-1.037.31-.498.51-1.066.66-1.605l.06-.214c.79-2.826 1.633-5.66 2.316-8.012.34-1.176.643-2.229.876-3.058.233-.828.374-1.433.407-1.738.077-.722-.073-1.39-.543-1.835-.237-.225-.564-.378-.9-.394h-.003Zm-.118 1.874c-.013.09-.105.508-.33 1.312-.226.803-.527 1.85-.864 3.014-.673 2.33-1.512 5.147-2.303 7.975l-.057.2c-.146.52-.313 1-.517 1.326-.106.17-.2.27-.263.305-.024.013-.02.014-.072.025-.024-.003-.09-.024-.237-.115-.295-.183-.573-.45-.95-.812-1.17-1.125-3.465-3.28-6.3-5.792l-.037-.034c-.703-.627-1.258-1.022-1.85-1.356-.39-.22-.792-.408-1.327-.654l-.038-.017c-.505-.233-1.092-.504-1.394-.647.328-.133.643-.26 1.076-.428 1.672-.648 3.93-1.523 6.188-2.395 4.487-1.738 8.94-3.46 9.348-3.62.305-.118.392-.132.39-.127Z" fill="currentColor"/>
  </svg>
)

function errorMessage(error: string | null) {
  if (!error) return null
  if (error === "guild") return "You must be a 67 Coin Discord member to access Mission Control."
  if (error === "not_allowed") return "Access denied. Your Discord account is not authorized for the dashboard."
  if (error === "auth") return "Authentication failed. Please try again."
  if (error === "tg_not_allowed") return "Access denied. Your Telegram account is not authorized for the dashboard."
  if (error === "no_token") return "Could not retrieve Discord token. Please try again."
  return "An error occurred. Please try again."
}

function LoginForm() {
  const params = useSearchParams()
  const from = params.get("from") ?? "/"
  const errorParam = params.get("error")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(errorMessage(errorParam))

  // Clear error if params change
  useEffect(() => {
    setError(errorMessage(errorParam))
  }, [errorParam])

  async function handleDiscordLogin() {
    setLoading(true)
    setError(null)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(from)}`,
        scopes: "identify guilds",
      },
    })
    if (error) {
      setError("Failed to start Discord login. Please try again.")
      setLoading(false)
    }
    // On success, browser is redirected — no need to reset loading
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        padding: "0 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
      }}>
        {/* Logo + Title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "rgba(245,166,35,0.12)",
            border: "1.5px solid rgba(245,166,35,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img
              src="https://raw.githubusercontent.com/67coin/67/main/logo.png"
              alt="67"
              style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.375rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", margin: 0 }}>
              Mission Control
            </p>
            <p style={{ fontSize: "0.875rem", color: "#71717A", marginTop: 4 }}>
              $67 Community · Members Only
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(239,68,68,0.1)",
            border: "1.5px solid rgba(239,68,68,0.3)",
            color: "#FCA5A5",
            fontSize: "0.875rem",
            textAlign: "center",
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* Discord login button */}
        <div style={{ width: "100%" }}>
          <button
            onClick={handleDiscordLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              background: loading ? "rgba(88,101,242,0.5)" : "#5865F2",
              color: loading ? "rgba(255,255,255,0.5)" : "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {!loading && DISCORD_ICON}
            {loading ? "Connecting…" : "Sign in with Discord"}
          </button>
          <p style={{
            fontSize: "0.75rem",
            color: "#52525B",
            textAlign: "center",
            marginTop: 12,
            lineHeight: 1.5,
          }}>
            You must be a member of the 67 Coin Discord server
          </p>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#27272A" }} />
            <span style={{ fontSize: "0.75rem", color: "#52525B", fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#27272A" }} />
          </div>

          {/* Telegram login button */}
          <button
            onClick={() => {
              const botUsername = "Dashboard67_bot"
              const callbackUrl = `${window.location.origin}/api/auth/telegram-callback?next=${encodeURIComponent(from)}`
              window.location.href = `https://oauth.telegram.org/auth?bot_id=7916315421&origin=${encodeURIComponent(window.location.origin)}&embed=0&request_access=write&return_to=${encodeURIComponent(callbackUrl)}`
            }}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              background: "#2AABEE",
              color: "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {TELEGRAM_ICON}
            Sign in with Telegram
          </button>
        </div>

        <p style={{ fontSize: "0.75rem", color: "#3F3F46", textAlign: "center" }}>
          67 Mission Control · Internal Team Dashboard
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
