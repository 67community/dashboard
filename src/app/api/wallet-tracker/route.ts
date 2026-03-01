import { NextResponse } from "next/server"

// Multiple RPC fallbacks — public endpoints that support getTokenAccountsByOwner + getBalance
const RPCS = [
  "https://mainnet.helius-rpc.com/?api-key=8579d298-388b-497c-836d-51f39b224e63",
  "https://api.mainnet-beta.solana.com",
]
const MINT_67 = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"

async function rpc(method: string, params: unknown[], revalidate = 600) {
  for (const RPC of RPCS) {
    try {
      const res = await fetch(RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        next: { revalidate },
      })
      const data = await res.json()
      if (!data.error) return data.result
    } catch { continue }
  }
  return null
}

// ── Get token account address for $67 on this wallet ─────────────────────────
async function getTokenAccount(wallet: string): Promise<string | null> {
  try {
    const result = await rpc("getTokenAccountsByOwner", [
      wallet,
      { mint: MINT_67 },
      { encoding: "jsonParsed" },
    ])
    return result?.value?.[0]?.pubkey ?? null
  } catch { return null }
}

// ── Get $67 balance ───────────────────────────────────────────────────────────
async function get67Balance(wallet: string): Promise<number> {
  try {
    const result = await rpc("getTokenAccountsByOwner", [
      wallet,
      { mint: MINT_67 },
      { encoding: "jsonParsed" },
    ])
    return result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0
  } catch { return 0 }
}

// ── Get SOL balance ───────────────────────────────────────────────────────────
async function getSolBalance(wallet: string): Promise<number> {
  try {
    const result = await rpc("getBalance", [wallet])
    return (result?.value ?? 0) / 1e9
  } catch { return 0 }
}

// ── Get $67 token trade history (buy/sell with amounts) ───────────────────────
async function getTokenTrades(wallet: string, tokenAccount: string): Promise<{
  sig: string; type: "buy" | "sell"; amount67: number; blockTime: number
}[]> {
  try {
    // Get signatures for the TOKEN account (only $67 related txs)
    const sigs = await rpc("getSignaturesForAddress", [
      tokenAccount,
      { limit: 15 },
    ], 0)
    if (!sigs?.length) return []

    const trades: { sig: string; type: "buy" | "sell"; amount67: number; blockTime: number }[] = []

    // Parse each tx to determine buy/sell and amount
    const txResults = await Promise.all(
      sigs.slice(0, 8).map((s: any) =>
        rpc("getTransaction", [s.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }], 0)
          .catch(() => null)
      )
    )

    for (let i = 0; i < txResults.length; i++) {
      const tx = txResults[i]
      if (!tx || tx.meta?.err) continue

      const blockTime = sigs[i]?.blockTime ?? 0
      const sig       = sigs[i]?.signature ?? ""

      // Find pre/post token balance for this wallet's token account
      const preBalances  = tx.meta?.preTokenBalances  ?? []
      const postBalances = tx.meta?.postTokenBalances ?? []

      const preEntry  = preBalances.find((b: any)  => b.owner === wallet && b.mint === MINT_67)
      const postEntry = postBalances.find((b: any) => b.owner === wallet && b.mint === MINT_67)

      const pre  = parseFloat(preEntry?.uiTokenAmount?.uiAmountString  ?? "0")
      const post = parseFloat(postEntry?.uiTokenAmount?.uiAmountString ?? "0")

      const delta = post - pre
      if (Math.abs(delta) < 1) continue // skip dust

      trades.push({
        sig,
        type:     delta > 0 ? "buy" : "sell",
        amount67: Math.abs(delta),
        blockTime,
      })
    }

    return trades.slice(0, 6)
  } catch { return [] }
}

// ── $67 price ─────────────────────────────────────────────────────────────────
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

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { wallets } = await req.json()
  if (!Array.isArray(wallets) || wallets.length === 0) {
    return NextResponse.json({ error: "No wallets provided" }, { status: 400 })
  }

  const price67 = await get67Price()

  const results = await Promise.all(
    wallets.slice(0, 12).map(async (w: { address: string; label: string; alertThreshold?: number }) => {
      // Fetch token account first — needed for trade history
      const tokenAccount = await getTokenAccount(w.address)

      const [balance67, balanceSol, trades] = await Promise.all([
        get67Balance(w.address),
        getSolBalance(w.address),
        tokenAccount ? getTokenTrades(w.address, tokenAccount) : Promise.resolve([]),
      ])

      const valueUsd   = balance67 * price67
      const threshold  = w.alertThreshold ?? 1_000_000
      const isWhale    = balance67 >= threshold

      const lastTrade  = trades[0]
      const lastActive = lastTrade?.blockTime
        ? new Date(lastTrade.blockTime * 1000).toISOString()
        : null

      // Alert if last trade within 1h
      const recentAlert = lastTrade?.blockTime
        ? (Date.now() / 1000 - lastTrade.blockTime) < 3600
        : false

      // Compute total bought / sold from history
      const totalBought = trades.filter(t => t.type === "buy").reduce((s, t) => s + t.amount67, 0)
      const totalSold   = trades.filter(t => t.type === "sell").reduce((s, t) => s + t.amount67, 0)

      return {
        address:      w.address,
        label:        w.label,
        balance67,
        balanceSol,
        valueUsd,
        isWhale,
        recentAlert,
        lastActive,
        trades,         // recent buy/sell history
        totalBought,
        totalSold,
        price67,
      }
    })
  )

  results.sort((a, b) => {
    if (a.isWhale !== b.isWhale) return a.isWhale ? -1 : 1
    return b.balance67 - a.balance67
  })

  return NextResponse.json({ wallets: results, price67, fetchedAt: new Date().toISOString() })
}
