// Legacy password auth removed — auth is now handled via Discord OAuth + Supabase.
// This file is kept to avoid 404s on any cached requests.
import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ error: "Password auth removed. Please use Discord OAuth." }, { status: 410 })
}
