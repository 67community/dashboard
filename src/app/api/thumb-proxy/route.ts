import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) return new NextResponse("missing url", { status: 400 })

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Referer": "https://www.tiktok.com/",
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) return new NextResponse("fetch failed", { status: 502 })

    const buf = await res.arrayBuffer()
    const ct = res.headers.get("content-type") || "image/jpeg"

    return new NextResponse(buf, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return new NextResponse("error", { status: 500 })
  }
}
