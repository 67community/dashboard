import { NextResponse } from "next/server"

const MINT   = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
const SUPPLY = 999_680_000

// Multiple RPC fallbacks
const RPCS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.rpc.extrnode.com",
  "https://rpc.ankr.com/solana",
]

async function rpcPost(method: string, params: unknown[]) {
  for (const rpc of RPCS) {
    try {
      const res = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        next: { revalidate: 300 },
      })
      const data = await res.json()
      if (!data.error) return data.result
    } catch { continue }
  }
  return null
}

export async function GET() {
  try {
    // Step 1: Get largest token accounts (works on public RPC)
    const largest = await rpcPost("getTokenLargestAccounts", [MINT])
    const tokenAccounts: { address: string; uiAmount: number }[] = largest?.value ?? []

    if (tokenAccounts.length === 0) {
      return NextResponse.json({ holders: [], error: "No token accounts found" })
    }

    // Step 2: Look up owner for each token account
    const holders = await Promise.all(
      tokenAccounts.slice(0, 20).map(async (ta, i) => {
        try {
          const info = await rpcPost("getAccountInfo", [ta.address, { encoding: "jsonParsed" }])
          const owner = info?.value?.data?.parsed?.info?.owner as string ?? ta.address
          return {
            rank:    i + 1,
            address: owner,
            amount:  ta.uiAmount ?? 0,
            pct:     (((ta.uiAmount ?? 0) / SUPPLY) * 100).toFixed(2),
            label:   `Holder #${i + 1}`,
          }
        } catch {
          return {
            rank:    i + 1,
            address: ta.address,
            amount:  ta.uiAmount ?? 0,
            pct:     (((ta.uiAmount ?? 0) / SUPPLY) * 100).toFixed(2),
            label:   `Holder #${i + 1}`,
          }
        }
      })
    )

    return NextResponse.json({ holders, total: holders.length, fetchedAt: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
