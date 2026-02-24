"use client"

import { TrendingUp, TrendingDown, Coins, ExternalLink, ArrowUpRight } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

const fmt = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n.toFixed(0)}`
const fmtP = (n: number) => n < 0.0001 ? `$${n.toFixed(8)}` : n < 0.001 ? `$${n.toFixed(6)}` : `$${n.toFixed(5)}`

function Change({ v }: { v: number }) {
  const up = v >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{v?.toFixed(2)}%
    </span>
  )
}

export function TokenHealthCard() {
  const { data, livePrice, liveChange24h, liveMcap } = useAppData()
  const t = data?.token_health
  const price = livePrice ?? t?.price ?? 0
  const c24h = liveChange24h ?? t?.price_change_24h ?? 0
  const mcap = liveMcap ?? t?.market_cap ?? 0

  const collapsed = (
    <div className="space-y-4">
      <div>
        <div className="flex items-end gap-2.5 flex-wrap">
          <span className="metric-value">{fmtP(price)}</span>
          <Change v={c24h} />
        </div>
        <p className="metric-label mt-1">Live Price · $67 / Solana</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#F2EDE4] rounded-2xl p-3.5">
          <p className="metric-label mb-1">Market Cap</p>
          <p className="text-lg font-bold text-[#0D0D0D] tracking-tight">{fmt(mcap)}</p>
        </div>
        <div className="bg-[#F2EDE4] rounded-2xl p-3.5">
          <p className="metric-label mb-1">Total Vol 24h</p>
          <p className="text-lg font-bold text-[#0D0D0D] tracking-tight">{fmt(t?.total_volume_24h ?? 0)}</p>
        </div>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Price", v: fmtP(price), sub: <Change v={c24h} /> },
          { l: "Market Cap", v: fmt(mcap), sub: <Change v={t?.price_change_1h ?? 0} /> },
          { l: "Total Vol 24h", v: fmt(t?.total_volume_24h ?? 0), sub: null },
          { l: "Holders", v: (t?.holders ?? 0).toLocaleString(), sub: (t?.holder_trend ?? 0) !== 0 ? <span className={`text-xs font-semibold ${(t?.holder_trend ?? 0) > 0 ? "text-green-600" : "text-red-500"}`}>{(t?.holder_trend ?? 0) > 0 ? "+" : ""}{t?.holder_trend} today</span> : null },
        ].map((x) => (
          <div key={x.l} className="bg-[#F2EDE4] rounded-2xl p-4">
            <p className="metric-label mb-2">{x.l}</p>
            <p className="text-xl font-bold text-[#0D0D0D] tracking-tight">{x.v}</p>
            {x.sub && <div className="mt-1.5">{x.sub}</div>}
          </div>
        ))}
      </div>

      {/* ATH + rank */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #FEF3D0, #FDE9A0)" }}>
          <p className="text-xs font-bold text-amber-700 tracking-widest uppercase mb-1">All-Time High</p>
          <p className="text-2xl font-black text-amber-800 tracking-tight">{fmtP(t?.ath ?? 0)}</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">{Math.abs(t?.ath_change_pct ?? 0).toFixed(1)}% below ATH · {t?.ath_date}</p>
        </div>
        <div className="bg-[#0D0D0D] rounded-2xl p-4">
          <p className="text-xs font-bold text-white/40 tracking-widest uppercase mb-2">Rankings</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">CoinMarketCap</span>
              <span className="text-sm font-bold text-white">#{(t?.cmc_rank ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">CoinGecko</span>
              <span className="text-sm font-bold text-white">#{(t?.coingecko_rank ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buy / Sell bar */}
      {t?.buys_24h && (
        <div className="bg-[#F2EDE4] rounded-2xl p-4">
          <div className="flex justify-between text-xs font-bold mb-2.5">
            <span className="text-green-600">🟢 Buys {t.buys_24h.toLocaleString()} ({((t.buys_24h / (t.buys_24h + t.sells_24h)) * 100).toFixed(0)}%)</span>
            <span className="text-red-500">Sells {t.sells_24h.toLocaleString()} 🔴</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <div className="bg-green-400 rounded-full transition-all" style={{ width: `${(t.buys_24h / (t.buys_24h + t.sells_24h)) * 100}%` }} />
            <div className="bg-red-400 rounded-full flex-1" />
          </div>
        </div>
      )}

      {/* Exchange volumes */}
      {(t?.exchange_volumes?.length ?? 0) > 0 && (
        <div className="bg-[#F2EDE4] rounded-2xl p-4">
          <p className="metric-label mb-3.5">Volume by Exchange</p>
          <div className="space-y-2.5">
            {t!.exchange_volumes.map((ex, i) => {
              const pct = (ex.volume_usd / t!.exchange_volumes[0].volume_usd) * 100
              return (
                <div key={i} className="flex items-center gap-2.5">
                  {ex.logo && <img src={ex.logo} alt="" className="w-4 h-4 rounded-sm object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />}
                  <span className="text-xs text-[#4A4035] w-28 truncate flex-shrink-0 font-medium">{ex.exchange}</span>
                  <div className="flex-1 bg-[#DDD7CC] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ex.is_dex ? "#06b6d4" : "#F5A623" }} />
                  </div>
                  <span className="text-xs font-bold text-[#0D0D0D] w-16 text-right">{fmt(ex.volume_usd)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-2">
        {[
          ["DexScreener", "https://dexscreener.com/solana/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6"],
          ["Solscan", "https://solscan.io/token/9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"],
          ["CoinGecko", "https://www.coingecko.com/en/coins/the-official-67-coin"],
          ["CMC", "https://coinmarketcap.com/currencies/the-official-67-coin-onchain/"],
        ].map(([l, h]) => (
          <a key={l} href={h} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0D0D0D] text-white rounded-xl text-xs font-semibold hover:bg-[#2A2A2A] transition-colors">
            {l} <ArrowUpRight className="w-3 h-3" />
          </a>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard title="Token Health" icon={<Coins className="w-4 h-4" />}
      accentColor="#F5A623" collapsed={collapsed} expanded={expanded}
      badge="LIVE" />
  )
}
