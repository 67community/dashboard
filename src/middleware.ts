import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE = "67mc_auth"
const PASSWORD = process.env.SITE_PASSWORD ?? "67community"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip auth for: API routes, static files, login page itself
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

  // Check auth cookie
  const auth = req.cookies.get(COOKIE)?.value
  if (auth === PASSWORD) return NextResponse.next()

  // Not authenticated — redirect to login
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.searchParams.set("from", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
