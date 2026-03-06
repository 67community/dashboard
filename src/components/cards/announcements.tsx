"use client"

import { useState, useEffect } from "react"
import { Megaphone, Plus, Copy, Check, Trash2, Wand2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { aiHeaders } from "@/lib/ai-settings"

type AnnChannel  = "discord" | "telegram" | "x" | "all"
type AnnStatus   = "draft" | "approved" | "posted"
type AnnType     = "general" | "price" | "raid" | "event" | "listing" | "milestone"

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
  telegram: { emoji: "✈️",  label: "Telegram", color: "#2AABEE" },
  x:        { emoji: "𝕏",  label: "X/Twitter",color: "#0A0A0A" },
  all:      { emoji: "📣",  label: "All",      color: "#F5A623" },
}


// Send targets
type SendTarget = "discord" | "telegram" | "raid"
const SEND_TARGETS: Record<SendTarget, { emoji: string; label: string }> = {
  discord:  { emoji: "", label: "Discord"  },
  telegram: { emoji: "", label: "Telegram" },
  raid:     { emoji: "", label: "Raid"     },
}

const TYPE_CONFIG: Record<AnnType, { label: string; color: string }> = {
  general:   { label: "General",   color: "var(--tertiary)" },
  price:     { label: "Price 📈",  color: "#059669" },
  raid:      { label: "Raid ⚔️",   color: "#EF4444" },
  event:     { label: "Event 📅",  color: "#7C3AED" },
  listing:   { label: "Listing 🏦",color: "#D97706" },
  milestone: { label: "Milestone 🏆",color:"#F5A623" },
}

const STATUS_CONFIG: Record<AnnStatus, { label: string; color: string; bg: string }> = {
  draft:    { label: "Draft",     color: "var(--tertiary)", bg: "#F4F4F5"                },
  approved: { label: "Approved ✓",color: "#2563EB", bg: "rgba(37,99,235,0.08)"  },
  posted:   { label: "Posted ✅", color: "#059669", bg: "rgba(5,150,105,0.08)"  },
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

function AnnRow({ a, onStatus, onDelete, onSend, sending, sendRes, sendTarget, onTargetChange }: {
  a: Announcement; onStatus:(id:string,s:AnnStatus)=>void; onDelete:(id:string)=>void
  onSend:(a:Announcement)=>void; sending:boolean; sendRes:string
  sendTarget:SendTarget; onTargetChange:(t:SendTarget)=>void
}) {
  const cc = CH_CONFIG[a.channel]
  const sc = STATUS_CONFIG[a.status]
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

      <div style={{ display:"flex", gap:6, paddingLeft:28, flexWrap:"wrap" }}>
        <CopyBtn text={a.body} label="Copy Text" />
        {a.status === "draft" && (
          <button onClick={e => { e.stopPropagation(); onStatus(a.id, "approved") }}
            style={{ padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer",
              background:"#2563EB", color:"#fff", fontSize:"0.75rem", fontWeight:700 }}>
            Approve ✓
          </button>
        )}
        {a.status === "approved" && (
          <button onClick={e => { e.stopPropagation(); onStatus(a.id, "posted") }}
            style={{ padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer",
              background:"#059669", color:"#fff", fontSize:"0.75rem", fontWeight:700 }}>
            Mark Posted ✅
          </button>
        )}
        {/* Send */}
        <div style={{ display:"flex", gap:6, alignItems:"center", marginLeft:"auto" }}>
          <select value={sendTarget} onChange={e=>{e.stopPropagation();onTargetChange(e.target.value as SendTarget)}}
            style={{padding:"4px 8px",borderRadius:8,border:"1.5px solid var(--separator)",
              fontSize:"0.75rem",fontFamily:"inherit",background:"var(--input-bg)",cursor:"pointer"}}>
            {Object.entries(SEND_TARGETS).map(([k,v])=>(
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={e=>{e.stopPropagation();onSend(a)}} disabled={sending}
            style={{padding:"5px 12px",borderRadius:8,border:"none",cursor:sending?"wait":"pointer",
              background:sending?"#9CA3AF":"#F5A623",color:sending?"#fff":"#000",fontSize:"0.75rem",fontWeight:700}}>
            {sending?"Gönderiliyor…":"Gönder →"}
          </button>
          <button onClick={e=>{e.stopPropagation();onDelete(a.id)}}
            style={{background:"none",border:"none",cursor:"pointer",color:"var(--secondary)",display:"flex",alignItems:"center"}}>
            <Trash2 style={{width:14,height:14}}/>
          </button>
        </div>
      </div>
      {sendRes&&<p style={{fontSize:"0.75rem",fontWeight:600,color:sendRes.startsWith("✅")?"#059669":"#EF4444",paddingLeft:28}}>{sendRes}</p>}
    </div>
  )
}

export function AnnouncementsCard() {
  const [anns,    setAnns]    = useState<Announcement[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [title,   setTitle]   = useState("")
  const [body,    setBody]    = useState("")
  const [channel, setChannel] = useState<AnnChannel>("discord")
  const [type,    setType]    = useState<AnnType>("general")
  const [filter,  setFilter]  = useState<AnnStatus | "all">("all")
  const [genning, setGenning] = useState(false)
  const [sending, setSending] = useState<Record<string, boolean>>({})
  const [sendRes, setSendRes] = useState<Record<string, string>>({})
  const [sendTarget, setSendTarget] = useState<SendTarget>("telegram")

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

  function add() {
    if (!title.trim() || !body.trim()) return
    save([{ id: Date.now().toString(), title: title.trim(), body: body.trim(),
      channel, type, status: "draft", createdAt: new Date().toISOString() }, ...anns])
    setTitle(""); setBody(""); setAddOpen(false)
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


  async function sendAnn(a: Announcement) {
    if (sendTarget === "discord") { setSendRes(r => ({...r, [a.id]: "❌ Discord henüz aktif değil"})); return }
    setSending(s => ({...s, [a.id]: true}))
    setSendRes(r => ({...r, [a.id]: ""}))
    try {
      const res = await fetch("/api/send-announcement", {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ channel: sendTarget, body: a.body }),
      })
      const data = await res.json()
      if (data.ok) { setSendRes(r => ({...r, [a.id]: "✅ Gönderildi!"})); updateStatus(a.id, "posted") }
      else setSendRes(r => ({...r, [a.id]: "❌ " + (data.error ?? "Hata")}))
    } catch { setSendRes(r => ({...r, [a.id]: "❌ Bağlantı hatası"})) }
    setSending(s => ({...s, [a.id]: false}))
  }

  function updateStatus(id: string, status: AnnStatus) {
    save(anns.map(a => a.id === id ? { ...a, status, postedAt: status === "posted" ? new Date().toISOString() : a.postedAt } : a))
  }
  function deleteAnn(id: string) { save(anns.filter(a => a.id !== id)) }

  const pending  = anns.filter(a => a.status !== "posted").length
  const filtered = filter === "all" ? anns : anns.filter(a => a.status === filter)

  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:8 }}>
        {[
          { n: anns.filter(a=>a.status==="draft").length,    l:"Draft",    c:"#8E8E93" },
          { n: anns.filter(a=>a.status==="approved").length, l:"Approved", c:"#2563EB" },
          { n: anns.filter(a=>a.status==="posted").length,   l:"Posted",   c:"#059669" },
        ].map(({ n,l,c }) => (
          <div key={l} className="inset-cell" style={{ flex:1, textAlign:"center" }}>
            <p style={{ fontSize:"1.5rem", fontWeight:800, color:c, lineHeight:1 }}>{n}</p>
            <p style={{ fontSize:"0.625rem", color:"var(--tertiary)", fontWeight:600,
              textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>{l}</p>
          </div>
        ))}
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
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title"
              style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
                outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"var(--input-bg)" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="var(--separator)"} />
            <div style={{ display:"flex", gap:6 }}>
              <select value={type} onChange={e => setType(e.target.value as AnnType)}
                style={{ flex:1, padding:"7px 8px", borderRadius:8, border:"1.5px solid var(--separator)",
                  outline:"none", fontSize:"0.8125rem", fontFamily:"inherit", background:"var(--input-bg)" }}>
                {Object.entries(TYPE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={channel} onChange={e => setChannel(e.target.value as AnnChannel)}
                style={{ flex:1, padding:"7px 8px", borderRadius:8, border:"1.5px solid var(--separator)",
                  outline:"none", fontSize:"0.8125rem", fontFamily:"inherit", background:"var(--input-bg)" }}>
                {Object.entries(CH_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{ position:"relative" }}>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                placeholder="Announcement body…" rows={4}
                style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
                  outline:"none", fontSize:"0.875rem", fontFamily:"inherit",
                  background:"var(--input-bg)", resize:"none", boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor="#F5A623"}
                onBlur={e  => e.target.style.borderColor="var(--separator)"} />
              <button onClick={aiDraft} disabled={!title.trim() || genning}
                style={{ position:"absolute", bottom:8, right:8,
                  display:"flex", alignItems:"center", gap:4, padding:"4px 10px",
                  borderRadius:7, border:"none", cursor: !title.trim() ? "not-allowed" : "pointer",
                  background: !title.trim() ? "#E5E5EA" : "#F5A623",
                  color: !title.trim() ? "#A1A1AA" : "#000",
                  fontSize:"0.6875rem", fontWeight:700 }}>
                <Wand2 style={{ width:11, height:11 }} />
                {genning ? "Writing…" : "AI Draft"}
              </button>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={add} disabled={!title.trim() || !body.trim()}
                style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                  cursor: !title.trim() || !body.trim() ? "not-allowed" : "pointer",
                  background: !title.trim() || !body.trim() ? "#E5E5EA" : "#F5A623",
                  color: !title.trim() || !body.trim() ? "#A1A1AA" : "#000",
                  fontSize:"0.8125rem", fontWeight:700 }}>Save as Draft 📢</button>
              <button onClick={() => setAddOpen(false)}
                style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid var(--separator)",
                  background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"var(--tertiary)" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {anns.filter(a=>a.status!=="posted").slice(0,2).map(a => (
        <div key={a.id} onClick={e => e.stopPropagation()}>
          <AnnRow a={a} onStatus={updateStatus} onDelete={deleteAnn} onSend={sendAnn} sending={!!sending[a.id]} sendRes={sendRes[a.id]??""} sendTarget={sendTarget} onTargetChange={setSendTarget} />
        </div>
      ))}
    </div>
  )

  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:4 }}>
        {(["all","draft","approved","posted"] as const).map(f => {
          const cnt = f==="all" ? anns.length : anns.filter(a=>a.status===f).length
          const cfg = f==="all" ? null : STATUS_CONFIG[f]
          const active = filter===f
          return (
            <button key={f} onClick={()=>setFilter(f)}
              style={{ flex:1, padding:"7px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: active ? (cfg?.bg ?? "#F5A62322") : "#F4F4F5",
                outline: active ? `1.5px solid ${cfg?.color ?? "#F5A623"}` : "none",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:"0.875rem", fontWeight:800,
                color: active ? (cfg?.color ?? "#F5A623") : "#1D1D1F" }}>{cnt}</span>
              <span style={{ fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.05em", color: active ? (cfg?.color ?? "#F5A623") : "#A1A1AA" }}>
                {f==="all"?"All":f}
              </span>
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
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
            style={{ padding:"8px 10px", borderRadius:8, border:"1.5px solid var(--separator)",
              outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"var(--input-bg)" }}
            onFocus={e => e.target.style.borderColor="#F5A623"}
            onBlur={e  => e.target.style.borderColor="var(--separator)"} />
          <div style={{ display:"flex", gap:6 }}>
            <select value={type} onChange={e => setType(e.target.value as AnnType)}
              style={{ flex:1, padding:"7px 8px", borderRadius:8, border:"1.5px solid var(--separator)",
                outline:"none", fontSize:"0.8125rem", fontFamily:"inherit", background:"var(--input-bg)" }}>
              {Object.entries(TYPE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={channel} onChange={e => setChannel(e.target.value as AnnChannel)}
              style={{ flex:1, padding:"7px 8px", borderRadius:8, border:"1.5px solid var(--separator)",
                outline:"none", fontSize:"0.8125rem", fontFamily:"inherit", background:"var(--input-bg)" }}>
              {Object.entries(CH_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div style={{ position:"relative" }}>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Write or AI draft below…" rows={5}
              style={{ width:"100%", padding:"8px 10px", paddingBottom:40, borderRadius:8,
                border:"1.5px solid var(--separator)", outline:"none",
                fontSize:"0.875rem", fontFamily:"inherit", background:"var(--input-bg)",
                resize:"none", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#F5A623"}
              onBlur={e  => e.target.style.borderColor="var(--separator)"} />
            <button onClick={aiDraft} disabled={!title.trim() || genning}
              style={{ position:"absolute", bottom:8, right:8,
                display:"flex", alignItems:"center", gap:4, padding:"5px 12px",
                borderRadius:7, border:"none", cursor: !title.trim() ? "not-allowed" : "pointer",
                background: !title.trim() ? "#E5E5EA" : "#F5A623",
                color: !title.trim() ? "#A1A1AA" : "#000",
                fontSize:"0.75rem", fontWeight:700 }}>
              <Wand2 style={{ width:12, height:12 }} />
              {genning ? "Writing…" : "AI Draft"}
            </button>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={add} disabled={!title.trim()||!body.trim()}
              style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
                cursor: !title.trim()||!body.trim() ? "not-allowed" : "pointer",
                background: !title.trim()||!body.trim() ? "#E5E5EA" : "#F5A623",
                color: !title.trim()||!body.trim() ? "#A1A1AA" : "#000",
                fontSize:"0.8125rem", fontWeight:700 }}>Save Draft 📢</button>
            <button onClick={() => setAddOpen(false)}
              style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid var(--separator)",
                background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"var(--tertiary)" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0
          ? <p style={{ textAlign:"center", color:"var(--secondary)", fontSize:"0.875rem", padding:"20px 0" }}>No announcements yet.</p>
          : filtered.map(a => <AnnRow key={a.id} a={a} onStatus={updateStatus} onDelete={deleteAnn} />)}
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Announce"
      subtitle="Draft · Approve · Post"
      icon={<Megaphone style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
