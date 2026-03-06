"use client"

import { useState, useEffect, useRef } from "react"
import { StickyNote, Plus, Trash2, Pin, Mic, Square, Play, Pause } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { addNotification } from "@/lib/notifications"
import { TEAM_MEMBERS } from "@/lib/mock-data"

// ── Types ─────────────────────────────────────────────────────────────────────

type NoteColor = "yellow" | "blue" | "green" | "red" | "purple"
type NoteKind  = "note" | "voice"

interface TeamNote {
  id:        string
  text:      string
  author:    string
  color:     NoteColor
  pinned:    boolean
  createdAt: string
  kind?:     NoteKind
  audioB64?: string   // base64 webm audio
  duration?: number   // seconds
}

const COLOR_CONFIG: Record<NoteColor, { bg: string; border: string; accent: string; label: string; emoji: string }> = {
  red:    { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.35)",   accent: "#EF4444", label: "🔴 Urgent",  emoji: "🔴" },
  yellow: { bg: "rgba(245,166,35,0.08)",  border: "rgba(245,166,35,0.35)",  accent: "#D97706", label: "🟡 Medium",  emoji: "🟡" },
  green:  { bg: "rgba(5,150,105,0.07)",   border: "rgba(5,150,105,0.25)",   accent: "#059669", label: "🟢 Normal",  emoji: "🟢" },
  blue:   { bg: "rgba(37,99,235,0.07)",   border: "rgba(37,99,235,0.2)",    accent: "#2563EB", label: "🔵 Info",    emoji: "🔵" },
  purple: { bg: "rgba(124,58,237,0.07)",  border: "rgba(124,58,237,0.2)",   accent: "#7C3AED", label: "🟣 Idea",    emoji: "🟣" },
}

const COLORS: NoteColor[] = ["red", "yellow", "green", "blue", "purple"]
const AUTHORS = TEAM_MEMBERS.map(m => m.name.split(" ")[0])

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function fmtDuration(s: number) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2,"0")}`
}

// ── Voice Note Player ─────────────────────────────────────────────────────────

function VoicePlayer({ audioB64, duration, accent }: { audioB64: string; duration?: number; accent: string }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const url = `data:audio/webm;base64,${audioB64}`
    audioRef.current = new Audio(url)
    const audio = audioRef.current
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    }
    audio.onended = () => { setPlaying(false); setProgress(0); setCurrentTime(0) }
    return () => { audio.pause(); audio.src = "" }
  }, [audioB64])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else         { audio.play(); setPlaying(true) }
  }

  const dur = duration ?? 0
  const totalStr = fmtDuration(dur)
  const curStr   = fmtDuration(currentTime)

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(0,0,0,0.04)", borderRadius:10, padding:"8px 12px" }}>
      <button onClick={e => { e.stopPropagation(); toggle() }}
        style={{ width:32, height:32, borderRadius:"50%", border:"none", cursor:"pointer",
          background: accent, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {playing ? <Pause style={{ width:13, height:13 }} /> : <Play style={{ width:13, height:13 }} />}
      </button>
      <div style={{ flex:1 }}>
        {/* Progress bar */}
        <div style={{ height:4, borderRadius:99, background:"rgba(0,0,0,0.1)", overflow:"hidden", cursor:"pointer" }}
          onClick={e => {
            e.stopPropagation()
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            const pct  = (e.clientX - rect.left) / rect.width
            if (audioRef.current) { audioRef.current.currentTime = pct * (audioRef.current.duration || 0) }
          }}>
          <div style={{ height:"100%", width:`${progress * 100}%`, background: accent, borderRadius:99, transition:"width 0.1s linear" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
          <span style={{ fontSize:"0.5625rem", color:"var(--tertiary)", fontWeight:600 }}>{curStr}</span>
          <span style={{ fontSize:"0.5625rem", color:"var(--tertiary)", fontWeight:600 }}>{totalStr}</span>
        </div>
      </div>
    </div>
  )
}

// ── Voice Recorder ────────────────────────────────────────────────────────────

function VoiceRecorder({ author, onSave, onCancel }: {
  author: string
  onSave: (b64: string, duration: number) => void
  onCancel: () => void
}) {
  const [state,    setState]    = useState<"idle"|"recording"|"done">("idle")
  const [elapsed,  setElapsed]  = useState(0)
  const [audioB64, setAudioB64] = useState("")
  const [duration, setDuration] = useState(0)
  const mrRef    = useRef<MediaRecorder | null>(null)
  const chunksRef= useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mrRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const reader = new FileReader()
        reader.onloadend = () => {
          const b64 = (reader.result as string).split(",")[1]
          setAudioB64(b64)
          setDuration(elapsed)
          setState("done")
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start(100)
      setState("recording")
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000)
    } catch {
      alert("Microphone access denied. Please allow it in browser settings.")
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    mrRef.current?.stop()
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    mrRef.current?.stream?.getTracks().forEach(t => t.stop())
  }, [])

  return (
    <div style={{ background:"rgba(239,68,68,0.06)", border:"1.5px solid rgba(239,68,68,0.2)", borderRadius:14, padding:14, display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:"0.75rem", fontWeight:800, color:"#EF4444", textTransform:"uppercase", letterSpacing:"0.06em" }}>🎙 Voice Note</span>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#7C3AED" }}>{author}</span>
        {state === "recording" && (
          <span style={{ marginLeft:"auto", fontSize:"0.875rem", fontWeight:800, color:"#EF4444", fontVariantNumeric:"tabular-nums" }}>
            {fmtDuration(elapsed)}
          </span>
        )}
      </div>

      {state === "idle" && (
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={startRecording}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0",
              borderRadius:10, border:"none", cursor:"pointer", background:"#EF4444", color:"#fff",
              fontSize:"0.875rem", fontWeight:700, flex:1 }}>
            <Mic style={{ width:16, height:16 }} /> Start Recording
          </button>
          <button onClick={onCancel}
            style={{ padding:"12px 14px", borderRadius:10, border:"1.5px solid var(--separator)",
              background:"none", cursor:"pointer", fontSize:"0.875rem", color:"var(--tertiary)", fontWeight:600 }}>
            ✕
          </button>
        </div>
      )}

      {state === "recording" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* Animated waveform */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:3, height:32 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{
                width:4, borderRadius:2, background:"#EF4444",
                animation:`wave 0.8s ease-in-out ${i * 0.07}s infinite alternate`,
                height: `${20 + Math.sin(i) * 10}px`,
              }} />
            ))}
          </div>
          <style>{`@keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
          <button onClick={stopRecording}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 0",
              borderRadius:10, border:"none", cursor:"pointer", background:"#1D1D1F", color:"#fff",
              fontSize:"0.875rem", fontWeight:700 }}>
            <Square style={{ width:14, height:14 }} /> Stop
          </button>
        </div>
      )}

      {state === "done" && audioB64 && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <VoicePlayer audioB64={audioB64} duration={duration} accent="#EF4444" />
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => onSave(audioB64, duration)}
              style={{ flex:1, padding:"9px 0", borderRadius:9, border:"none", cursor:"pointer",
                background:"#059669", color:"#fff", fontSize:"0.875rem", fontWeight:700 }}>
              ✓ Save
            </button>
            <button onClick={() => { setState("idle"); setAudioB64(""); setElapsed(0) }}
              style={{ padding:"9px 14px", borderRadius:9, border:"1.5px solid var(--separator)",
                background:"none", cursor:"pointer", fontSize:"0.875rem", color:"var(--tertiary)" }}>
              Retry
            </button>
            <button onClick={onCancel}
              style={{ padding:"9px 14px", borderRadius:9, border:"1.5px solid var(--separator)",
                background:"none", cursor:"pointer", fontSize:"0.875rem", color:"var(--tertiary)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── NoteCard ──────────────────────────────────────────────────────────────────

function NoteCard({ n, onPin, onDelete }: { n: TeamNote; onPin: (id: string) => void; onDelete: (id: string) => void }) {
  const c = COLOR_CONFIG[n.color]
  return (
    <div style={{ background: c.bg, border:`1.5px solid ${c.border}`, borderRadius:12, padding:"12px 14px", position:"relative" }}>
      <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:4 }}>
        {n.pinned && <span style={{ fontSize:"0.75rem" }}>📌</span>}
        <span style={{ fontSize:"0.6rem", fontWeight:800, color: c.accent, background: c.bg, border:`1px solid ${c.border}`, borderRadius:99, padding:"1px 6px" }}>{COLOR_CONFIG[n.color].label}</span>
      </div>

      {/* Voice note player */}
      {n.kind === "voice" && n.audioB64 ? (
        <div style={{ marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <Mic style={{ width:12, height:12, color: c.accent }} />
            <span style={{ fontSize:"0.6875rem", fontWeight:800, color: c.accent, textTransform:"uppercase", letterSpacing:"0.05em" }}>Voice Note</span>
          </div>
          <VoicePlayer audioB64={n.audioB64} duration={n.duration} accent={c.accent} />
        </div>
      ) : (
        <p style={{ fontSize:"0.875rem", color:"var(--foreground)", lineHeight:1.55, whiteSpace:"pre-wrap", marginBottom:8 }}>{n.text}</p>
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:"0.6875rem", fontWeight:700, color: c.accent }}>{n.author}</span>
          <span style={{ fontSize:"0.6875rem", color:"var(--tertiary)" }}>· {timeAgo(n.createdAt)}</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={e => { e.stopPropagation(); onPin(n.id) }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:2, opacity: n.pinned ? 1 : 0.4, color: c.accent }}>
            <Pin style={{ width:12, height:12 }} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(n.id) }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:2, color:"var(--secondary)" }}>
            <Trash2 style={{ width:12, height:12 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function TeamNotesCard() {
  const [notes,      setNotes]      = useState<TeamNote[]>([])
  const [mode,       setMode]       = useState<"none"|"text"|"voice">("none")
  const [text,       setText]       = useState("")
  const [author,     setAuthor]     = useState("Brandon")
  const [color,      setColor]      = useState<NoteColor>("yellow")
  const [toast,      setToast]      = useState<{author:string; kind:string; duration?:number} | null>(null)
  const lastIdsRef   = useRef<Set<string>>(new Set())
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    function loadNotes(initial = false) {
      fetch("/api/team-notes")
        .then(r => r.json())
        .then((data: TeamNote[]) => {
          if (!Array.isArray(data)) return
          setNotes(data)
          if (!initial) {
            const newNote = data.find(n => !lastIdsRef.current.has(n.id))
            if (newNote) {
              setToast({ author: newNote.author, kind: newNote.kind ?? "note", duration: newNote.duration })
            }
          }
          lastIdsRef.current = new Set(data.map(n => n.id))
        })
        .catch(() => {
          if (initial) {
            try { const s = localStorage.getItem("67_team_notes"); if (s) setNotes(JSON.parse(s)) } catch {}
          }
        })
    }
    loadNotes(true)
    const interval = setInterval(() => loadNotes(false), 15000)
    return () => clearInterval(interval)
  }, [])

  function save(ns: TeamNote[]) {
    setNotes(ns)
    localStorage.setItem("67_team_notes", JSON.stringify(ns))
  }

  async function saveNote(note: TeamNote) {
    const ns = [note, ...notes.filter(n => n.id !== note.id)]
    setNotes(ns)
    localStorage.setItem("67_team_notes", JSON.stringify(ns))
    await fetch("/api/team-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(note) }).catch(() => {})
  }

  async function deleteNoteRemote(id: string) {
    const ns = notes.filter(n => n.id !== id)
    setNotes(ns)
    localStorage.setItem("67_team_notes", JSON.stringify(ns))
    await fetch("/api/team-notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {})
  }

  async function pinNoteRemote(id: string) {
    const updated = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
    setNotes(updated)
    localStorage.setItem("67_team_notes", JSON.stringify(updated))
    const note = updated.find(n => n.id === id)
    if (note) await fetch("/api/team-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(note) }).catch(() => {})
  }

  function addTextNote() {
    if (!text.trim()) return
    const n: TeamNote = { id: Date.now().toString(), text: text.trim(), author, color, pinned: false, createdAt: new Date().toISOString(), kind: "note" }
    saveNote(n)
    addNotification({ type:"info", category:"note", message:`📝 ${author}: "${text.trim().slice(0,60)}"`, timestamp: new Date().toISOString() })
    setText(""); setMode("none")
  }

  function addVoiceNote(b64: string, duration: number) {
    const n: TeamNote = {
      id: Date.now().toString(), text: "", author, color: "red",
      pinned: false, createdAt: new Date().toISOString(), kind: "voice",
      audioB64: b64, duration,
    }
    saveNote(n)
    addNotification({ type:"info", category:"note", message:`🎙 ${author} sent a voice message (${fmtDuration(duration)})`, timestamp: new Date().toISOString() })
    setMode("none")
  }

  function togglePin(id: string) { pinNoteRemote(id) }
  function deleteNote(id: string) { deleteNoteRemote(id) }

  const sorted   = [...notes].sort((a,b) => { if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1; return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() })
  const pinned   = sorted.filter(n => n.pinned)
  const unpinned = sorted.filter(n => !n.pinned)

  // ── Collapsed ───────────────────────────────────────────────────────────────
  // ── Meeting state ───────────────────────────────────────────────────────────
  const MEETINGS = [
    {
      date: "2026-03-03",
      label: "Discord Voice — March 7, 2026",
      duration: "52:31",
      audio: "/meetings/meeting-2026-03-07.mp3",
      summary: [
        "Dashboard cards presented to the team — Announcements, X Raid Panel, Team Notes, Kanban",
        "Meaning of 67 Coin: Study Murad. Wednesday: everyone answers 'What does holding 67 mean?'",
        "Switch to Claude: Cowork + Obsidian + Chrome Extension — your computer is the memory",
      ]
    }
  ]

  const [meetingAudio, setMeetingAudio] = useState<HTMLAudioElement | null>(null)
  const [meetingPlaying, setMeetingPlaying] = useState(false)
  const [meetingProgress, setMeetingProgress] = useState(0)
  const [meetingTime, setMeetingTime] = useState(0)

  function toggleMeeting(url: string) {
    if (!meetingAudio) {
      const a = new Audio(url)
      a.ontimeupdate = () => { setMeetingTime(a.currentTime); setMeetingProgress(a.duration ? a.currentTime/a.duration : 0) }
      a.onended = () => { setMeetingPlaying(false); setMeetingProgress(0); setMeetingTime(0) }
      setMeetingAudio(a)
      a.play()
      setMeetingPlaying(true)
    } else {
      if (meetingPlaying) { meetingAudio.pause(); setMeetingPlaying(false) }
      else { meetingAudio.play(); setMeetingPlaying(true) }
    }
  }

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }} onClick={e => e.stopPropagation()}>

      {/* Action buttons */}
      {mode === "none" && (
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => { setMode("text"); setTimeout(() => textRef.current?.focus(), 50) }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px", borderRadius:10,
              border:"1.5px dashed rgba(0,0,0,0.12)", background:"none", cursor:"pointer", flex:1, color:"var(--tertiary)", fontSize:"0.875rem", fontWeight:600 }}>
            <Plus style={{ width:14, height:14 }} /> Add Note
          </button>
          <button onClick={() => setMode("voice")}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px",
              borderRadius:10, border:"1.5px dashed rgba(239,68,68,0.4)", background:"rgba(239,68,68,0.05)",
              cursor:"pointer", color:"#EF4444", fontSize:"0.75rem", fontWeight:700, whiteSpace:"nowrap" }}>
            <Mic style={{ width:13, height:13 }} /> Voice Note
          </button>
        </div>
      )}

      {mode === "text" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <textarea ref={textRef} value={text} onChange={e => setText(e.target.value)}
            placeholder="Write a note for the team…" rows={3}
            style={{ width:"100%", padding:"8px 10px", borderRadius:10, border:"1.5px solid var(--separator)", outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"var(--input-bg)", color:"var(--foreground)", resize:"none", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="#F5A623"} onBlur={e => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ display:"flex", gap:4 }}>
              {COLORS.map(c => <button key={c} onClick={() => setColor(c)} style={{ width:18, height:18, borderRadius:"50%", border:"none", cursor:"pointer", background: COLOR_CONFIG[c].accent, boxShadow: color === c ? `0 0 0 2.5px ${COLOR_CONFIG[c].accent}` : "none" }} />)}
            </div>
            <button onClick={addTextNote} disabled={!text.trim()}
              style={{ flex:1, padding:"6px 0", borderRadius:8, border:"none", cursor: !text.trim() ? "not-allowed":"pointer", background: !text.trim() ? "#E5E5EA":"#F5A623", color: !text.trim() ? "#A1A1AA":"#000", fontSize:"0.8125rem", fontWeight:700 }}>
              Post
            </button>
            <button onClick={() => { setMode("none"); setText("") }}
              style={{ padding:"6px 10px", borderRadius:8, border:"1.5px solid var(--separator)", background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"var(--tertiary)" }}>✕</button>
          </div>
        </div>
      )}

      {mode === "voice" && (
        <VoiceRecorder author={author} onSave={addVoiceNote} onCancel={() => setMode("none")} />
      )}

      {/* Recent notes */}
      {sorted.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {sorted.slice(0, 3).map(n => <NoteCard key={n.id} n={n} onPin={togglePin} onDelete={deleteNote} />)}
        </div>
      )}

      {/* Meeting Recordings preview */}
      <div style={{ borderTop:"1px solid var(--separator)", paddingTop:10, position:"relative", zIndex:10 }} onClick={e => e.stopPropagation()}>
        <p style={{ fontSize:"0.5625rem", fontWeight:800, color:"var(--secondary)", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 6px" }}>🎙️ Meeting Recordings</p>
        <div style={{ background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.18)", borderRadius:10, padding:"8px 10px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:8 }}>
            <div>
              <p style={{ margin:0, fontSize:"0.6875rem", fontWeight:700, color:"var(--foreground)" }}>Discord Voice — March 7, 2026</p>
              <p style={{ margin:"2px 0 0", fontSize:"0.5rem", color:"var(--tertiary)" }}>
                {Math.floor(meetingTime/60)}:{String(Math.floor(meetingTime%60)).padStart(2,"0")} / 52:31
              </p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleMeeting("/meetings/meeting-2026-03-07.mp3") }}
              style={{ width:40, height:40, borderRadius:99, border:"none", cursor:"pointer", background:"#7C3AED", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14, position:"relative", zIndex:20 }}>
              {meetingPlaying ? "⏸" : "▶"}
            </button>
          </div>
          {/* Seekable progress bar */}
          <div
            style={{ height:6, background:"rgba(124,58,237,0.15)", borderRadius:99, cursor:"pointer", position:"relative" }}
            onClick={(e) => {
              if (!meetingAudio) return
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              meetingAudio.currentTime = pct * (meetingAudio.duration || 0)
            }}>
            <div style={{ height:"100%", width:`${meetingProgress*100}%`, background:"#7C3AED", borderRadius:99, transition:"width 0.1s", pointerEvents:"none" }} />
          </div>
        </div>
      </div>
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* 🎙️ Meetings */}
      <div>
        <p style={{ fontSize:"0.625rem", fontWeight:800, color:"var(--secondary)", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>🎙️ Meeting Recordings</p>
        {MEETINGS.map((m, i) => (
          <div key={i} style={{ background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.18)", borderRadius:12, padding:"10px 12px", marginBottom:8 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <div>
                <p style={{ margin:0, fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)" }}>{m.label}</p>
                <p style={{ margin:"2px 0 0", fontSize:"0.5625rem", color:"var(--tertiary)" }}>{m.duration} min</p>
              </div>
              <button onClick={() => toggleMeeting(m.audio)} style={{
                width:32, height:32, borderRadius:99, border:"none", cursor:"pointer",
                background:"#7C3AED", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
              }}>
                {meetingPlaying ? <span style={{fontSize:10}}>⏸</span> : <span style={{fontSize:10}}>▶</span>}
              </button>
            </div>
            {/* Progress bar */}
            <div style={{ height:3, background:"rgba(124,58,237,0.15)", borderRadius:99, marginBottom:8, cursor:"pointer" }}
              onClick={(e) => {
                if (!meetingAudio) return
                const rect = (e.target as HTMLDivElement).getBoundingClientRect()
                const pct = (e.clientX - rect.left) / rect.width
                meetingAudio.currentTime = pct * meetingAudio.duration
              }}>
              <div style={{ height:"100%", width:`${meetingProgress*100}%`, background:"#7C3AED", borderRadius:99, transition:"width 0.1s" }} />
            </div>
            <div style={{ fontSize:"0.5rem", color:"var(--tertiary)", marginBottom:8 }}>
              {Math.floor(meetingTime/60)}:{String(Math.floor(meetingTime%60)).padStart(2,"0")} / {m.duration}
            </div>
            {/* Summary points */}
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {m.summary.map((s, j) => (
                <div key={j} style={{ display:"flex", gap:5, alignItems:"flex-start" }}>
                  <span style={{ fontSize:"0.5rem", marginTop:2 }}>•</span>
                  <p style={{ margin:0, fontSize:"0.5625rem", color:"var(--secondary)", lineHeight:1.5 }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Author + action buttons */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {mode === "none" && (
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => setMode("text")}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", borderRadius:12,
                border:"1.5px dashed rgba(0,0,0,0.12)", background:"none", cursor:"pointer", flex:1, color:"var(--tertiary)", fontSize:"0.875rem", fontWeight:600 }}>
              <Plus style={{ width:14, height:14 }} /> Add Note
            </button>
            <button onClick={() => setMode("voice")}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px",
                borderRadius:12, border:"1.5px dashed rgba(239,68,68,0.4)", background:"rgba(239,68,68,0.05)",
                cursor:"pointer", color:"#EF4444", fontSize:"0.875rem", fontWeight:700, whiteSpace:"nowrap" }}>
              <Mic style={{ width:14, height:14 }} /> 🎙 Voice Note
            </button>
          </div>
        )}

        {mode === "text" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Write a note for the team…" rows={4} autoFocus
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid var(--separator)", outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"var(--input-bg)", color:"var(--foreground)", resize:"none", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#F5A623"} onBlur={e => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 9px", borderRadius:8, border:"none", cursor:"pointer",
                      background: color === c ? COLOR_CONFIG[c].accent : "rgba(0,0,0,0.05)",
                      color: color === c ? "#fff" : "#1D1D1F",
                      fontSize:"0.6875rem", fontWeight:700 }}>
                    {COLOR_CONFIG[c].emoji} <span style={{ fontSize:"0.625rem" }}>{COLOR_CONFIG[c].label.split(" ")[1]}</span>
                  </button>
                ))}
              </div>
              <button onClick={addTextNote} disabled={!text.trim()}
                style={{ flex:1, padding:"8px 0", borderRadius:9, border:"none", cursor: !text.trim() ? "not-allowed":"pointer", background: !text.trim() ? "#E5E5EA":"#F5A623", color: !text.trim() ? "#A1A1AA":"#000", fontSize:"0.875rem", fontWeight:700 }}>
                Post
              </button>
              <button onClick={() => { setMode("none"); setText("") }}
                style={{ padding:"8px 14px", borderRadius:9, border:"1.5px solid var(--separator)", background:"none", cursor:"pointer", fontSize:"0.875rem", color:"var(--tertiary)" }}>Cancel</button>
            </div>
          </div>
        )}

        {mode === "voice" && (
          <VoiceRecorder author={author} onSave={addVoiceNote} onCancel={() => setMode("none")} />
        )}
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <>
          <p style={{ fontSize:"0.625rem", fontWeight:700, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em" }}>📌 Pinned</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {pinned.map(n => <NoteCard key={n.id} n={n} onPin={togglePin} onDelete={deleteNote} />)}
          </div>
        </>
      )}

      {/* All notes */}
      {unpinned.length > 0 && (
        <>
          {pinned.length > 0 && <p style={{ fontSize:"0.625rem", fontWeight:700, color:"var(--tertiary)", textTransform:"uppercase", letterSpacing:"0.07em" }}>All Notes</p>}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {unpinned.map(n => <NoteCard key={n.id} n={n} onPin={togglePin} onDelete={deleteNote} />)}
          </div>
        </>
      )}

      {notes.length === 0 && (
        <p style={{ textAlign:"center", color:"var(--secondary)", fontSize:"0.875rem", padding:"24px 0" }}>
          No notes yet. Write something or send a voice note.
        </p>
      )}
    </div>
  )

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:9999,
          background:"#1D1D1F", color:"#fff",
          borderRadius:14, padding:"12px 18px",
          display:"flex", alignItems:"center", gap:10,
          boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
          animation:"slideInRight 0.3s ease",
          maxWidth:280,
        }}>
          <style>{`@keyframes slideInRight { from { transform: translateX(120%); opacity:0; } to { transform: translateX(0); opacity:1; } }`}</style>
          <span style={{ fontSize:"1.25rem" }}>{toast.kind === "voice" ? "🎙" : "📝"}</span>
          <div>
            <p style={{ fontSize:"0.875rem", fontWeight:700, margin:0 }}>
              {toast.author} {toast.kind === "voice" ? "sent a voice message" : "added a note"}
            </p>
            {toast.duration && (
              <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.6)", margin:0 }}>
                {fmtDuration(toast.duration)}
              </p>
            )}
          </div>
          <button onClick={() => setToast(null)}
            style={{ marginLeft:"auto", background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"1rem", padding:0, lineHeight:1 }}>✕</button>
        </div>
      )}
    <DashboardCard compact
      title="Team Notes"
      noAutoOpen
      subtitle="Notes · Voice Messages"
      icon={<StickyNote style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
    </>
  )
}
