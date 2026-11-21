import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

/**
 * Refresh the Supabase session only where the server actually reads it.
 *
 * This used to run on every request, adding a round trip to Supabase Auth
 * before even the cached catalogue pages could be served. Public pages
 * (home, products, categories, deals, search) no longer read the session on
 * the server — the browser client keeps its own token fresh there.
 */
export const config = {
    matcher: [
        '/account/:path*',
        '/orders/:path*',
        '/favorites/:path*',
        '/checkout/:path*',
        '/admin/:path*',
        '/api/:path*',
        '/login',
        '/signup',
        '/auth/:path*',
    ],
}
