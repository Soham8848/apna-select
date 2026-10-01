"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

/**
 * Wishlist writes.
 *
 * The /favorites page already read a `favorites` table, but nothing in the app
 * could ever write to it — the wishlist was a permanently empty screen. These
 * actions close that loop.
 *
 * A wishlist matters commercially beyond convenience: it is a saved-intent
 * list, which is the cheapest remarketing audience a store has.
 */
export async function toggleFavorite(productId: string | number): Promise<{
    ok: boolean
    favorited?: boolean
    error?: string
}> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { ok: false, error: "Please sign in to save items." }

    const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle()

    if (existing) {
        const { error } = await supabase.from("favorites").delete().eq("id", existing.id)
        if (error) return { ok: false, error: "Could not remove from wishlist." }
        revalidatePath("/favorites")
        return { ok: true, favorited: false }
    }

    const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: productId })

    if (error) return { ok: false, error: "Could not add to wishlist." }

    revalidatePath("/favorites")
    return { ok: true, favorited: true }
}

/** Ids the signed-in shopper has saved. Empty for guests. */
export async function getFavoriteIds(): Promise<string[]> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id)

    return (data || []).map((r) => String(r.product_id))
}
