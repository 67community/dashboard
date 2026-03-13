import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const DISCORD_SERVER_ID = "1238523987413274654"

// Allowed Discord user IDs — only these users can access the dashboard
const ALLOWED_USER_IDS = new Set(
  (process.env.DASHBOARD_USER_IDS ?? "").split(",").filter(Boolean).concat([
    "767811814557089802",  // Oscar
    "788495124061487154",  // WJP
    "1440075589557158100", // Jamie
    "1444130836415905993", // Brandon
    "965681608604647514",  // Gen
    "201710326347988993",  // Crispy
    "682831521396031498",  // Nick
    "901472204745740298",  // N1
  ])
)

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? "/"
  const origin = url.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Check Discord guild membership using the provider access token
  const discordAccessToken = data.session.provider_token
  if (!discordAccessToken) {
    return NextResponse.redirect(`${origin}/login?error=no_token`)
  }

  let isMember = false
  try {
    const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${discordAccessToken}` },
    })

    if (guildsRes.ok) {
      const guilds: Array<{ id: string }> = await guildsRes.json()
      isMember = guilds.some((g) => g.id === DISCORD_SERVER_ID)
    } else {
      console.error("Discord guilds API error:", guildsRes.status)
    }
  } catch (e) {
    console.error("Guild check failed:", e)
  }

  if (!isMember) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=guild`)
  }

  // Check if user's Discord ID is in the allowed list
  const discordUserId = data.session.user?.user_metadata?.provider_id
    ?? data.session.user?.identities?.[0]?.id
    ?? ""
  
  if (!ALLOWED_USER_IDS.has(discordUserId)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=not_allowed`)
  }

  // Store verification in user metadata so middleware can fast-check
  await supabase.auth.updateUser({
    data: {
      guild_verified: true,
      guild_id: DISCORD_SERVER_ID,
    },
  })

  return NextResponse.redirect(`${origin}${next}`)
}
