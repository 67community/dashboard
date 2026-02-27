import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export const revalidate = 300 // 5 min cache

const RPC    = "https://api.mainnet-beta.solana.com"
const MINT   = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
const SUPPLY = 999_680_000

interface LiveEntry {
  handle:   string
  score:    number
  badge:    string
  platform?: string
  address?: string
  meta?:    string
}

function extractUsername(url: string): string | null {
  // https://x.com/{username}/status/{id}
  try {
    const m = url.match(/x\.com\/([^/]+)\/status\//)
    if (m && m[1] && m[1] !== "i") return m[1]
  } catch {}
  return null
}

function fmtScore(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export async function GET() {
  const raiders:      LiveEntry[] = []
  const creators:     LiveEntry[] = []
  const holders:      LiveEntry[] = []

  // ── 1. RAIDERS — from raid_feed ─────────────────────────────────────────
  try {
    const dataPath = path.join(process.cwd(), "public", "data.json")
    const raw  = await readFile(dataPath, "utf-8")
    const data = JSON.parse(raw)

    // Count raids per Twitter username
    const raidCounts: Record<string, number> = {}
    for (const item of (data.raid_feed ?? [])) {
      const tweetUrl: string = item.tweet_url ?? item.text ?? ""
      const username = extractUsername(tweetUrl)
      if (username) raidCounts[username] = (raidCounts[username] ?? 0) + 1
    }

    const sorted = Object.entries(raidCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)

    sorted.forEach(([handle, count], i) => {
      raiders.push({
        handle:  `@${handle}`,
        score:   count,
        badge:   i === 0 ? "🏆 Top Raider" : i < 3 ? "⚔️ Elite Raider" : "⚔️ Raider",
        meta:    `${count} raid${count !== 1 ? "s" : ""}`,
      })
    })

    // ── 2. CREATORS — TikTok spotlight ──────────────────────────────────────
    const tikMap: Record<string, { plays: number; likes: number; videos: number }> = {}
    for (const v of (data.tiktok_spotlight ?? [])) {
      const u = v.creator ?? v.username
      if (!u) continue
      if (!tikMap[u]) tikMap[u] = { plays: 0, likes: 0, videos: 0 }
      tikMap[u].plays  += v.plays  ?? 0
      tikMap[u].likes  += v.likes  ?? 0
      tikMap[u].videos += 1
    }

    // Also pull YouTube spotlight from data if available
    for (const v of (data.youtube_spotlight ?? [])) {
      const u = v.channel ?? v.channelTitle ?? v.creator
      if (!u) continue
      if (!tikMap[u]) tikMap[u] = { plays: 0, likes: 0, videos: 0 }
      tikMap[u].plays  += v.views       ?? v.viewCount ?? 0
      tikMap[u].likes  += v.likes       ?? v.likeCount ?? 0
      tikMap[u].videos += 1
    }

    Object.entries(tikMap)
      .sort((a, b) => b[1].plays - a[1].plays)
      .slice(0, 15)
      .forEach(([handle, stats], i) => {
        creators.push({
          handle:   `@${handle}`,
          score:    stats.plays,
          badge:    i === 0 ? "🌟 Viral Creator" : i < 3 ? "🎥 Top Creator" : "🎥 Creator",
          platform: "TikTok",
          meta:     `${fmtScore(stats.plays)} views · ${fmtScore(stats.likes)} likes`,
        })
      })

  } catch (e) {
    console.error("[leaderboard] data.json error:", e)
  }

  // ── 3. HOLDERS — Solana on-chain top holders ─────────────────────────────
  try {
    const res = await fetch(RPC, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method:  "getProgramAccounts",
        params: [
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          {
            encoding: "jsonParsed",
            filters: [
              { dataSize: 165 },
              { memcmp: { offset: 0, bytes: MINT } },
            ],
          },
        ],
      }),
      next: { revalidate: 600 },
    })

    const rpcData = await res.json()
    const accounts: { owner: string; amount: number }[] = []

    for (const acc of rpcData.result ?? []) {
      const info   = acc.account?.data?.parsed?.info
      const amount = parseFloat(info?.tokenAmount?.uiAmount ?? "0")
      const owner  = info?.owner as string
      if (amount > 0 && owner) accounts.push({ owner, amount })
    }

    accounts.sort((a, b) => b.amount - a.amount)

    accounts.slice(0, 15).forEach((h, i) => {
      const pct = ((h.amount / SUPPLY) * 100).toFixed(2)
      holders.push({
        handle:  `${h.owner.slice(0, 4)}…${h.owner.slice(-4)}`,
        score:   Math.round(h.amount),
        badge:   i === 0 ? "💎 Top Holder" : i < 3 ? "💎 Whale" : pct >= "1" ? "🐋 Mega Holder" : "💰 Holder",
        address: h.owner,
        meta:    `${fmtScore(Math.round(h.amount))} $67 · ${pct}%`,
      })
    })
  } catch (e) {
    console.error("[leaderboard] RPC error:", e)
  }

  return NextResponse.json({
    raiders,
    creators,
    holders,
    fetchedAt: new Date().toISOString(),
  })
}
