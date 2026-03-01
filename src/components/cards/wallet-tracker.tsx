"use client"

import { useState, useEffect, useCallback } from "react"
import { Wallet, Plus, RefreshCw, ExternalLink, Trash2, Bell, BellOff, ChevronDown, ChevronUp, AlertTriangle, Download, Loader2 } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrackedWallet {
  address:        string
  label:          string
  alertThreshold: number  // $67 tokens — alert if balance >= this
  addedAt:        string
  muted:          boolean
}

interface WalletTrade {
  sig:       string
  type:      "buy" | "sell"
  amount67:  number
  blockTime: number
}

interface WalletData {
  address:      string
  label:        string
  balance67:    number
  balanceSol:   number
  valueUsd:     number
  isWhale:      boolean
  recentAlert:  boolean
  lastActive:   string | null
  trades:       WalletTrade[]
  totalBought:  number
  totalSold:    number
  price67:      number
}

const LS_KEY = "67_tracked_wallets"

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K"
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function fmtUsd(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M"
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(1) + "K"
  return "$" + n.toFixed(2)
}

function timeAgo(iso: string | null) {
  if (!iso) return "never"
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function shortAddr(addr: string) {
  return addr.slice(0, 4) + "…" + addr.slice(-4)
}

// ── WalletRow ─────────────────────────────────────────────────────────────────

function WalletRow({
  wallet, data, expanded, onToggle, onRemove, onMute, onRename,
}: {
  wallet:   TrackedWallet
  data?:    WalletData
  expanded: boolean
  onToggle: () => void
  onRemove: () => void
  onMute:   () => void
  onRename: (label: string) => void
}) {
  const [editingLabel, setEditingLabel] = useState(false)
  const hasAlert = data?.recentAlert && !wallet.muted

  return (
    <div className="inset-cell" style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <button onClick={e => { e.stopPropagation(); onToggle() }}
        style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none",
          cursor:"pointer", width:"100%", textAlign:"left", padding:0 }}>

        {/* Alert dot */}
        {hasAlert && (
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#EF4444",
            flexShrink:0, boxShadow:"0 0 6px rgba(239,68,68,0.6)" }} />
        )}

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {editingLabel ? (
              <input
                autoFocus
                defaultValue={wallet.label}
                onClick={e => e.stopPropagation()}
                onBlur={e => { onRename(e.target.value.trim() || wallet.label); setEditingLabel(false) }}
                onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") { onRename((e.target as HTMLInputElement).value.trim() || wallet.label); setEditingLabel(false) } if (e.key === "Escape") setEditingLabel(false) }}
                style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F", border:"1.5px solid #F5A623", borderRadius:6, padding:"1px 6px", width:"100%", background:"#FFFBEB", outline:"none" }}
              />
            ) : (
              <span
                title="Click to rename"
                onClick={e => { e.stopPropagation(); setEditingLabel(true) }}
                style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  cursor:"text", borderBottom:"1px dashed transparent" }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "#D1D5DB")}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                {wallet.label}
              </span>
            )}
            {data?.isWhale && (
              <span style={{ fontSize:"0.6rem", fontWeight:700, color:"#D97706",
                background:"rgba(217,119,6,0.1)", padding:"1px 6px", borderRadius:99 }}>
                🐋 WHALE
              </span>
            )}
          </div>
          <span style={{ fontSize:"0.6875rem", color:"#8E8E93", fontFamily:"monospace" }}>
            {shortAddr(wallet.address)}
          </span>
        </div>

        {data ? (
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <p style={{ fontSize:"0.875rem", fontWeight:800,
              color: data.balance67 > 0 ? "#F5A623" : "#C7C7CC", lineHeight:1.1 }}>
              {fmt(data.balance67)} <span style={{ fontSize:"0.6rem", color:"#8E8E93", fontWeight:600 }}>$67</span>
            </p>
            <div style={{ display:"flex", gap:5, justifyContent:"flex-end", flexWrap:"wrap" }}>
              <span style={{ fontSize:"0.6rem", color:"#9945FF", fontWeight:700 }}>{data.balanceSol.toFixed(2)} SOL</span>
              <span style={{ fontSize:"0.6rem", color:"#059669", fontWeight:700 }}>{fmtUsd(data.valueUsd)}</span>
              {data.totalBought > 0 && <span style={{ fontSize:"0.6rem", color:"#059669", fontWeight:700 }}>↑{fmt(data.totalBought)}</span>}
              {data.totalSold > 0 && <span style={{ fontSize:"0.6rem", color:"#EF4444", fontWeight:700 }}>↓{fmt(data.totalSold)}</span>}
            </div>
          </div>
        ) : (
          <span style={{ fontSize:"0.75rem", color:"#C7C7CC" }}>loading…</span>
        )}

        {expanded
          ? <ChevronUp  style={{ width:13, height:13, color:"#A1A1AA", flexShrink:0 }} />
          : <ChevronDown style={{ width:13, height:13, color:"#A1A1AA", flexShrink:0 }} />}
      </button>

      {expanded && data && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(0,0,0,0.06)",
          display:"flex", flexDirection:"column", gap:10 }}>

          {/* Balances */}
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1, background:"#F9F9F9", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
              <p style={{ fontSize:"1rem", fontWeight:800, color:"#F5A623" }}>{fmt(data.balance67)}</p>
              <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.06em" }}>$67 Tokens</p>
            </div>
            <div style={{ flex:1, background:"#F9F9F9", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
              <p style={{ fontSize:"1rem", fontWeight:800, color:"#9945FF" }}>{data.balanceSol.toFixed(3)}</p>
              <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.06em" }}>SOL</p>
            </div>
            <div style={{ flex:1, background:"#F9F9F9", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
              <p style={{ fontSize:"1rem", fontWeight:800, color:"#059669" }}>{fmtUsd(data.valueUsd)}</p>
              <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.06em" }}>USD Value</p>
            </div>
          </div>

          {/* Recent alert */}
          {data.recentAlert && (
            <div style={{ background:"rgba(239,68,68,0.07)", borderRadius:8, padding:"8px 10px",
              display:"flex", alignItems:"center", gap:8, border:"1px solid rgba(239,68,68,0.15)" }}>
              <AlertTriangle style={{ width:13, height:13, color:"#EF4444", flexShrink:0 }} />
              <p style={{ fontSize:"0.8125rem", color:"#EF4444", fontWeight:600 }}>
                Activity detected in the last hour
              </p>
            </div>
          )}

          {/* Last active */}
          <p style={{ fontSize:"0.75rem", color:"#8E8E93" }}>
            Last active: <strong style={{ color:"#374151" }}>{timeAgo(data.lastActive)}</strong>
          </p>

          {/* Trade history */}
          {data.trades && data.trades.length > 0 && (
            <div>
              {/* Buy/Sell totals */}
              <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                <div style={{ flex:1, background:"rgba(5,150,105,0.07)", borderRadius:8,
                  padding:"6px 10px", textAlign:"center" }}>
                  <p style={{ fontSize:"0.625rem", color:"#059669", fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.05em" }}>Total Bought</p>
                  <p style={{ fontSize:"0.875rem", fontWeight:800, color:"#059669" }}>
                    {fmt(data.totalBought ?? 0)} $67
                  </p>
                </div>
                <div style={{ flex:1, background:"rgba(239,68,68,0.07)", borderRadius:8,
                  padding:"6px 10px", textAlign:"center" }}>
                  <p style={{ fontSize:"0.625rem", color:"#EF4444", fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.05em" }}>Total Sold</p>
                  <p style={{ fontSize:"0.875rem", fontWeight:800, color:"#EF4444" }}>
                    {fmt(data.totalSold ?? 0)} $67
                  </p>
                </div>
              </div>

              <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>
                Recent Trades
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {data.trades.slice(0, 5).map(tx => (
                  <div key={tx.sig} style={{ display:"flex", alignItems:"center", gap:8,
                    padding:"5px 8px", borderRadius:7,
                    background: tx.type === "buy" ? "rgba(5,150,105,0.05)" : "rgba(239,68,68,0.05)" }}>
                    <span style={{ fontSize:"0.75rem", flexShrink:0 }}>
                      {tx.type === "buy" ? "🟢" : "🔴"}
                    </span>
                    <span style={{ fontSize:"0.75rem", fontWeight:700, color: tx.type === "buy" ? "#059669" : "#EF4444",
                      flexShrink:0, textTransform:"uppercase" }}>{tx.type}</span>
                    <span style={{ flex:1, fontSize:"0.8125rem", fontWeight:600, color:"#1D1D1F",
                      fontVariantNumeric:"tabular-nums" }}>
                      {fmt(tx.amount67)} $67
                    </span>
                    <span style={{ fontSize:"0.6875rem", color:"#A1A1AA", flexShrink:0 }}>
                      {timeAgo(new Date(tx.blockTime * 1000).toISOString())}
                    </span>
                    <a href={`https://solscan.io/tx/${tx.sig}`} target="_blank"
                      rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      style={{ color:"#2563EB", flexShrink:0 }}>
                      <ExternalLink style={{ width:11, height:11 }} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", gap:6 }}>
            <a href={`https://solscan.io/account/${wallet.address}`} target="_blank"
              rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ flex:1, padding:"7px 0", borderRadius:8,
                border:"none", background:"#0A0A0A",
                cursor:"pointer", fontSize:"0.75rem", color:"#FFF", fontWeight:700,
                textAlign:"center", textDecoration:"none", display:"flex",
                alignItems:"center", justifyContent:"center", gap:5 }}>
              <ExternalLink style={{ width:12, height:12 }} /> Solscan
            </a>
            <button onClick={e => { e.stopPropagation(); onMute() }}
              style={{ flex:1, padding:"6px 0", borderRadius:8,
                border:"1.5px solid rgba(0,0,0,0.1)", background:"none",
                cursor:"pointer", fontSize:"0.75rem", color:"#8E8E93", fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              {wallet.muted
                ? <><Bell style={{ width:11, height:11 }} /> Unmute</>
                : <><BellOff style={{ width:11, height:11 }} /> Mute</>}
            </button>
            <button onClick={e => { e.stopPropagation(); onRemove() }}
              style={{ padding:"6px 10px", borderRadius:8, border:"none",
                background:"rgba(239,68,68,0.07)", cursor:"pointer", color:"#EF4444" }}>
              <Trash2 style={{ width:13, height:13 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Add Wallet Form ───────────────────────────────────────────────────────────

function AddWalletForm({ onAdd }: { onAdd: (w: TrackedWallet) => void }) {
  const [open,      setOpen]      = useState(false)
  const [address,   setAddress]   = useState("")
  const [label,     setLabel]     = useState("")
  const [threshold, setThreshold] = useState("1000000")
  const [error,     setError]     = useState("")

  function submit() {
    const trimmed = address.trim()
    if (trimmed.length < 32 || trimmed.length > 44) {
      setError("Invalid Solana address")
      return
    }
    if (!label.trim()) { setError("Label required"); return }
    setError("")
    onAdd({
      address:        trimmed,
      label:          label.trim(),
      alertThreshold: parseInt(threshold) || 1_000_000,
      addedAt:        new Date().toISOString(),
      muted:          false,
    })
    setAddress(""); setLabel(""); setThreshold("1000000"); setOpen(false)
  }

  const inputStyle = {
    padding:"8px 10px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
    outline:"none", fontSize:"0.875rem", fontFamily:"inherit", background:"#FFF",
  }

  if (!open) return (
    <button onClick={e => { e.stopPropagation(); setOpen(true) }}
      style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
        borderRadius:10, border:"1.5px dashed rgba(0,0,0,0.12)", background:"none",
        cursor:"pointer", width:"100%", color:"#8E8E93", fontSize:"0.875rem", fontWeight:600 }}>
      <Plus style={{ width:14, height:14 }} /> Track wallet
    </button>
  )

  return (
    <div style={{ background:"#FAFAFA", borderRadius:12, padding:12,
      display:"flex", flexDirection:"column", gap:8 }} onClick={e => e.stopPropagation()}>
      <input value={label} onChange={e => setLabel(e.target.value)}
        placeholder='Label (e.g. "Dev Wallet", "Top Holder 1")'
        style={inputStyle}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
      <input value={address} onChange={e => setAddress(e.target.value)}
        placeholder="Solana wallet address"
        style={{ ...inputStyle, fontFamily:"monospace", fontSize:"0.8125rem" }}
        onFocus={e => e.target.style.borderColor="#F5A623"}
        onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <span style={{ fontSize:"0.75rem", color:"#8E8E93", whiteSpace:"nowrap" }}>🐋 Alert if ≥</span>
        <input value={threshold} onChange={e => setThreshold(e.target.value)}
          type="number" placeholder="1000000"
          style={{ ...inputStyle, flex:1 }}
          onFocus={e => e.target.style.borderColor="#F5A623"}
          onBlur={e  => e.target.style.borderColor="rgba(0,0,0,0.1)"} />
        <span style={{ fontSize:"0.75rem", color:"#8E8E93" }}>$67</span>
      </div>
      {error && <p style={{ fontSize:"0.75rem", color:"#EF4444" }}>{error}</p>}
      <div style={{ display:"flex", gap:6 }}>
        <button onClick={submit}
          disabled={!address.trim() || !label.trim()}
          style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none",
            cursor: !address.trim() || !label.trim() ? "not-allowed" : "pointer",
            background: !address.trim() || !label.trim() ? "#E5E5EA" : "#F5A623",
            color: !address.trim() || !label.trim() ? "#A1A1AA" : "#000",
            fontSize:"0.8125rem", fontWeight:700 }}>
          Add Wallet
        </button>
        <button onClick={() => { setOpen(false); setError("") }}
          style={{ padding:"8px 14px", borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)",
            background:"none", cursor:"pointer", fontSize:"0.8125rem", color:"#8E8E93" }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Import Top Holders ────────────────────────────────────────────────────────

function ImportTopHolders({ existing, onImport }: {
  existing: string[]
  onImport: (wallets: TrackedWallet[], preloadedAmounts: Record<string, number>) => void
}) {
  const [loading,  setLoading]  = useState(false)
  const [holders,  setHolders]  = useState<{ rank:number; address:string; amount:number; pct:string; label:string }[]>([])
  const [open,     setOpen]     = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [done,     setDone]     = useState(false)

  async function fetch() {
    setLoading(true)
    setDone(false)
    try {
      const res  = await window.fetch("/api/top-holders")
      const data = await res.json()
      const newOnes = (data.holders ?? []).filter((h: any) => !existing.includes(h.address))
      setHolders(newOnes)
      setSelected(new Set(newOnes.slice(0, 10).map((h: any) => h.address)))
      setOpen(true)
    } catch {}
    setLoading(false)
  }

  function toggle(addr: string) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(addr) ? n.delete(addr) : n.add(addr)
      return n
    })
  }

  function importSelected() {
    const selected_holders = holders.filter(h => selected.has(h.address))
    const toAdd = selected_holders.map(h => ({
      address:        h.address,
      label:          `Holder #${h.rank} (${h.pct}%)`,
      alertThreshold: Math.floor(h.amount * 0.1),
      addedAt:        new Date().toISOString(),
      muted:          false,
    }))
    // Pre-load amounts so card shows data immediately
    const preloaded: Record<string, number> = {}
    for (const h of selected_holders) preloaded[h.address] = h.amount
    onImport(toAdd, preloaded)
    setDone(true)
    setOpen(false)
  }

  if (done) return (
    <div style={{ padding:"8px 12px", borderRadius:10, background:"rgba(5,150,105,0.08)",
      border:"1px solid rgba(5,150,105,0.15)", fontSize:"0.8125rem", color:"#059669", fontWeight:600,
      textAlign:"center" }}>
      ✓ {selected.size} wallets imported
    </div>
  )

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <button
        onClick={e => { e.stopPropagation(); if (!open) fetch(); else setOpen(false) }}
        disabled={loading}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          padding:"9px 14px", borderRadius:10, border:"none", cursor: loading ? "wait" : "pointer",
          background:"#0A0A0A", color:"#FFF",
          fontSize:"0.875rem", fontWeight:700, transition:"all 0.15s" }}>
        {loading
          ? <><Loader2 style={{ width:14, height:14, animation:"spin 1s linear infinite" }} /> Fetching holders…</>
          : <><Download style={{ width:14, height:14 }} /> Import Top Holders</>}
      </button>

      {open && holders.length > 0 && (
        <div style={{ background:"#F9F9F9", borderRadius:12, padding:12,
          display:"flex", flexDirection:"column", gap:8,
          border:"1.5px solid rgba(0,0,0,0.08)" }}>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"#8E8E93",
              textTransform:"uppercase", letterSpacing:"0.07em" }}>
              Top {holders.length} holders — select to import
            </p>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={e => { e.stopPropagation(); setSelected(new Set(holders.map(h => h.address))) }}
                style={{ fontSize:"0.6875rem", color:"#2563EB", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>
                All
              </button>
              <button onClick={e => { e.stopPropagation(); setSelected(new Set()) }}
                style={{ fontSize:"0.6875rem", color:"#8E8E93", background:"none", border:"none", cursor:"pointer" }}>
                None
              </button>
            </div>
          </div>

          <div style={{ maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
            {holders.map(h => {
              const sel = selected.has(h.address)
              return (
                <button key={h.address}
                  onClick={e => { e.stopPropagation(); toggle(h.address) }}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
                    borderRadius:8, border:"none", cursor:"pointer", textAlign:"left",
                    background: sel ? "rgba(245,166,35,0.08)" : "#FFF",
                    outline: sel ? "1.5px solid rgba(245,166,35,0.4)" : "1.5px solid transparent",
                    transition:"all 0.1s" }}>
                  <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#F5A623",
                    width:22, flexShrink:0, textAlign:"center" }}>#{h.rank}</span>
                  <span style={{ flex:1, fontSize:"0.75rem", fontFamily:"monospace",
                    color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {h.address.slice(0,6)}…{h.address.slice(-4)}
                  </span>
                  <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#1D1D1F", flexShrink:0 }}>
                    {h.pct}%
                  </span>
                  <span style={{ width:14, height:14, borderRadius:4, flexShrink:0,
                    background: sel ? "#F5A623" : "#E5E5EA",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"0.625rem", color:"#FFF", fontWeight:800 }}>
                    {sel ? "✓" : ""}
                  </span>
                </button>
              )
            })}
          </div>

          <button onClick={e => { e.stopPropagation(); importSelected() }}
            disabled={selected.size === 0}
            style={{ padding:"9px 0", borderRadius:8, border:"none",
              cursor: selected.size === 0 ? "not-allowed" : "pointer",
              background: selected.size === 0 ? "#E5E5EA" : "#F5A623",
              color: selected.size === 0 ? "#A1A1AA" : "#000",
              fontSize:"0.875rem", fontWeight:700 }}>
            Import {selected.size} Wallet{selected.size !== 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function WalletTrackerCard() {
  const [wallets,    setWallets]    = useState<TrackedWallet[]>([])
  const [walletData, setWalletData] = useState<Record<string, WalletData>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [lastFetch,  setLastFetch]  = useState<string | null>(null)
  const [lastPrice,  setLastPrice]  = useState(0)

  // Load from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY)
      if (s) setWallets(JSON.parse(s))
    } catch {}
  }, [])

  function save(ws: TrackedWallet[]) {
    setWallets(ws)
    localStorage.setItem(LS_KEY, JSON.stringify(ws))
  }

  // Fetch wallet data from API
  const fetchData = useCallback(async (ws: TrackedWallet[]) => {
    if (ws.length === 0) return
    setLoading(true)
    try {
      const res  = await fetch("/api/wallet-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallets: ws.map(w => ({
          address: w.address, label: w.label, alertThreshold: w.alertThreshold,
        })) }),
      })
      const data = await res.json()
      const map: Record<string, WalletData> = {}
      for (const d of (data.wallets ?? [])) map[d.address] = d

      // 🔔 Browser notification on high activity
      const alerts = (data.wallets ?? []).filter((d: WalletData) => d.recentAlert)
      if (alerts.length > 0 && "Notification" in window) {
        if (Notification.permission === "default") Notification.requestPermission()
        if (Notification.permission === "granted") {
          for (const a of alerts) {
            const lastTrade = a.trades?.[0]
            if (lastTrade) {
              const usd = (lastTrade.amount67 * (data.price67 ?? 0)).toFixed(0)
              new Notification(`🚨 $67 ${lastTrade.type.toUpperCase()} Alert`, {
                body: `${a.label}: ${lastTrade.type === "buy" ? "Bought" : "Sold"} ${lastTrade.amount67.toLocaleString(undefined,{maximumFractionDigits:0})} $67 (~$${usd})`,
                icon: "/favicon.ico",
              })
            }
          }
        }
      }

      setWalletData(map)
      setLastFetch(new Date().toISOString())
      if (data.price67) setLastPrice(data.price67)
    } catch {}
    setLoading(false)
  }, [])

  // Auto-fetch on load + every 2 min
  useEffect(() => {
    if (wallets.length > 0) fetchData(wallets)
    const id = setInterval(() => fetchData(wallets), 600_000)
    return () => clearInterval(id)
  }, [wallets.length]) // eslint-disable-line

  function addWallet(w: TrackedWallet) {
    const updated = [w, ...wallets]
    save(updated)
    fetchData(updated)
  }

  function addWallets(ws: TrackedWallet[], preloadedAmounts?: Record<string, number>) {
    const existing = new Set(wallets.map(w => w.address))
    const newOnes  = ws.filter(w => !existing.has(w.address))
    if (newOnes.length === 0) return
    const updated = [...newOnes, ...wallets]
    save(updated)

    // Pre-populate walletData with known amounts so UI is instant
    if (preloadedAmounts && Object.keys(preloadedAmounts).length > 0) {
      setWalletData(prev => {
        const next = { ...prev }
        for (const [addr, amt] of Object.entries(preloadedAmounts)) {
          if (!next[addr]) {
            next[addr] = {
              address:      addr,
              label:        ws.find(w => w.address === addr)?.label ?? addr,
              balance67:    amt,
              balanceSol:   0,
              valueUsd:     amt * lastPrice,
              isWhale:      amt >= (ws.find(w => w.address === addr)?.alertThreshold ?? 1_000_000),
              recentAlert:  false,
              lastActive:   null,
              trades:       [],
              totalBought:  0,
              totalSold:    0,
              price67:      lastPrice,
            }
          }
        }
        return next
      })
    }

    fetchData(updated)
  }

  function renameWallet(address: string, label: string) {
    const updated = wallets.map(w => w.address === address ? { ...w, label } : w)
    save(updated)
  }

  function removeWallet(address: string) {
    save(wallets.filter(w => w.address !== address))
    setWalletData(prev => { const n = { ...prev }; delete n[address]; return n })
  }

  function toggleMute(address: string) {
    save(wallets.map(w => w.address === address ? { ...w, muted: !w.muted } : w))
  }

  // Stats
  const whales      = wallets.filter(w => walletData[w.address]?.isWhale).length
  const alerts      = wallets.filter(w => walletData[w.address]?.recentAlert && !w.muted).length
  const totalValue  = Object.values(walletData).reduce((s, d) => s + d.valueUsd, 0)

  // ── Collapsed ────────────────────────────────────────────────────────────
  const collapsed = (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

      {/* 🐋 Whale Alert Feed */}
      <div onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
          <span style={{ fontSize:"0.6rem", fontWeight:800, color:"#D97706",
            textTransform:"uppercase", letterSpacing:"0.08em" }}>🐋 Whale Alerts</span>
          {alerts > 0 && (
            <span style={{ background:"#EF4444", color:"#fff", fontSize:"0.6rem",
              fontWeight:800, padding:"1px 6px", borderRadius:99 }}>{alerts} active</span>
          )}
        </div>

        {wallets.filter(w => walletData[w.address]?.recentAlert && !w.muted).slice(0,3).map(w => {
          const d = walletData[w.address]
          const t = d?.trades?.[0]
          return (
            <div key={w.address} style={{
              display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
              borderRadius:9, marginBottom:4,
              background: t?.type === "buy" ? "rgba(5,150,105,0.07)" : "rgba(239,68,68,0.07)",
              border: `1px solid ${t?.type === "buy" ? "rgba(5,150,105,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
              <span style={{ fontSize:"1rem" }}>{t?.type === "buy" ? "🟢" : "🔴"}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:"0.75rem", fontWeight:700,
                  color: t?.type === "buy" ? "#059669" : "#EF4444",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {t?.type === "buy" ? "BUY" : "SELL"} · {w.label}
                </p>
                <p style={{ fontSize:"0.6875rem", color:"#6E6E73" }}>
                  {t ? fmt(t.amount67) + " $67" : "Activity detected"}
                </p>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <p style={{ fontSize:"0.75rem", fontWeight:800, color:"#F5A623" }}>
                  {d ? fmtUsd(d.valueUsd) : "—"}
                </p>
                <p style={{ fontSize:"0.6rem", color:"#9945FF", fontWeight:600 }}>
                  {d ? d.balanceSol.toFixed(2) + " SOL" : ""}
                </p>
              </div>
            </div>
          )
        })}

        {wallets.filter(w => walletData[w.address]?.recentAlert && !w.muted).length === 0 && (
          <div style={{ padding:"6px 10px", borderRadius:9,
            background:"rgba(0,0,0,0.03)", border:"1px solid rgba(0,0,0,0.06)",
            display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:"0.875rem" }}>😴</span>
            <span style={{ fontSize:"0.75rem", color:"#8E8E93", fontWeight:500 }}>No whale activity right now</span>
          </div>
        )}
      </div>

      {/* Wallet list */}
      {wallets.length > 0 && (
        <div style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:8 }}
          onClick={e => e.stopPropagation()}>
          <p style={{ fontSize:"0.6rem", fontWeight:800, color:"#8E8E93",
            textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>
            Tracked Wallets
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {wallets.slice(0, 5).map(w => {
              const d = walletData[w.address]
              const isWhale = d?.isWhale
              return (
                <div key={w.address} style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"5px 8px", borderRadius:8,
                  background: isWhale ? "rgba(217,119,6,0.06)" : "rgba(0,0,0,0.02)",
                  border: `1px solid ${isWhale ? "rgba(217,119,6,0.15)" : "rgba(0,0,0,0.05)"}`,
                }}>
                  <span style={{ fontSize:"0.75rem" }}>{isWhale ? "🐋" : "👛"}</span>
                  <span style={{ flex:1, fontSize:"0.75rem", color:"#374151", fontWeight:600,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{w.label}</span>
                  {d ? (
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:"0.6875rem", fontWeight:800, color:"#F5A623", lineHeight:1.2 }}>
                        {fmt(d.balance67)}<span style={{ fontSize:"0.55rem", color:"#A1A1AA" }}> $67</span>
                      </p>
                      <p style={{ fontSize:"0.6rem", color: d.valueUsd > 0 ? "#059669" : "#C7C7CC", fontWeight:600 }}>
                        {d.valueUsd > 0 ? fmtUsd(d.valueUsd) : "—"} · <span style={{ color:"#9945FF" }}>{d.balanceSol.toFixed(2)} SOL</span>
                      </p>
                    </div>
                  ) : (
                    <span style={{ fontSize:"0.6875rem", color:"#C7C7CC" }}>loading…</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add wallet */}
      <div onClick={e => e.stopPropagation()} style={{ display:"flex", flexDirection:"column", gap:6 }}>
        <ImportTopHolders existing={wallets.map(w => w.address)} onImport={addWallets} />
        <AddWalletForm onAdd={addWallet} />
      </div>
    </div>
  )

  // ── Expanded ─────────────────────────────────────────────────────────────
  const expanded = (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Header bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:12 }}>
          <span style={{ fontSize:"0.8125rem", color:"#8E8E93" }}>
            {wallets.length} tracked · {whales} whale{whales !== 1 ? "s" : ""}
          </span>
          {totalValue > 0 && (
            <span style={{ fontSize:"0.8125rem", color:"#059669", fontWeight:600 }}>
              {fmtUsd(totalValue)} total
            </span>
          )}
        </div>
        <button onClick={e => { e.stopPropagation(); fetchData(wallets) }}
          disabled={loading || wallets.length === 0}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px",
            borderRadius:8, border:"1.5px solid rgba(0,0,0,0.1)", background:"none",
            cursor: loading || wallets.length === 0 ? "not-allowed" : "pointer",
            fontSize:"0.75rem", color:"#8E8E93", fontWeight:600 }}>
          <RefreshCw style={{ width:12, height:12,
            animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Fetching…" : lastFetch ? `Updated ${timeAgo(lastFetch)}` : "Refresh"}
        </button>
      </div>

      {/* Alert banner */}
      {alerts > 0 && (
        <div style={{ background:"rgba(239,68,68,0.07)", borderRadius:10, padding:"9px 12px",
          display:"flex", alignItems:"center", gap:8, border:"1px solid rgba(239,68,68,0.15)" }}>
          <AlertTriangle style={{ width:14, height:14, color:"#EF4444", flexShrink:0 }} />
          <p style={{ fontSize:"0.8125rem", color:"#EF4444", fontWeight:600 }}>
            🚨 {alerts} wallet{alerts > 1 ? "s" : ""} with activity in the last hour
          </p>
        </div>
      )}

      {/* Import top holders + manual add */}
      <ImportTopHolders existing={wallets.map(w => w.address)} onImport={addWallets} />
      <AddWalletForm onAdd={addWallet} />

      {/* Wallet list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {wallets.length === 0 ? (
          <p style={{ textAlign:"center", color:"#A1A1AA", fontSize:"0.875rem", padding:"20px 0" }}>
            No wallets tracked yet. Add a dev wallet or top holder above.
          </p>
        ) : wallets.map(w => (
          <WalletRow key={w.address} wallet={w} data={walletData[w.address]}
            expanded={expandedId === w.address}
            onToggle={() => setExpandedId(v => v === w.address ? null : w.address)}
            onRemove={() => removeWallet(w.address)}
            onMute={() => toggleMute(w.address)}
            onRename={(label) => renameWallet(w.address, label)} />
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard compact
      title="Wallet Tracker"
      subtitle="Track · Alert · Monitor"
      icon={<Wallet style={{ width:16, height:16 }} />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
      noAutoOpen
    />
  )
}
