const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_KEY!

let _cache: Record<string, string> | null = null
let _cacheTime = 0

export async function getSecret(key: string): Promise<string> {
  // Cache for 5 minutes
  if (_cache && Date.now() - _cacheTime < 300_000) return _cache[key] ?? ""

  const res = await fetch(`${SB_URL}/rest/v1/kv_store?key=eq.secrets&select=value`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    next: { revalidate: 300 },
  })
  const rows = await res.json()
  const val = rows?.[0]?.value
  _cache = typeof val === "string" ? JSON.parse(val) : (val ?? {})
  _cacheTime = Date.now()
  return _cache![key] ?? ""
}
