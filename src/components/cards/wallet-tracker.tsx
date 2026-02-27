"use client"

import { useState, useEffect, useCallback } from "react"
import { Wallet, Plus, RefreshCw, ExternalLink, Trash2, Bell, BellOff, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrackedWallet {
  address:        string
  label:          string
  alertThreshold: number  // $67 tokens — alert if balance >= this
  addedAt:        string
  muted:          boolean
}

interface WalletData {
  address:     string
  label:       string
  balance67:   number
  balanceSol:  number
  valueUsd:    number
  isWhale:     boolean
  recentAlert: boolean
  lastActive:  string | null
  recentTxs:  { sig: string; slot: number; blockTime: number | null; err: boolean }[]
  price67:     number
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
  wallet, data, expanded, onToggle, onRemove, onMute,
}: {
  wallet:   TrackedWallet
  data?:    WalletData
  expanded: boolean
  onToggle: () => void
  onRemove: () => void
  onMute:   () => void
}) {
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
            <span style={{ fontSize:"0.875rem", fontWeight:700, color:"#1D1D1F",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {wallet.label}
            </span>
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
            <p style={{ fontSize:"0.875rem", fontWeight:700,
              color: data.balance67 > 0 ? "#1D1D1F" : "#C7C7CC" }}>
              {fmt(data.balance67)} <span style={{ fontSize:"0.6875rem", color:"#8E8E93" }}>$67</span>
            </p>
            <p style={{ fontSize:"0.6875rem", color:"#8E8E93" }}>{fmtUsd(data.valueUsd)}</p>
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

          {/* Recent txs */}
          {data.recentTxs.length > 0 && (
            <div>
              <p style={{ fontSize:"0.625rem", fontWeight:700, color:"#8E8E93",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>
                Recent Transactions
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {data.recentTxs.slice(0, 4).map(tx => (
                  <div key={tx.sig} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", flexShrink:0,
                      background: tx.err ? "#EF4444" : "#059669" }} />
                    <span style={{ flex:1, fontSize:"0.6875rem", color:"#374151",
                      fontFamily:"monospace", overflow:"hidden",
                      textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {tx.sig.slice(0, 20)}…
                    </span>
                    <span style={{ fontSize:"0.6875rem", color:"#A1A1AA", flexShrink:0 }}>
                      {tx.blockTime ? timeAgo(new Date(tx.blockTime * 1000).toISOString()) : ""}
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
              style={{ flex:1, padding:"6px 0", borderRadius:8,
                border:"1.5px solid rgba(0,0,0,0.1)", background:"none",
                cursor:"pointer", fontSize:"0.75rem", color:"#2563EB", fontWeight:600,
                textAlign:"center", textDecoration:"none", display:"flex",
                alignItems:"center", justifyContent:"center", gap:4 }}>
              Solscan <ExternalLink style={{ width:11, height:11 }} />
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

// ── Card ──────────────────────────────────────────────────────────────────────

export function WalletTrackerCard() {
  const [wallets,    setWallets]    = useState<TrackedWallet[]>([])
  const [walletData, setWalletData] = useState<Record<string, WalletData>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [lastFetch,  setLastFetch]  = useState<string | null>(null)

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
      setWalletData(map)
      setLastFetch(new Date().toISOString())
    } catch {}
    setLoading(false)
  }, [])

  // Auto-fetch on load + every 2 min
  useEffect(() => {
    if (wallets.length > 0) fetchData(wallets)
    const id = setInterval(() => fetchData(wallets), 120_000)
    return () => clearInterval(id)
  }, [wallets.length]) // eslint-disable-line

  function addWallet(w: TrackedWallet) {
    const updated = [w, ...wallets]
    save(updated)
    fetchData(updated)
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
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Stats */}
      <div style={{ display:"flex", gap:8 }}>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#1D1D1F", lineHeight:1 }}>{wallets.length}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Tracked</p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:"#D97706", lineHeight:1 }}>{whales}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>🐋 Whales</p>
        </div>
        <div className="inset-cell" style={{ flex:1, textAlign:"center" }}>
          <p style={{ fontSize:"1.5rem", fontWeight:800,
            color: alerts > 0 ? "#EF4444" : "#1D1D1F", lineHeight:1 }}>{alerts}</p>
          <p style={{ fontSize:"0.625rem", color:"#8E8E93", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>Alerts</p>
        </div>
      </div>

      {/* Alert banner */}
      {alerts > 0 && (
        <div style={{ background:"rgba(239,68,68,0.07)", borderRadius:10, padding:"8px 12px",
          display:"flex", alignItems:"center", gap:8, border:"1px solid rgba(239,68,68,0.15)" }}>
          <AlertTriangle style={{ width:14, height:14, color:"#EF4444", flexShrink:0 }} />
          <p style={{ fontSize:"0.8125rem", color:"#EF4444", fontWeight:600 }}>
            {alerts} wallet{alerts > 1 ? "s" : ""} active in the last hour
          </p>
        </div>
      )}

      {/* Add form */}
      <div onClick={e => e.stopPropagation()}>
        <AddWalletForm onAdd={addWallet} />
      </div>

      {/* Quick list */}
      {wallets.length > 0 && (
        <div style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:12 }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {wallets.slice(0, 4).map(w => {
              const d = walletData[w.address]
              return (
                <div key={w.address} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {d?.recentAlert && !w.muted
                    ? <span style={{ width:7, height:7, borderRadius:"50%", background:"#EF4444", flexShrink:0 }} />
                    : <span style={{ width:7, height:7, borderRadius:"50%",
                        background: d ? "#059669" : "#E5E5EA", flexShrink:0 }} />}
                  <span style={{ flex:1, fontSize:"0.8125rem", color:"#374151", fontWeight:500,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{w.label}</span>
                  {d ? (
                    <span style={{ fontSize:"0.75rem", color:"#F5A623", fontWeight:700 }}>
                      {fmt(d.balance67)} $67
                    </span>
                  ) : (
                    <span style={{ fontSize:"0.75rem", color:"#C7C7CC" }}>…</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
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

      {/* Add form */}
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
            onMute={() => toggleMute(w.address)} />
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard
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
