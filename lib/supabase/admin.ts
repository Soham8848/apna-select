import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role client. Bypasses row-level security, so it must only ever be
 * used in server code (route handlers, server actions) and never be imported
 * by a client component. The key has no NEXT_PUBLIC_ prefix, so Next.js will
 * not ship it to the browser even if this file were imported by mistake — it
 * would simply be undefined there.
 *
 * Order writes go through this client so the database can deny shoppers any
 * direct write access to `orders` / `order_items`: otherwise anyone holding the
 * public anon key could mark their own order as paid.
 *
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured, so callers can
 * fall back to the cookie-scoped client during the transition.
 */
let cached: SupabaseClient | null | undefined

export function createAdminClient(): SupabaseClient | null {
    if (cached !== undefined) return cached

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    // SUPABASE_SECRET_KEY = new-style "sb_secret_..." key (Project Settings → API Keys → Secret keys).
    // SUPABASE_SERVICE_ROLE_KEY = the legacy JWT service_role key. Either works.
    const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim()

    if (!url || !key) {
        console.warn(
            "SUPABASE_SECRET_KEY is not set — order writes fall back to the user's session. " +
                "Add it to .env.local before applying supabase/migrations/06_lock_down_rls.sql."
        )
        cached = null
        return cached
    }

    cached = createSupabaseClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    })
    return cached
}
