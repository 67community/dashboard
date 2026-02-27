import { NextResponse } from "next/server"

const RPC    = "https://api.mainnet-beta.solana.com"
const MINT   = "9AvytnUKsLxPxFHFqS6VLxaxt5p6BhYNr53SD2Chpump"
const SUPPLY = 999_680_000

export async function GET() {
  try {
    // Get all token accounts for $67 mint
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "getProgramAccounts",
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
      next: { revalidate: 300 },
    })

    const data = await res.json()
    const accounts: { owner: string; amount: number }[] = []

    for (const acc of data.result ?? []) {
      const info   = acc.account?.data?.parsed?.info
      const amount = parseFloat(info?.tokenAmount?.uiAmount ?? "0")
      const owner  = info?.owner as string
      if (amount > 0 && owner) accounts.push({ owner, amount })
    }

    // Sort descending, take top 25
    accounts.sort((a, b) => b.amount - a.amount)
    const top = accounts.slice(0, 25)

    const holders = top.map((h, i) => ({
      rank:    i + 1,
      address: h.owner,
      amount:  h.amount,
      pct:     ((h.amount / SUPPLY) * 100).toFixed(2),
      label:   `Holder #${i + 1}`,
    }))

    return NextResponse.json({ holders, total: accounts.length, fetchedAt: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
