import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSecret } from "@/app/api/_lib/secrets"

// Hardcoded allowed Discord user IDs — team members with dashboard access
const HARDCODED_USER_IDS = [
  "767811814557089802",  // Oscar
  "788495124061487154",  // WJP
  "1440075589557158100", // Jamie
  "1444130836415905993", // Brandon
  "965681608604647514",  // Gen
  "201710326347988993",  // Crispy
  "682831521396031498",  // Nick
  "901472204745740298",  // N1
]

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

  // Load any additional allowed IDs from secrets (comma-separated)
  const extraIds = await getSecret("DASHBOARD_USER_IDS")
  const extraList = extraIds.split(",").map(s => s.trim()).filter(Boolean)
  const ALLOWED_USER_IDS = new Set([...HARDCODED_USER_IDS, ...extraList])

  // Check if user's Discord ID is in the allowed list
  const discordUserId = data.session.user?.user_metadata?.provider_id
    ?? data.session.user?.user_metadata?.sub
    ?? ""

  if (!ALLOWED_USER_IDS.has(discordUserId)) {
    console.error("User not allowed:", discordUserId)
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=not_allowed`)
  }

  // Store verification in user metadata
  await supabase.auth.updateUser({
    data: { dashboard_authorized: true },
  })

  return NextResponse.redirect(`${origin}${next}`)
}
