import type { SupabaseClient, User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

export type AdminCheck =
    | { ok: true; user: User; supabase: SupabaseClient }
    | { ok: false; status: 401 | 403; error: string }

/**
 * The single admin gate for route handlers and server actions.
 *
 * Server actions and API routes are public HTTP endpoints — hiding a button in
 * the admin UI does not stop anyone calling them directly — so every
 * admin-only operation must call this first.
 */
export async function requireAdmin(): Promise<AdminCheck> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { ok: false, status: 401, error: "Unauthorized" }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

    if (!profile?.is_admin) return { ok: false, status: 403, error: "Forbidden: admin only" }

    return { ok: true, user, supabase }
}
