import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Anonymous, cookie-free client for public catalogue reads (products, reviews).
 *
 * The cookie-based server client calls `cookies()`, which forces Next.js to
 * render the whole page per request. Catalogue data is identical for every
 * visitor, so reading it through this client lets pages use ISR
 * (`export const revalidate = 60`) and be served from cache.
 */
let cached: SupabaseClient | undefined

export function createPublicClient(): SupabaseClient {
    if (!cached) {
        cached = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } }
        )
    }
    return cached
}

/**
 * Columns a product card / listing needs. Listing pages used `select("*")`,
 * which shipped every description, spec sheet and variant list to the browser
 * — repeated once per rail the product appeared in.
 */
export const CARD_COLUMNS =
    "id, title, category, price, compare_at_price, images, inventory_count, average_rating, review_count, created_at"
