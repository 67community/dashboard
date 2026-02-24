"use client"

import { TrendingUp, TrendingDown, Coins } from "lucide-react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { TOKEN_HEALTH } from "@/lib/mock-data"

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

function fmtPrice(n: number): string {
  if (n < 0.001) return `$${n.toFixed(6)}`
  return `$${n.toFixed(4)}`
}

export function TokenHealthCard() {
  const t = TOKEN_HEALTH
  const isUp = t.change24h >= 0

  const collapsed = (
    <div className="space-y-3 mt-1">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmtPrice(t.price)}</p>
          <div className={`flex items-center gap-1 text-sm font-medium mt-1 ${isUp ? "text-green-600" : "text-red-500"}`}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isUp ? "+" : ""}{t.change24h}% 24h
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Market Cap</p>
          <p className="text-sm font-semibold text-gray-700">{fmt(t.marketCap)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Volume 24h</p>
          <p className="text-sm font-semibold text-gray-700">{fmt(t.volume24h)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Holders</p>
          <p className="text-sm font-semibold text-gray-700">{t.holders.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )

  const expanded = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Price", value: fmtPrice(t.price), sub: `${isUp ? "+" : ""}${t.change24h}% 24h`, subColor: isUp ? "text-green-600" : "text-red-500" },
          { label: "Market Cap", value: fmt(t.marketCap), sub: "", subColor: "" },
          { label: "Volume 24h", value: fmt(t.volume24h), sub: "", subColor: "" },
          { label: "Holders", value: t.holders.toLocaleString(), sub: "", subColor: "" },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">{item.value}</p>
            {item.sub && <p className={`text-xs font-medium mt-0.5 ${item.subColor}`}>{item.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-1">ATH Price</p>
          <p className="text-lg font-bold text-amber-700">{fmtPrice(t.ath)}</p>
          <p className="text-xs text-amber-500 mt-0.5">
            {((1 - t.price / t.ath) * 100).toFixed(1)}% below ATH
          </p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-xs text-purple-600 font-medium mb-1">Rankings</p>
          <p className="text-sm font-bold text-purple-700">CMC #{t.cmcRank.toLocaleString()}</p>
          <p className="text-sm font-bold text-purple-700 mt-0.5">CG #{t.cgRank.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Quick Links</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "DexScreener", href: "https://dexscreener.com/solana/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6" },
            { label: "DexTools", href: "https://www.dextools.io/app/en/solana/pair-explorer/DMAFl613xtipUA3JFNycZaVwT7XsIYf9CR3QmrmZqhB6" },
            { label: "Solscan", href: "https://solscan.io/token/9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump" },
            { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/the-official-67-coin" },
            { label: "CMC", href: "https://coinmarketcap.com/currencies/the-official-67-coin-onchain/" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 bg-white rounded-xl text-xs font-medium text-gray-700 hover:text-amber-700 hover:bg-amber-50 border border-gray-200 transition-colors"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <DashboardCard
      title="Token Health"
      icon={<Coins className="w-4 h-4" />}
      accentColor="#F5A623"
      collapsed={collapsed}
      expanded={expanded}
    />
  )
}
