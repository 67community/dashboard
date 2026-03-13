import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const DISCORD_SERVER_ID = "1238523987413274654"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip auth for public paths
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/login") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/exchanges/") ||
    pathname.startsWith("/logo") ||
    pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check guild membership flag stored in session user metadata
  // This is set by the callback route after Discord API check
  const guildVerified = session.user.user_metadata?.guild_verified === true
  const guildId = session.user.user_metadata?.guild_id

  if (!guildVerified || guildId !== DISCORD_SERVER_ID) {
    // Re-verify on every request would be expensive; we rely on callback setting metadata.
    // If metadata missing, force re-login.
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("error", "guild")
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
