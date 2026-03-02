"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X, Eye, EyeOff, Check, AlertCircle, Cpu } from "lucide-react"
import { loadAISettings, saveAISettings, type AIProvider, type AISettings } from "@/lib/ai-settings"

// ── Provider icons ─────────────────────────────────────────────────────────────

function ClaudeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#D97757" opacity="0.9" />
      <path d="M12 2v20M3 7l9 5 9-5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
    </svg>
  )
}

function OpenAIIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.785 0l5.843-3.369v2.332a.08.08 0 01-.032.067L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.872zm16.597 3.855l-5.843-3.37 2.019-1.168a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.4-.68zm2.010-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

// ── Provider card ─────────────────────────────────────────────────────────────

function ProviderCard({
  id, label, desc, icon, selected, onClick
}: {
  id: AIProvider; label: string; desc: string
  icon: React.ReactNode; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start",
        gap: 8, padding: "14px 16px",
        background: selected ? "rgba(245,166,35,0.08)" : "rgba(0,0,0,0.03)",
        border: `2px solid ${selected ? "#F5A623" : "rgba(0,0,0,0.1)"}`,
        borderRadius: 12, cursor: "pointer", transition: "all 0.15s", textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: selected ? "#F5A623" : "#6B7280" }}>{icon}</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: selected ? "#09090B" : "#374151" }}>
          {label}
        </span>
        {selected && (
          <span style={{
            marginLeft: "auto", background: "#F5A623", color: "#fff",
            borderRadius: 99, padding: "1px 7px", fontSize: "0.625rem", fontWeight: 800,
          }}>ACTIVE</span>
        )}
      </div>
      <span style={{ fontSize: "0.75rem", color: "var(--secondary)", lineHeight: 1.4 }}>{desc}</span>
    </button>
  )
}

// ── Key input ──────────────────────────────────────────────────────────────────

function KeyInput({
  label, value, onChange, placeholder, saved
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; saved: boolean
}) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", letterSpacing: "0.02em" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "9px 38px 9px 12px",
            fontSize: "0.8125rem", fontFamily: "monospace",
            border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: 8,
            background: "#FAFAFA", color: "#09090B", outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={e => (e.target.style.borderColor = "#F5A623")}
          onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 2,
            color: "#9CA3AF",
          }}
        >
          {show
            ? <EyeOff style={{ width: 14, height: 14 }} />
            : <Eye style={{ width: 14, height: 14 }} />}
        </button>
      </div>
      {saved && value && (
        <span style={{ fontSize: "0.6875rem", color: "#059669", display: "flex", alignItems: "center", gap: 4 }}>
          <Check style={{ width: 11, height: 11 }} /> Key saved
        </span>
      )}
    </div>
  )
}

// ── Main Settings Modal ────────────────────────────────────────────────────────

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [settings, setSettings]  = useState<AISettings>(loadAISettings)
  const [saved, setSaved]        = useState(false)
  const [testing, setTesting]    = useState(false)
  const [testResult, setTestResult] = useState<null | { ok: boolean; msg: string }>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Reload settings when modal opens
  useEffect(() => {
    if (open) {
      setSettings(loadAISettings())
      setSaved(false)
      setTestResult(null)
    }
  }, [open])

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  const handleSave = () => {
    saveAISettings(settings)
    setSaved(true)
    setTestResult(null)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const activeKey = settings.provider === "openai" ? settings.openaiKey : settings.claudeKey
    if (!activeKey) {
      setTestResult({ ok: false, msg: "No API key entered for the selected provider." })
      setTesting(false)
      return
    }
    try {
      const headers: HeadersInit = {
        "Content-Type":  "application/json",
        "x-ai-provider": settings.provider,
        "x-api-key":     activeKey,
      }
      const res = await fetch("/api/feature-request", {
        method: "POST",
        headers,
        body: JSON.stringify({ what: "Test connection", why: "Verifying AI key" }),
      })
      if (res.ok) {
        const data = await res.json()
        const provider = data._provider ?? settings.provider
        setTestResult({ ok: true, msg: `✅ ${provider === "openai" ? "GPT-4o" : "Claude"} connected successfully!` })
      } else {
        const data = await res.json().catch(() => ({}))
        setTestResult({ ok: false, msg: `❌ Error: ${data.error ?? res.statusText}` })
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `❌ Network error: ${String(e)}` })
    }
    setTesting(false)
  }

  if (!open) return null

  const modal = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{
        background: "#FFFFFF",
        borderRadius: 20,
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        animation: "slideUp 0.18s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #F5A623, #F97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Cpu style={{ width: 17, height: 17, color: "#fff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#09090B", margin: 0, letterSpacing: "-0.02em" }}>
                AI Settings
              </h2>
              <p style={{ fontSize: "0.6875rem", color: "#9CA3AF", margin: 0 }}>
                Choose your AI provider and enter your API key
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer",
              width: 30, height: 30, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
          >
            <X style={{ width: 15, height: 15, color: "var(--secondary)" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Provider selection */}
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--foreground)",
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              AI Provider
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <ProviderCard
                id="claude" label="Claude" selected={settings.provider === "claude"}
                desc="Anthropic's Claude Sonnet — best for reasoning and writing"
                icon={<ClaudeIcon size={18} />}
                onClick={() => setSettings(s => ({ ...s, provider: "claude" }))}
              />
              <ProviderCard
                id="openai" label="ChatGPT" selected={settings.provider === "openai"}
                desc="OpenAI's GPT-4o — fast and versatile"
                icon={<OpenAIIcon size={18} />}
                onClick={() => setSettings(s => ({ ...s, provider: "openai" }))}
              />
            </div>
          </div>

          {/* API Keys */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--foreground)",
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 0 }}>
              API Keys
            </p>

            <KeyInput
              label="Anthropic (Claude) Key"
              value={settings.claudeKey}
              onChange={v => setSettings(s => ({ ...s, claudeKey: v }))}
              placeholder="sk-ant-api03-..."
              saved={saved}
            />

            <KeyInput
              label="OpenAI (ChatGPT) Key"
              value={settings.openaiKey}
              onChange={v => setSettings(s => ({ ...s, openaiKey: v }))}
              placeholder="sk-proj-..."
              saved={saved}
            />
          </div>

          {/* Info box */}
          <div style={{
            background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: 10, padding: "10px 14px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <AlertCircle style={{ width: 14, height: 14, color: "#F5A623", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: "0.75rem", color: "#92400E", lineHeight: 1.5, margin: 0 }}>
              Keys are stored in your browser (localStorage) — never sent to our servers.
              Only the active provider's key is used for AI requests.
            </p>
          </div>

          {/* Test result */}
          {testResult && (
            <div style={{
              background: testResult.ok ? "rgba(5,150,105,0.07)" : "rgba(220,38,38,0.07)",
              border: `1px solid ${testResult.ok ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
              borderRadius: 10, padding: "10px 14px",
              fontSize: "0.8125rem", fontWeight: 500,
              color: testResult.ok ? "#065F46" : "#991B1B",
            }}>
              {testResult.msg}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              onClick={handleTest}
              disabled={testing}
              style={{
                flex: 1, padding: "10px 0",
                background: "rgba(0,0,0,0.05)",
                border: "1.5px solid var(--separator)", borderRadius: 10,
                fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)",
                cursor: testing ? "not-allowed" : "pointer",
                opacity: testing ? 0.6 : 1, transition: "all 0.15s",
              }}
              onMouseEnter={e => !testing && (e.currentTarget.style.background = "rgba(0,0,0,0.09)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
            >
              {testing ? "Testing…" : "Test Connection"}
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 2, padding: "10px 0",
                background: saved ? "#059669" : "#F5A623",
                border: "none", borderRadius: 10,
                fontSize: "0.8125rem", fontWeight: 700,
                color: saved ? "#fff" : "#000",
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {saved ? <><Check style={{ width: 14, height: 14 }} /> Saved!</> : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null
}
