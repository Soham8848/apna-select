import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import { createPublicClient } from "@/lib/supabase/public"

/**
 * The signed-in user for an API request, from either:
 *   - `Authorization: Bearer <access token>` — the mobile app, which has no cookies
 *   - the Supabase session cookie — the website
 *
 * The token is verified with Supabase Auth (getUser), never just decoded.
 */
export async function getRequestUser(req: Request): Promise<User | null> {
    const auth = req.headers.get("authorization") ?? ""
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : ""

    if (token) {
        const { data, error } = await createPublicClient().auth.getUser(token)
        return error ? null : data.user
    }

    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return data.user
}
