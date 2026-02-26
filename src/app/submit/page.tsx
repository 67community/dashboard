"use client"

import { useState } from "react"
import Image from "next/image"

type Platform = "tiktok" | "instagram" | "youtube" | "x" | "reddit" | "news" | "irl" | "other"

const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value:"tiktok",    label:"TikTok",     emoji:"🎵" },
  { value:"instagram", label:"Instagram",  emoji:"📸" },
  { value:"youtube",   label:"YouTube",    emoji:"▶️"  },
  { value:"x",         label:"X / Twitter",emoji:"𝕏"  },
  { value:"reddit",    label:"Reddit",     emoji:"🤖" },
  { value:"news",      label:"News",       emoji:"📰" },
  { value:"irl",       label:"IRL",        emoji:"📍" },
  { value:"other",     label:"Other",      emoji:"⭐" },
]

export default function SubmitPage() {
  const [title,    setTitle]    = useState("")
  const [platform, setPlatform] = useState<Platform>("tiktok")
  const [url,      setUrl]      = useState("")
  const [handle,   setHandle]   = useState("")
  const [note,     setNote]     = useState("")
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [error,    setError]    = useState<string|null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || loading) return
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/submit", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          title: title.trim(), platform, url: url.trim()||undefined,
          handle: handle.trim()||undefined, note: note.trim()||undefined,
        }),
      })
      if (res.ok) { setDone(true) }
      else        { setError("Something went wrong. Try again.") }
    } catch {
      setError("Connection error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex",
      alignItems:"center", justifyContent:"center", padding:24, flexDirection:"column", gap:24 }}>
      {/* Confetti-like dots */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {["#F5A623","#FFD700","#FF6B35","#C8820A"].map((c,i) => (
          <div key={i} style={{ position:"absolute",
            left:`${20 + i*20}%`, top:`${10 + i*15}%`,
            width:8, height:8, borderRadius:"50%", background:c, opacity:0.6 }} />
        ))}
      </div>

      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:"4rem", marginBottom:16 }}>🙌</div>
        <h1 style={{ fontSize:"2rem", fontWeight:900, color:"#FFFFFF",
          letterSpacing:"-0.04em", marginBottom:12 }}>
          Sighting Received!
        </h1>
        <p style={{ fontSize:"1rem", color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginBottom:32 }}>
          The 67 team got your submission. If it's fire, you'll see it posted. 🔥
        </p>
        <button onClick={() => { setDone(false); setTitle(""); setUrl(""); setHandle(""); setNote("") }}
          style={{ padding:"12px 28px", borderRadius:12, border:"none", cursor:"pointer",
            background:"#F5A623", color:"#000", fontSize:"1rem", fontWeight:800,
            letterSpacing:"-0.01em" }}>
          Submit Another
        </button>
        <p style={{ marginTop:24, fontSize:"0.875rem", color:"rgba(255,255,255,0.25)" }}>
          67 is everywhere 🤙
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"32px 16px" }}>

      {/* Background glow */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.18) 0%, transparent 60%)" }} />

      <div style={{ width:"100%", maxWidth:480, position:"relative", zIndex:1 }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://raw.githubusercontent.com/67coin/67/main/logo.png" alt="67"
            style={{ width:64, height:64, borderRadius:"50%", objectFit:"cover",
              boxShadow:"0 0 32px rgba(245,166,35,0.6)", marginBottom:20, display:"inline-block" }} />
          <h1 style={{ fontSize:"2rem", fontWeight:900, color:"#FFFFFF",
            letterSpacing:"-0.05em", lineHeight:1.1, marginBottom:10 }}>
            Spotted a 67? 👀
          </h1>
          <p style={{ fontSize:"1rem", color:"rgba(255,255,255,0.45)", lineHeight:1.55 }}>
            Found 67 in the wild? Send it to us —<br />
            billboard, TikTok, news, anywhere.
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={submit}
          style={{ background:"rgba(255,255,255,0.05)", borderRadius:20,
            border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(20px)",
            padding:"28px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* What */}
          <div>
            <label style={{ fontSize:"0.75rem", fontWeight:700, color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>
              What did you see? *
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="e.g. 67 on a billboard in NYC, TikTok with 2M views…"
              style={{ width:"100%", padding:"12px 14px", borderRadius:12, boxSizing:"border-box",
                border:"1.5px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)",
                color:"#FFF", fontSize:"0.9375rem", fontFamily:"inherit", outline:"none",
                transition:"border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor="rgba(245,166,35,0.7)"}
              onBlur={e  => e.target.style.borderColor="rgba(255,255,255,0.12)"} />
          </div>

          {/* Platform */}
          <div>
            <label style={{ fontSize:"0.75rem", fontWeight:700, color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>
              Platform
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6 }}>
              {PLATFORMS.map(p => (
                <button key={p.value} type="button" onClick={() => setPlatform(p.value)}
                  style={{ padding:"10px 4px", borderRadius:10, border:"none", cursor:"pointer",
                    background: platform===p.value ? "rgba(245,166,35,0.25)" : "rgba(255,255,255,0.06)",
                    outline: platform===p.value ? "1.5px solid rgba(245,166,35,0.7)" : "1.5px solid transparent",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    transition:"all 0.12s" }}>
                  <span style={{ fontSize:"1.125rem" }}>{p.emoji}</span>
                  <span style={{ fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.05em",
                    color: platform===p.value ? "#F5A623" : "rgba(255,255,255,0.35)" }}>
                    {p.label === "X / Twitter" ? "X" : p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div>
            <label style={{ fontSize:"0.75rem", fontWeight:700, color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>
              Link (optional)
            </label>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="Paste the URL here"
              type="url"
              style={{ width:"100%", padding:"12px 14px", borderRadius:12, boxSizing:"border-box",
                border:"1.5px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)",
                color:"#FFF", fontSize:"0.9375rem", fontFamily:"inherit", outline:"none",
                transition:"border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor="rgba(245,166,35,0.7)"}
              onBlur={e  => e.target.style.borderColor="rgba(255,255,255,0.12)"} />
          </div>

          {/* Handle + note */}
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:"0.75rem", fontWeight:700, color:"rgba(255,255,255,0.5)",
                textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>
                Your @handle (optional)
              </label>
              <input value={handle} onChange={e => setHandle(e.target.value)}
                placeholder="@yourhandle"
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, boxSizing:"border-box",
                  border:"1.5px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)",
                  color:"#FFF", fontSize:"0.9375rem", fontFamily:"inherit", outline:"none" }}
                onFocus={e => e.target.style.borderColor="rgba(245,166,35,0.7)"}
                onBlur={e  => e.target.style.borderColor="rgba(255,255,255,0.12)"} />
            </div>
          </div>

          <div>
            <label style={{ fontSize:"0.75rem", fontWeight:700, color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:8 }}>
              Extra context (optional)
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="Any extra details…"
              style={{ width:"100%", padding:"12px 14px", borderRadius:12, boxSizing:"border-box",
                border:"1.5px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)",
                color:"#FFF", fontSize:"0.9375rem", fontFamily:"inherit", outline:"none",
                resize:"none", transition:"border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor="rgba(245,166,35,0.7)"}
              onBlur={e  => e.target.style.borderColor="rgba(255,255,255,0.12)"} />
          </div>

          {error && (
            <p style={{ color:"#EF4444", fontSize:"0.875rem", textAlign:"center" }}>{error}</p>
          )}

          <button type="submit" disabled={!title.trim() || loading}
            style={{ padding:"14px 0", borderRadius:14, border:"none",
              cursor: !title.trim()||loading ? "not-allowed" : "pointer",
              background: !title.trim()||loading ? "rgba(255,255,255,0.1)" : "#F5A623",
              color: !title.trim()||loading ? "rgba(255,255,255,0.3)" : "#000",
              fontSize:"1rem", fontWeight:800, letterSpacing:"-0.01em",
              transition:"all 0.15s", marginTop:4 }}>
            {loading ? "Sending…" : "Submit Sighting 🤙"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:20, fontSize:"0.75rem",
          color:"rgba(255,255,255,0.2)" }}>
          67 is everywhere. Thank you for being part of the movement.
        </p>
      </div>
    </div>
  )
}
