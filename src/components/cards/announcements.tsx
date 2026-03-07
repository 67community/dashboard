"use client"

import { useState, useEffect } from "react"
import { Megaphone, Plus, Copy, Check, Trash2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { aiHeaders } from "@/lib/ai-settings"

type AnnChannel  = "discord" | "telegram" | "x" | "all"
type AnnStatus   = "posted"
type AnnType     = "general" | "raid"

interface Announcement {
  id:        string
  title:     string
  body:      string
  channel:   AnnChannel
  type:      AnnType
  status:    AnnStatus
  createdAt: string
  postedAt?: string
}

const CH_CONFIG: Record<AnnChannel, { emoji: string; label: string; color: string }> = {
  discord:  { emoji: "💬", label: "Discord",  color: "#5865F2" },
  telegram: { emoji: "💬",  label: "Telegram", color: "#2AABEE" },
  x:        { emoji: "𝕏",  label: "X/Twitter",color: "#0A0A0A" },
  all:      { emoji: "📣",  label: "All",      color: "#F5A623" },
}


// Send targets
type SendTarget = "telegram_main" | "telegram_raid" | "discord"
const SEND_TARGETS: Record<SendTarget, { label: string; color: string }> = {
  telegram_main: { label: "TG Main",  color: "#2AABEE" },
  telegram_raid: { label: "TG Raid",  color: "#EF4444" },
  discord:       { label: "Discord",  color: "#5865F2" },
}

const TYPE_CONFIG: Record<AnnType, { label: string; color: string }> = {
  raid:    { label: "Raid",    color: "#EF4444"         },
  general: { label: "General", color: "var(--tertiary)" },
}

const STATUS_CONFIG: Record<AnnStatus, { label: string; color: string; bg: string }> = {
  posted: { label: "Sent", color: "#059669", bg: "rgba(5,150,105,0.08)" },
}

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text).catch(()=>{}); setDone(true); setTimeout(()=>setDone(false),1500) }}
      style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 12px",
        borderRadius:8, border:"1.5px solid var(--separator)", background:"none",
        cursor:"pointer", fontSize:"0.75rem", fontWeight:700,
        color: done ? "#059669" : "#374151", transition:"color 0.2s" }}>
      {done ? <Check style={{ width:13, height:13 }} /> : <Copy style={{ width:13, height:13 }} />}
      {done ? "Copied!" : label}
    </button>
  )
}

function AnnRow({ a, onDelete, onSend, sending, sendRes }: {
  a: Announcement; onDelete:(id:string)=>void
  onSend:(a:Announcement, targets:SendTarget[])=>void; sending:boolean; sendRes:string
}) {
  const [selected, setSelected] = useState<Set<SendTarget>>(new Set(["telegram_main"]))
  const toggle = (t: SendTarget) => setSelected(prev => {
    const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n
  })
  const cc = CH_CONFIG[a.channel]
  const sc = STATUS_CONFIG["posted"]
  return (
    <div className="inset-cell" style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
        <span style={{ fontSize:"1rem", flexShrink:0 }}>{cc.emoji}</span>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--foreground)" }}>{a.title}</p>
          <div style={{ display:"flex", gap:6, marginTop:2, flexWrap:"wrap" }}>
            <span style={{ fontSize:"0.625rem", fontWeight:700, color: TYPE_CONFIG[a.type].color }}>
              {TYPE_CONFIG[a.type].label}
            </span>
            <span style={{ fontSize:"0.625rem", color:"var(--secondary)" }}>·</span>
            <span style={{ fontSize:"0.625rem", fontWeight:600, color: cc.color }}>{cc.label}</span>
          </div>
        </div>
        <span style={{ fontSize:"0.625rem", fontWeight:700, color: sc.color,
          background: sc.bg, padding:"2px 8px", borderRadius:99, flexShrink:0 }}>{sc.label}</span>
      </div>

      <p style={{ fontSize:"0.8125rem", color:"var(--foreground)", lineHeight:1.55,
        paddingLeft:28, whiteSpace:"pre-wrap" }}>{a.body}</p>

      <div style={{ display:"flex", gap:6, paddingLeft:28, alignItems:"center" }}>
        <CopyBtn text={a.body} label="Copy Text" />
        <button onClick={e=>{e.stopPropagation();onDelete(a.id)}}
          style={{background:"none",border:"none",cursor:"pointer",color:"var(--secondary)",display:"flex",alignItems:"center",marginLeft:"auto"}}>
          <Trash2 style={{width:14,height:14}}/>
        </button>
      </div>
    </div>
  )
}

export function AnnouncementsCard() {
  const [anns,    setAnns]    = useState<Announcement[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [title,   setTitle]   = useState("")
  const [body,    setBody]    = useState("")
  const [channel, setChannel] = useState<AnnChannel>("telegram")
  const [type,    setType]    = useState<AnnType>("raid")
  const [filter,      setFilter]      = useState<AnnStatus | "all">("all")
  const [selectedBot,      setSelectedBot]      = useState<"announce"|"raid">("announce")
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(["tg_main"]))
  const [formSending, setFormSending] = useState(false)
  const [formRes,     setFormRes]     = useState("")
  const [genning, setGenning] = useState(false)
  const [sending, setSending] = useState<Record<string, boolean>>({})
  const [sendRes, setSendRes] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const s = localStorage.getItem("67_announcements")
      if (s) setAnns(JSON.parse(s))
    } catch {}
  }, [])

  function save(as: Announcement[]) {
    setAnns(as)
    localStorage.setItem("67_announcements", JSON.stringify(as))
  }

  async function add() {
    if (!body.trim() || formSending) return
    const ann: Announcement = { id: Date.now().toString(), title: body.trim().slice(0,60),
      body: body.trim(), channel, type, status: "posted",
      createdAt: new Date().toISOString(), postedAt: new Date().toISOString() }
    save([ann, ...anns])

    const autoTargets = [...selectedChannels]
    setFormSending(true); setFormRes("")
    try {
      const res = await fetch("/api/send-announcement", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ body: selectedBot === "raid" ? `Raid ${ann.body}` : ann.body, bot: selectedBot, channels: autoTargets }),
      })
      const data = await res.json()
      const msgs = Object.values(data.results ?? {}) as string[]
      setFormRes(msgs.join(" | ") || "✅ Gönderildi")
    } catch { setFormRes("❌ Bağlantı hatası") }
    setFormSending(false)
    setTitle(""); setBody("")
    setTimeout(() => { setAddOpen(false); setFormRes("") }, 1500)
  }

  async function aiDraft() {
    if (!title.trim() || genning) return
    setGenning(true)
    try {
      const res = await fetch("/api/announcement-draft", {
        method:"POST", headers:{"Content-Type":"application/json", ...aiHeaders()},
        body: JSON.stringify({ title, type, channel }),
      })
      const data = await res.json()
      if (data.body) setBody(data.body)
    } catch {}
    setGenning(false)
  }


  async function sendAnn(a: Announcement, targets: SendTarget[]) {
    if (targets.includes("discord")) {
      setSendRes(r => ({...r, [a.id]: "❌ Discord not active yet"})); return
    }
    setSending(s => ({...s, [a.id]: true}))
    setSendRes(r => ({...r, [a.id]: ""}))
    try {
      const res = await fetch("/api/send-announcement", {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ body: a.type === "raid" ? `Raid ${a.body}` : a.body, targets, type: a.type }),
      })
      const data = await res.json()
      const msgs = Object.values(data.results ?? {}) as string[]
      setSendRes(r => ({...r, [a.id]: msgs.join(" | ") || "✅ Sent!"}))
    } catch { setSendRes(r => ({...r, [a.id]: "❌ Connection error"})) }
    setSending(s => ({...s, [a.id]: false}))
  }

  function updateStatus(id: string, status: AnnStatus) {
    save(anns.map(a => a.id === id ? { ...a, status, postedAt: status === "posted" ? new Date().toISOString() : a.postedAt } : a))
  }
  function deleteAnn(id: string) { save(anns.filter(a => a.id !== id)) }

  const pending  = anns.length
  const filtered = anns

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div className="inset-cell" style={{ textAlign:"center" }}>
        <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#059669", lineHeight:1 }}>{anns.length}</p>
        <p style={{ fontSize:"0.625rem", color:"var(--tertiary)", fontWeight:600,
          textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Sent</p>
      </div>

      <div onClick={e => e.stopPropagation()}>
        {!addOpen ? (
          <button onClick={() => setAddOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
              borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
              cursor:"pointer", width:"100%", color:"var(--tertiary)", fontSize:"0.875rem", fontWeight:600 }}>
            <Plus style={{ width:14, height:14 }} /> Write announcement
          </button>
        ) : (
            <div style={{ background:"var(--fill-primary)", borderRadius:12, padding:12,
              display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ position:"relative" }}>
                <textarea value={body} onChange={e => setBody(e.target.value)}
                  placeholder="Write your announcement…" rows={4}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid var(--separator)",
                    outline:"none", fontSize:"0.875rem", fontFamily:"inherit",
                    background:"var(--input-bg)", resize:"none", color:"var(--foreground)", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor="#F5A623"}
                  onBlur={e  => e.target.style.borderColor="var(--separator)"} />
                {body && (
                  <button onClick={() => setBody("")}
                    style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.08)",
                      border:"none", borderRadius:"50%", width:20, height:20, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.7rem", color:"var(--secondary)" }}>✕</button>
                )}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ display:"flex", gap:6 }}>
                  {([["announce","Announce","#2AABEE"],["raid","Raid","#EF4444"]] as const).map(([v,label,color]) => (
                    <button key={v} onClick={()=>setSelectedBot(v)}
                      style={{ flex:1, padding:"6px 0", borderRadius:8, fontSize:"0.75rem", fontWeight:700,
                        border:`1.5px solid ${selectedBot===v ? color : "var(--separator)"}`,
                        background: selectedBot===v ? `${color}18` : "transparent",
                        color: selectedBot===v ? color : "var(--secondary)", cursor:"pointer" }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {([["tg_main","TG Main","#2AABEE"],["tg_raid","TG Raid","#EF4444"]] as const).map(([v,label,color]) => (
                    <button key={v} onClick={()=>setSelectedChannels(prev=>{const n=new Set(prev);n.has(v)?n.delete(v):n.add(v);return n})}
                      style={{ flex:1, padding:"6px 0", borderRadius:8, fontSize:"0.75rem", fontWeight:700,
                        border:`1.5px solid ${selectedChannels.has(v) ? color : "var(--separator)"}`,
                        background: selectedChannels.has(v) ? `${color}18` : "transparent",
                        color: selectedChannels.has(v) ? color : "var(--secondary)", cursor:"pointer" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {formRes && <p style={{ fontSize:"0.75rem", fontWeight:600,
                color: formRes.startsWith("✅") ? "#059669" : "#EF4444" }}>{formRes}</p>}
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={add} disabled={!body.trim() || formSending}
                  style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                    cursor: (!body.trim()||formSending) ? "not-allowed" : "pointer",
                    background: (!body.trim()||formSending) ? "#E5E5EA" : "#F5A623",
                    color: (!body.trim()||formSending) ? "#A1A1AA" : "#000",
                    fontSize:"0.8125rem", fontWeight:700 }}>
                  {formSending ? "Gönderiliyor…" : "Send"}
                </button>
                <button onClick={() => setAddOpen(false)}
                  style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid var(--separator)",
                    background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"var(--tertiary)" }}>Cancel</button>
              </div>
            </div>
        )}
      </div>

      {anns.filter(a=>a.status!=="posted").slice(0,2).map(a => (
        <div key={a.id} onClick={e => e.stopPropagation()}>
          <AnnRow a={a} onDelete={deleteAnn} onSend={sendAnn} sending={!!sending[a.id]} sendRes={sendRes[a.id]??""} />
        </div>
      ))}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:4 }}>
        {([["all","All","#F5A623"], ["posted","Sent","#059669"]] as const).map(([f, label, color]) => {
          const cnt = f==="all" ? anns.length : anns.filter(a=>a.status===f).length
          const active = filter===f
          return (
            <button key={f} onClick={()=>setFilter(f as "all"|"posted")}
              style={{ flex:1, padding:"7px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: active ? `${color}18` : "#F4F4F5",
                outline: active ? `1.5px solid ${color}` : "none",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:"0.875rem", fontWeight:800, color: active ? color : "#1D1D1F" }}>{cnt}</span>
              <span style={{ fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.05em", color: active ? color : "#A1A1AA" }}>{label}</span>
            </button>
          )
        })}
      </div>

      <button onClick={() => setAddOpen(v => !v)}
        style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
          borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
          cursor:"pointer", width:"100%", color:"var(--tertiary)", fontSize:"0.875rem", fontWeight:600 }}>
        <Plus style={{ width:14, height:14 }} /> Write announcement
      </button>

      {addOpen && (
        <div style={{ background:"var(--fill-primary)", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ position:"relative" }}>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Write your announcement…" rows={4}
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid var(--separator)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit",
                background:"var(--input-bg)", resize:"none", color:"var(--foreground)", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="var(--separator)"} />
            {body && (
              <button onClick={() => setBody("")}
                style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.08)",
                  border:"none", borderRadius:"50%", width:20, height:20, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.7rem", color:"var(--secondary)" }}>✕</button>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ display:"flex", gap:6 }}>
              {([["announce","Announce","#2AABEE"],["raid","Raid","#EF4444"]] as const).map(([v,label,color]) => (
                <button key={v} onClick={()=>setSelectedBot(v)}
                  style={{ flex:1, padding:"6px 0", borderRadius:8, fontSize:"0.75rem", fontWeight:700,
                    border:`1.5px solid ${selectedBot===v ? color : "var(--separator)"}`,
                    background: selectedBot===v ? `${color}18` : "transparent",
                    color: selectedBot===v ? color : "var(--secondary)", cursor:"pointer" }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {([["tg_main","TG Main","#2AABEE"],["tg_raid","TG Raid","#EF4444"]] as const).map(([v,label,color]) => (
                <button key={v} onClick={()=>setSelectedChannels(prev=>{const n=new Set(prev);n.has(v)?n.delete(v):n.add(v);return n})}
                  style={{ flex:1, padding:"6px 0", borderRadius:8, fontSize:"0.75rem", fontWeight:700,
                    border:`1.5px solid ${selectedChannels.has(v) ? color : "var(--separator)"}`,
                    background: selectedChannels.has(v) ? `${color}18` : "transparent",
                    color: selectedChannels.has(v) ? color : "var(--secondary)", cursor:"pointer" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {formRes && <p style={{ fontSize:"0.75rem", fontWeight:600,
            color: formRes.startsWith("✅") ? "#059669" : "#EF4444" }}>{formRes}</p>}
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={add} disabled={!body.trim() || formSending}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                cursor: (!body.trim()||formSending) ? "not-allowed" : "pointer",
                background: (!body.trim()||formSending) ? "#E5E5EA" : "#F5A623",
                color: (!body.trim()||formSending) ? "#A1A1AA" : "#000",
                fontSize:"0.8125rem", fontWeight:700 }}>
              {formSending ? "Gönderiliyor…" : "Send"}
            </button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid var(--separator)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"var(--tertiary)" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0
          ? <p style={{ textAlign:"center", color:"var(--secondary)", fontSize:"0.875rem", padding:"20px 0" }}>No announcements yet.</p>
          : filtered.map(a => <AnnRow key={a.id} a={a} onDelete={deleteAnn} onSend={sendAnn} sending={!!sending[a.id]} sendRes={sendRes[a.id]??""} />)}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Announce Share"
      subtitle="Announce Raid"
      icon={<Megaphone style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
