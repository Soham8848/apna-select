'use client'

import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

/**
 * Signed-in shopper state, loaded in the browser.
 *
 * The navbar used to read the session on the server. Because the navbar is in
 * the root layout, that made *every* page render per request and ignore its
 * `revalidate` setting. Loading the session here keeps pages cacheable: the
 * HTML is the same for everyone, and the user-specific bits (avatar, admin
 * links, filled wishlist hearts) fill in after hydration.
 */
interface SessionState {
    user: User | null
    isAdmin: boolean
    favoriteIds: Set<string>
    loaded: boolean
    setFavorite: (productId: string, favorited: boolean) => void
}

export const useSession = create<SessionState>((set) => ({
    user: null,
    isAdmin: false,
    favoriteIds: new Set(),
    loaded: false,
    setFavorite: (productId, favorited) =>
        set((s) => {
            const next = new Set(s.favoriteIds)
            if (favorited) next.add(productId)
            else next.delete(productId)
            return { favoriteIds: next }
        }),
}))

let started = false

async function load(user: User | null) {
    if (!user) {
        useSession.setState({ user: null, isAdmin: false, favoriteIds: new Set(), loaded: true })
        return
    }

    const supabase = createClient()
    const [{ data: profile }, { data: favs }] = await Promise.all([
        supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle(),
        supabase.from('favorites').select('product_id').eq('user_id', user.id),
    ])

    useSession.setState({
        user,
        isAdmin: Boolean(profile?.is_admin),
        favoriteIds: new Set((favs ?? []).map((f) => String(f.product_id))),
        loaded: true,
    })
}

/** Starts the session listener once per page load. Safe to call repeatedly. */
export function startSession() {
    if (started || typeof window === 'undefined') return
    started = true

    const supabase = createClient()
    // onAuthStateChange fires INITIAL_SESSION immediately, then on sign-in/out.
    supabase.auth.onAuthStateChange((_event, session) => {
        // Defer: Supabase warns against awaiting other calls inside this callback.
        setTimeout(() => void load(session?.user ?? null), 0)
    })
}
