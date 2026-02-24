"use client"

import { TrendingUp, TrendingDown, Coins, ExternalLink } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAppData } from "@/lib/data-context"

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function fmtPrice(n: number): string {
  if (n < 0.0001) return `$${n.toFixed(8)}`
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toFixed(4)}`
}

function pct(n: number) {
  const isUp = n >= 0
  return (
    <span className={`flex items-center gap-0.5 text-sm font-semibold ${isUp ? "text-green-600" : "text-red-500"}`}>
      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {isUp ? "+" : ""}{n?.toFixed(2)}%
    </span>
  )
}

export function TokenHealthCard() {
  const { data, livePrice, liveChange24h, liveMcap } = useAppData()
  const t = data?.token_health

  const price = livePrice ?? t?.price ?? 0
  const change24h = liveChange24h ?? t?.price_change_24h ?? 0
  const mcap = liveMcap ?? t?.market_cap ?? 0
  const isUp = change24h >= 0

  const collapsed = (
    <div className="space-y-3 mt-1">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmtPrice(price)}</p>
            <div className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: isUp ? "#dcfce7" : "#fee2e2", color: isUp ? "#16a34a" : "#dc2626" }}>
              {isUp ? "+" : ""}{change24h?.toFixed(1)}% 24h
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">$67 · Solana</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Market Cap</p>
          <p className="text-sm font-semibold text-gray-800">{fmt(mcap)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Vol 24h</p>
          <p className="text-sm font-semibold text-gray-800">{fmt(t?.total_volume_24h ?? t?.volume_24h ?? 0)}</p>
        </div>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-5">
      {/* Price + changes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Price</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums">{fmtPrice(price)}</p>
          <div className="mt-1">{pct(change24h)}</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Market Cap</p>
          <p className="text-xl font-bold text-gray-900">{fmt(mcap)}</p>
          <p className="text-xs text-gray-400 mt-1">1h: {pct(t?.price_change_1h ?? 0)}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Total Vol 24h</p>
          <p className="text-xl font-bold text-gray-900">{fmt(t?.total_volume_24h ?? 0)}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Holders</p>
          <p className="text-xl font-bold text-gray-900">{t?.holders?.toLocaleString() ?? "—"}</p>
          {(t?.holder_trend ?? 0) !== 0 && (
            <p className={`text-xs font-medium mt-1 ${(t?.holder_trend ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
              {(t?.holder_trend ?? 0) >= 0 ? "+" : ""}{t?.holder_trend} today
            </p>
          )}
        </div>
      </div>

      {/* ATH + Ranks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-1">ATH — {t?.ath_date}</p>
          <p className="text-lg font-bold text-amber-700">{fmtPrice(t?.ath ?? 0)}</p>
          <p className="text-xs text-amber-500 mt-0.5">{Math.abs(t?.ath_change_pct ?? 0).toFixed(1)}% below ATH</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-xs text-purple-600 font-medium mb-2">Rankings</p>
          <p className="text-sm font-bold text-purple-700">CMC #{(t?.cmc_rank ?? 0).toLocaleString()}</p>
          <p className="text-sm font-bold text-purple-700 mt-1">CG #{(t?.coingecko_rank ?? 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Buy / Sell ratio */}
      {t?.buys_24h && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span className="text-green-600 font-semibold">🟢 Buys: {t.buys_24h.toLocaleString()}</span>
            <span className="text-red-500 font-semibold">Sells: {t.sells_24h.toLocaleString()} 🔴</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden">
            <div className="bg-green-400 transition-all" style={{ width: `${(t.buys_24h / (t.buys_24h + t.sells_24h)) * 100}%` }} />
            <div className="bg-red-400 flex-1" />
          </div>
        </div>
      )}

      {/* Exchange volumes */}
      {t?.exchange_volumes && t.exchange_volumes.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Volume by Exchange</p>
          <div className="space-y-2.5">
            {t.exchange_volumes.map((ex, i) => {
              const maxVol = t.exchange_volumes[0].volume_usd
              const barPct = (ex.volume_usd / maxVol) * 100
              return (
                <div key={i} className="flex items-center gap-2">
                  {ex.logo && (
                    <img src={ex.logo} alt={ex.exchange} className="w-4 h-4 rounded-sm object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  )}
                  <span className="text-xs text-gray-600 w-28 truncate flex-shrink-0">{ex.exchange}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${barPct}%`, backgroundColor: ex.is_dex ? "#06b6d4" : "#6366f1" }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-16 text-right">{fmt(ex.volume_usd)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "DexScreener", href: "https://dexscreener.com/solana/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6" },
          { label: "DexTools", href: "https://www.dextools.io/app/en/solana/pair-explorer/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6" },
          { label: "Solscan", href: "https://solscan.io/token/9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump" },
          { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/the-official-67-coin" },
          { label: "CMC", href: "https://coinmarketcap.com/currencies/the-official-67-coin-onchain/" },
        ].map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl text-xs font-medium text-gray-700 hover:text-amber-700 hover:bg-amber-50 border border-gray-200 transition-colors">
            {link.label} <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardCard title="Token Health" icon={<Coins className="w-4 h-4" />}
      accentColor="#F5A623" collapsed={collapsed} expanded={expanded} />
  )
}
