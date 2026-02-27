import { NextResponse } from "next/server"

const RPC      = "https://api.mainnet-beta.solana.com"
const MINT_67  = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
const TOKEN_PGM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    next: { revalidate: 60 },
  })
  const data = await res.json()
  return data.result
}

// Get $67 token balance for a wallet
async function get67Balance(wallet: string): Promise<number> {
  try {
    const result = await rpc("getTokenAccountsByOwner", [
      wallet,
      { mint: MINT_67 },
      { encoding: "jsonParsed" },
    ])
    if (!result?.value?.length) return 0
    const amount = result.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0
    return amount
  } catch { return 0 }
}

// Get recent transactions for a wallet (last 10)
async function getRecentTxs(wallet: string): Promise<{
  sig: string; slot: number; blockTime: number | null; err: boolean
}[]> {
  try {
    const sigs = await rpc("getSignaturesForAddress", [
      wallet,
      { limit: 10 },
    ])
    return (sigs ?? []).map((s: any) => ({
      sig:       s.signature,
      slot:      s.slot,
      blockTime: s.blockTime,
      err:       !!s.err,
    }))
  } catch { return [] }
}

// Get SOL balance
async function getSolBalance(wallet: string): Promise<number> {
  try {
    const result = await rpc("getBalance", [wallet])
    return (result?.value ?? 0) / 1e9
  } catch { return 0 }
}

// Fetch $67 price from DexScreener
async function get67Price(): Promise<number> {
  try {
    const res  = await fetch(
      "https://api.dexscreener.com/latest/dex/tokens/9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump",
      { next: { revalidate: 120 } }
    )
    const data = await res.json()
    return parseFloat(data.pairs?.[0]?.priceUsd ?? "0")
  } catch { return 0 }
}

export async function POST(req: Request) {
  const { wallets } = await req.json()
  if (!Array.isArray(wallets) || wallets.length === 0) {
    return NextResponse.json({ error: "No wallets provided" }, { status: 400 })
  }

  const price67 = await get67Price()

  const results = await Promise.all(
    wallets.slice(0, 12).map(async (w: { address: string; label: string; alertThreshold?: number }) => {
      const [balance67, balanceSol, recentTxs] = await Promise.all([
        get67Balance(w.address),
        getSolBalance(w.address),
        getRecentTxs(w.address),
      ])

      const valueUsd   = balance67 * price67
      const threshold  = w.alertThreshold ?? 1_000_000
      const isWhale    = balance67 >= threshold
      const lastActive = recentTxs[0]?.blockTime
        ? new Date(recentTxs[0].blockTime * 1000).toISOString()
        : null

      // Check for recent large movement (last tx within 1h)
      const recentAlert = recentTxs[0]?.blockTime
        ? (Date.now() / 1000 - recentTxs[0].blockTime) < 3600
        : false

      return {
        address:     w.address,
        label:       w.label,
        balance67,
        balanceSol,
        valueUsd,
        isWhale,
        recentAlert,
        lastActive,
        recentTxs:   recentTxs.slice(0, 5),
        price67,
      }
    })
  )

  // Sort: whales first, then by balance
  results.sort((a, b) => {
    if (a.isWhale !== b.isWhale) return a.isWhale ? -1 : 1
    return b.balance67 - a.balance67
  })

  return NextResponse.json({ wallets: results, price67, fetchedAt: new Date().toISOString() })
}
