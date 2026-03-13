import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// ── static fallback ───────────────────────────────────────────────────────────
function readStaticJson() {
  const LOCAL = path.join(process.cwd(), "public", "data.json")
  for (const p of [LOCAL]) {
    try { if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8")) } catch {}
  }
  return null
}

// ── Supabase KV reader ────────────────────────────────────────────────────────
const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_KEY!

async function sbGet(key: string): Promise<unknown | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/kv_store?key=eq.${key}&select=value`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
    )
    if (!res.ok) return null
    const rows = await res.json()
    const v = rows?.[0]?.value ?? null
    if (typeof v === "string") try { return JSON.parse(v) } catch { return v }
    return v
  } catch { return null }
}

// ── main ──────────────────────────────────────────────────────────────────────
export async function GET() {
  const [
    sbXRecent,
    sbXPopular,
    sbTokenHealth,
    sbHolders,
    sbSocialCounts,
    sbMarketData,
    sbYouTube,
    sbTikTok,
    sbNews,
    sbInstagram,
    sbXFollowers,
    sbSnapshot24h,
    sbDiscordActivity,
    sbXCommunity,
    sbXEngagement,
    sbRaidFeed,
    sbXRaidFeed,
    sbTeamPresence,
    sbMapAdmin,
    sbXChatQueue,
  ] = await Promise.all([
    sbGet("x_recent"),
    sbGet("x_popular"),
    sbGet("token_health"),
    sbGet("holders"),
    sbGet("social_counts"),
    sbGet("market_data"),
    sbGet("youtube_videos"),
    sbGet("tiktok_spotlight"),
    sbGet("news_feed"),
    sbGet("instagram_posts"),
    sbGet("social_counts_x"),
    sbGet("snapshot_24h"),
    sbGet("discord_activity"),
    sbGet("x_community"),
    sbGet("x_engagement"),
    sbGet("raid_feed"),
    sbGet("x_raid_feed"),
    sbGet("team_presence"),
    sbGet("map_admin"),
    sbGet("xchat_queue"),
  ])

  if (!sbTokenHealth && !sbHolders && !sbSocialCounts) {
    const static_ = readStaticJson()
    if (static_) return NextResponse.json(static_, { headers: { "Cache-Control": "no-store" } })
    return NextResponse.json({ error: "no data" }, { status: 500 })
  }

  const static_ = readStaticJson()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const da: any = sbDiscordActivity ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const th: any = sbTokenHealth ?? static_?.token_health ?? {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const md: any = sbMarketData ?? static_?.market_data ?? {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hld: any = sbHolders ?? {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc: any = sbSocialCounts ?? {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snap: any = sbSnapshot24h ?? static_?._snapshot_24h ?? {}
  const holdersCount = hld?.count ?? th?.holders ?? static_?.token_health?.holders ?? 0
  const holderSnap = snap?.holders ?? holdersCount

  const token_health = {
    price:                th.price ?? 0,
    price_change_24h:     th.price_change_24h ?? 0,
    price_change_1h:      th.price_change_1h  ?? 0,
    price_change_6h:      th.price_change_6h  ?? 0,
    price_change_7d:      th.price_change_7d  ?? 0,
    market_cap:           th.market_cap ?? 0,
    liquidity:            th.liquidity ?? 0,
    volume_24h:           th.volume_24h ?? 0,
    volume_1h:            th.volume_1h  ?? 0,
    buys_24h:             th.buys_24h  ?? 0,
    sells_24h:            th.sells_24h ?? 0,
    buys_1h:              th.buys_1h   ?? 0,
    sells_1h:             th.sells_1h  ?? 0,
    holders:              holdersCount,
    holder_trend:         holdersCount - holderSnap,
    coingecko_rank:       th.coingecko_rank ?? 0,
    cmc_rank:             th.cmc_rank ?? 0,
    ath:                  th.ath ?? 0.04363,
    ath_date:             th.ath_date ?? "2025-11-19",
    ath_change_pct:       th.ath_change_pct ?? 0,
    total_volume_24h:     th.total_volume_24h ?? th.volume_24h ?? 0,
    exchange_volumes:     th.exchange_volumes ?? md?.exchange_volumes ?? [],
    biggest_trades:       th.biggest_trades ?? { biggest_buy_usd: 0, biggest_buy_tx: "", biggest_sell_usd: 0, biggest_sell_tx: "" },
    sentiment:            "Neutral",
    volume_change_pct:    th.volume_change_pct    ?? 0,
    mcap_change_pct:      th.mcap_change_pct      ?? 0,
    liquidity_change_pct: th.liquidity_change_pct ?? 0,
  }

  const out = {
    last_updated:     new Date().toISOString(),
    token_health,
    social_pulse: (() => {
      const sp = static_?.social_pulse ?? { twitter_followers: 0, follower_change_24h: 0, posting_streak_days: 0, engagement_rate: 0, avg_engagement: 0, total_engagement_7d: 0, best_content_type: "tweet", content_type_stats: {} }
      const xf = (sbXFollowers as Record<string, unknown> | null)?.x_followers ?? sc?.x_followers
      if (xf) sp.twitter_followers = xf
      const cur     = sp.twitter_followers ?? 0
      const snap24  = static_?._snapshot_24h?.twitter_followers ?? cur
      const delta1d = cur - snap24
      const delta3d = sp.follower_change_3d ?? 0
      const delta7d = sp.follower_change_7d ?? 0
      const eng = (sbXEngagement as Record<string, unknown>) ?? {}
      const xc  = (sbXCommunity  as Record<string, unknown>) ?? {}
      if (eng.engagement_rate      !== undefined) sp.engagement_rate       = eng.engagement_rate
      if (eng.avg_engagement       !== undefined) sp.avg_engagement        = eng.avg_engagement
      if (eng.total_engagement_7d  !== undefined) sp.total_engagement_7d  = eng.total_engagement_7d
      if (eng.posting_streak_days  !== undefined) sp.posting_streak_days  = eng.posting_streak_days
      if (eng.content_type_stats)                 sp.content_type_stats   = eng.content_type_stats
      if (eng.total_views_recent   !== undefined) sp.total_views_recent   = eng.total_views_recent
      if (eng.total_likes_recent   !== undefined) sp.total_likes_recent   = eng.total_likes_recent
      if (xc.x_community_members)                 sp.x_community_members  = xc.x_community_members
      if (xc.x_community_delta_24h !== undefined) sp.x_community_delta_24h = xc.x_community_delta_24h
      if (xc.community_tweets)                    sp.community_tweets     = xc.community_tweets
      return { ...sp, follower_change_24h: delta1d, follower_change_3d: delta3d, follower_change_7d: delta7d, follower_change_20h: delta1d }
    })(),
    community: {
      ...(static_?.community ?? { discord_members: 0, active_7d: 0, new_joins_24h: 0, open_tickets: 0, unanswered_posts: 0, telegram_members: 0, watchlist_count: 0 }),
      discord_members:    sc?.discord_members   ?? static_?.community?.discord_members   ?? 0,
      online_now:         sc?.discord_online    ?? static_?.community?.online_now        ?? 0,
      discord_delta_24h:  (sc?.discord_members  ?? 0) - (snap?.discord_members  ?? sc?.discord_members  ?? 0),
      telegram_members:   sc?.telegram_members  ?? static_?.community?.telegram_members  ?? 0,
      telegram_delta_24h: (sc?.telegram_members ?? 0) - (snap?.telegram_members ?? sc?.telegram_members ?? 0),
      new_joins_24h:      da?.new_joins_24h     ?? static_?.community?.new_joins_24h     ?? 0,
      watchlist_count:    th?.watchlist_count   ?? static_?.community?.watchlist_count   ?? 0,
      watchlist_delta_24h: (th?.watchlist_count ?? 0) - (snap?.watchlist_count ?? th?.watchlist_count ?? 0),
      team_presence:      sbTeamPresence        ?? static_?.community?.team_presence     ?? null,
      ...(da ? (() => {
        const staticActs   = static_?.community?.recent_discord_activity ?? []
        const liveJoins    = da.recent_joins      ?? []
        const liveMod      = da.mod_events        ?? []
        const liveContribs = da.top_contributors  ?? []
        const liveChs      = da.top_channels      ?? []
        return {
          recent_joins:            liveJoins.length    > 0 ? liveJoins    : staticActs.filter((a: { type: string }) => a.type === "join").slice(0, 8),
          active_users_today:      da.active_users_today,
          top_channels:            liveChs.length      > 0 ? liveChs      : (static_?.community?.top_channels      ?? []),
          voice_channels:          da.voice_channels,
          scheduled_events:        da.scheduled_events,
          boost_level:             da.boost_level,
          boost_count:             da.boost_count,
          mod_events:              liveMod.length      > 0 ? liveMod      : staticActs.filter((a: { type: string }) => a.type !== "join").slice(0, 8),
          top_contributors:        liveContribs.length > 0 ? liveContribs : (static_?.community?.top_contributors ?? []),
          recent_discord_activity: staticActs,
        }
      })() : {
        recent_joins:            static_?.community?.recent_joins            ?? (static_?.community?.recent_discord_activity ?? []).filter((a: { type: string }) => a.type === "join").slice(0, 8),
        active_users_today:      static_?.community?.active_users_today      ?? 0,
        top_channels:            static_?.community?.top_channels            ?? [],
        voice_channels:          static_?.community?.voice_channels          ?? [],
        scheduled_events:        static_?.community?.scheduled_events        ?? [],
        boost_level:             static_?.community?.boost_level             ?? 0,
        boost_count:             static_?.community?.boost_count             ?? 0,
        mod_events:              static_?.community?.mod_events              ?? (static_?.community?.recent_discord_activity ?? []).filter((a: { type: string }) => a.type !== "join").slice(0, 8),
        top_contributors:        static_?.community?.top_contributors        ?? [],
        recent_discord_activity: static_?.community?.recent_discord_activity ?? [],
      }),
    },
    content_pipeline:    static_?.content_pipeline  ?? [],
    agents:              static_?.agents             ?? [],
    milestones:          static_?.milestones         ?? [],
    alerts:              static_?.alerts             ?? [],
    recent_wins:         static_?.recent_wins        ?? [],
    next_target:         static_?.next_target        ?? null,
    tiktok_spotlight:    (Array.isArray(sbTikTok) ? sbTikTok : ((sbTikTok as any)?.videos ?? static_?.tiktok_spotlight ?? [])).map((v: any) => ({ ...v, video_url: v.video_url ?? v.url ?? "", thumbnail_url: v.thumbnail_url ?? v.thumbnail ?? "", plays: v.plays ?? v.views ?? 0 })),
    youtube_spotlight:   (sbYouTube    as unknown[]) ?? static_?.youtube_spotlight    ?? [],
    youtube_analytics:   static_?.youtube_analytics  ?? null,
    instagram_spotlight: (Array.isArray(sbInstagram) ? ((sbInstagram as any)?.posts ?? sbInstagram) : ((sbInstagram as any)?.posts ?? static_?.instagram_spotlight ?? [])).map((v: any) => ({ ...v, video_url: v.video_url ?? v.url ?? "", thumbnail_url: v.thumbnail_url ?? v.thumbnail ?? "", plays: v.plays ?? v.views ?? 0 })),
    raid_feed:           (sbRaidFeed   as unknown[]) ?? static_?.raid_feed            ?? [],
    x_raid_feed:         (sbXRaidFeed  as unknown[]) ?? [],
    news_feed:           (sbNews       as unknown[]) ?? [],
    market_data:         (sbMarketData as unknown)   ?? static_?.market_data          ?? [],
    x_recent:            (sbXRecent    as unknown[]) ?? static_?.x_recent             ?? [],
    x_popular:           (sbXPopular   as unknown[]) ?? static_?.x_popular            ?? [],
    map_features:        (sbMapAdmin   as unknown)   ?? static_?.map_features         ?? { type: "FeatureCollection", features: [] },
    xchat_queue:         (sbXChatQueue as unknown[]) ?? [],
    discord_activity:    (sbDiscordActivity as Record<string,unknown>) ?? static_?.discord_activity ?? {},
    x_feed:              (sbXRecent as unknown[]) ?? static_?.x_feed ?? [],
  }

  return NextResponse.json(out, { headers: { "Cache-Control": "no-store, max-age=0" } })
}
