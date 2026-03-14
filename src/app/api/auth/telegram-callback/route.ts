import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

// Check if user is a member of the mod group
const MOD_GROUP_ID = "-1003681688688"

async function isGroupMember(tgUserId: string): Promise<boolean> {
  // First check env whitelist
  const extra = process.env.TG_ALLOWED_IDS ?? ""
  const extraList = extra.split(",").map(s => s.trim()).filter(Boolean)
  if (extraList.length > 0 && extraList.includes(tgUserId)) return true

  // Then check mod group membership via bot API
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${MOD_GROUP_ID}&user_id=${tgUserId}`
    )
    const data = await res.json()
    if (!data.ok) return false
    const status = data.result?.status
    return ["creator", "administrator", "member", "restricted"].includes(status)
  } catch {
    return false
  }
}

function verifyTelegramAuth(params: Record<string, string>, botToken: string): boolean {
  const { hash, ...data } = params
  if (!hash) return false

  const secret = crypto.createHash("sha256").update(botToken).digest()
  const checkString = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join("\n")
  const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex")

  return hmac === hash
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const next = url.searchParams.get("next") ?? "/"
  const origin = url.origin

  // Extract Telegram auth params
  const params: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "next") params[key] = value
  }

  const botToken = process.env.TG_LOGIN_BOT_TOKEN
  if (!botToken) {
    console.error("TG_LOGIN_BOT_TOKEN not set")
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Verify the auth data is from Telegram
  if (!verifyTelegramAuth(params, botToken)) {
    console.error("Telegram auth verification failed")
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Check auth_date is not too old (1 hour)
  const authDate = parseInt(params.auth_date ?? "0")
  if (Date.now() / 1000 - authDate > 3600) {
    console.error("Telegram auth expired")
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const tgUserId = params.id
  const tgUsername = params.username ?? ""
  const tgFirstName = params.first_name ?? ""

  // Check mod group membership
  const isMember = await isGroupMember(tgUserId)
  if (!isMember) {
    console.error("Telegram user not in mod group:", tgUserId, tgUsername)
    return NextResponse.redirect(`${origin}/login?error=tg_not_allowed`)
  }

  // Set auth cookie
  const cookieStore = await cookies()
  const sessionData = JSON.stringify({
    provider: "telegram",
    tg_id: tgUserId,
    tg_username: tgUsername,
    tg_name: tgFirstName,
    authorized: true,
    auth_date: authDate,
  })

  cookieStore.set("tg_session", sessionData, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return NextResponse.redirect(`${origin}${next}`)
}
