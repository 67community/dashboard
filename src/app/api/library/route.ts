import { NextResponse } from "next/server"

const BOT_TOKEN = process.env.TG_ANNOUNCE_BOT_TOKEN!
const MEME_CHAT = "-1003343009902"
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`

async function getFileUrl(file_id: string): Promise<string | null> {
  try {
    const r = await fetch(`${BASE}/getFile?file_id=${file_id}`)
    const d = await r.json()
    if (!d.ok) return null
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${d.result.file_path}`
  } catch { return null }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const offsetId = searchParams.get("offset") ?? "0"

  try {
    // getHistory via bot — use getChatHistory workaround with forwardMessages
    // Telegram Bot API doesn't have getHistory, use updates approach
    // Instead: fetch from our prebuilt JSON if available, else return empty
    // Best approach: use the messages we can get via copyMessage trick
    // Actually use: get updates from the group (if bot is member)
    
    const res = await fetch(`${BASE}/getUpdates?allowed_updates=["message"]&limit=100`, {
      cache: "no-store"
    })
    const data = await res.json()
    
    // Try forwarding approach - read messages with file_ids
    // Fallback: return empty and suggest alternative
    return NextResponse.json({ items: [], note: "Bot needs to be added to group to read history" })
  } catch (e) {
    return NextResponse.json({ items: [], error: String(e) })
  }
}

// Proxy endpoint: /api/library/file?id=xxx
export async function POST(req: Request) {
  const { file_id } = await req.json()
  const url = await getFileUrl(file_id)
  if (!url) return NextResponse.json({ error: "File not found" }, { status: 404 })
  return NextResponse.json({ url })
}
