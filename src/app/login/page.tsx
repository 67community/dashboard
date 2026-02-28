"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginForm() {
  const params       = useSearchParams()
  const from         = params.get("from") ?? "/"
  const [pw, setPw]  = useState("")
  const [err, setErr] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr(false)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    let res: Response
    try {
      res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password: pw }),
        signal:  controller.signal,
      })
    } catch {
      clearTimeout(timeout)
      setErr(true)
      setLoading(false)
      inputRef.current?.focus()
      return
    }
    clearTimeout(timeout)

    if (res.ok) {
      window.location.href = from
    } else {
      setErr(true)
      setPw("")
      setLoading(false)
      inputRef.current?.focus()
    }
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
            fontSize: "1.75rem",
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
              $67 Community · Team Access Only
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            ref={inputRef}
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(false) }}
            placeholder="Enter password"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: err ? "1.5px solid #EF4444" : "1.5px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#FFFFFF",
              fontSize: "1rem",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={e => { if (!err) e.target.style.borderColor = "rgba(245,166,35,0.5)" }}
            onBlur={e  => { if (!err) e.target.style.borderColor = "rgba(255,255,255,0.1)" }}
          />

          {err && (
            <p style={{ fontSize: "0.8125rem", color: "#EF4444", textAlign: "center", margin: 0 }}>
              Incorrect password. Try again.
            </p>
          )}

          <button
            type="submit"
            disabled={!pw || loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              background: !pw || loading ? "rgba(245,166,35,0.3)" : "#F5A623",
              color: !pw || loading ? "rgba(0,0,0,0.5)" : "#000000",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: !pw || loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Verifying…" : "Enter →"}
          </button>
        </form>

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
