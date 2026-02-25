import { NextRequest, NextResponse } from "next/server"

const CG_ID = "the-official-67-coin"

export async function GET(req: NextRequest) {
  const days = req.nextUrl.searchParams.get("days") ?? "7"

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${CG_ID}/ohlc?vs_currency=usd&days=${days}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 }, // cache 5 min
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "CoinGecko error", status: res.status }, { status: 502 })
    }

    // [[timestamp_ms, open, high, low, close], ...]
    const raw: number[][] = await res.json()

    const candles = raw.map(([t, o, h, l, c]) => ({
      t: Math.floor(t / 1000), // convert to seconds
      o, h, l, c,
    }))

    return NextResponse.json({ candles })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
