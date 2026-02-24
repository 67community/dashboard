"use client"

import { TrendingUp, TrendingDown, Coins } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

const $ = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`
const $p = (n: number) => n < 0.001 ? `$${n.toFixed(6)}` : `$${n.toFixed(5)}`

function Chg({ v }: { v: number }) {
  const up = v >= 0
  return (
    <span className={up ? "badge-up" : "badge-down"}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{v?.toFixed(2)}%
    </span>
  )
}

export function TokenHealthCard() {
  const { data, livePrice, liveChange24h, liveMcap } = useAppData()
  const t = data?.token_health
  const price = livePrice ?? t?.price ?? 0
  const c24h  = liveChange24h ?? t?.price_change_24h ?? 0
  const mcap  = liveMcap ?? t?.market_cap ?? 0

  const collapsed = (
    <div className="space-y-5">
      {/* Hero price */}
      <div>
        <p className="display-number">{$p(price)}</p>
        <div className="flex items-center gap-2.5 mt-2">
          <Chg v={c24h} />
          <span className="display-label">24h change</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { l: "Market Cap",    v: $(mcap) },
          { l: "Volume 24h",   v: $(t?.total_volume_24h ?? 0) },
          { l: "Holders",      v: (t?.holders ?? 0).toLocaleString() },
          { l: "CMC Rank",     v: `#${(t?.cmc_rank ?? 0).toLocaleString()}` },
        ].map(x => (
          <div key={x.l} className="stat-pill">
            <p className="display-label mb-1.5">{x.l}</p>
            <p className="text-base font-bold text-[#1A1A18] tracking-tight">{x.v}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      {/* Big price */}
      <div className="bg-[#EDE8DF] rounded-2xl p-5">
        <p className="display-label mb-2">Live Price</p>
        <p style={{ fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, color: "#1A1A18" }}>
          {$p(price)}
        </p>
        <div className="flex items-center gap-2 mt-2.5">
          <Chg v={c24h} />
          <span className="text-xs text-[#7A7570]">·</span>
          <Chg v={t?.price_change_1h ?? 0} />
          <span className="text-xs text-[#7A7570] font-medium">1h</span>
          {t?.price_change_7d !== undefined && <>
            <span className="text-xs text-[#7A7570]">·</span>
            <Chg v={t.price_change_7d} />
            <span className="text-xs text-[#7A7570] font-medium">7d</span>
          </>}
        </div>
      </div>

      {/* Grid metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { l: "Market Cap",  v: $(mcap) },
          { l: "Total Vol 24h", v: $(t?.total_volume_24h ?? 0) },
          { l: "Holders",     v: (t?.holders ?? 0).toLocaleString() },
          { l: "Liquidity",   v: $(t?.liquidity ?? 0) },
        ].map(x => (
          <div key={x.l} className="stat-pill">
            <p className="display-label mb-1.5">{x.l}</p>
            <p className="text-xl font-bold text-[#1A1A18] tracking-tight">{x.v}</p>
          </div>
        ))}
      </div>

      {/* ATH */}
      <div className="rounded-2xl p-5 overflow-hidden relative" style={{ background: "linear-gradient(135deg, #1A1A18, #252520)" }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #F5A623, transparent)", transform: "translate(30%,-30%)" }} />
        <p className="display-label text-white/40 mb-2">All-Time High</p>
        <p className="text-2xl font-black text-white tracking-tight">{$p(t?.ath ?? 0)}</p>
        <p className="text-xs text-white/40 mt-1 font-medium">{Math.abs(t?.ath_change_pct ?? 0).toFixed(1)}% below ATH · {t?.ath_date}</p>
      </div>

      {/* Buy/sell */}
      {t?.buys_24h && (
        <div className="stat-pill">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span style={{ color: "#34C759" }}>Buys {t.buys_24h.toLocaleString()} ({((t.buys_24h/(t.buys_24h+t.sells_24h))*100).toFixed(0)}%)</span>
            <span style={{ color: "#FF3B30" }}>Sells {t.sells_24h.toLocaleString()}</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
            <div className="rounded-full" style={{ width: `${(t.buys_24h/(t.buys_24h+t.sells_24h))*100}%`, background: "#34C759" }} />
            <div className="rounded-full flex-1" style={{ background: "#FF3B30" }} />
          </div>
        </div>
      )}

      {/* Exchange volumes */}
      {(t?.exchange_volumes?.length ?? 0) > 0 && (
        <div className="stat-pill">
          <p className="display-label mb-4">Volume by Exchange</p>
          <div className="space-y-3">
            {t!.exchange_volumes.map((ex, i) => {
              const pct = (ex.volume_usd / t!.exchange_volumes[0].volume_usd) * 100
              return (
                <div key={i} className="flex items-center gap-2.5">
                  {ex.logo && <img src={ex.logo} alt="" className="w-4 h-4 rounded-sm object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display="none" }} />}
                  <span className="text-xs font-semibold text-[#1A1A18] w-28 truncate">{ex.exchange}</span>
                  <div className="flex-1 progress-track h-1.5">
                    <div className="progress-fill h-1.5" style={{ width:`${pct}%`, background: ex.is_dex ? "#30B0C7" : "#F5A623" }} />
                  </div>
                  <span className="text-xs font-bold text-[#1A1A18] w-14 text-right">{$(ex.volume_usd)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-2">
        {[["DexScreener","https://dexscreener.com/solana/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6"],
          ["Solscan","https://solscan.io/token/9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"],
          ["CoinGecko","https://www.coingecko.com/en/coins/the-official-67-coin"],
          ["CMC","https://coinmarketcap.com/currencies/the-official-67-coin-onchain/"]
        ].map(([l,h]) => (
          <a key={l} href={h} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#1A1A18] hover:bg-[#E5DFD5] transition-colors"
            style={{ background: "#EDE8DF" }}>
            {l} ↗
          </a>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard title="Token Health" subtitle="$67 · Solana"
      icon={<Coins className="w-[18px] h-[18px]" />}
      accentColor="#F5A623" collapsed={collapsed} expanded={expanded} liveTag />
  )
}
