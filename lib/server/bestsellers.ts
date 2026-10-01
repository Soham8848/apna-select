import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Best-selling product ids, most-sold first, computed from real `order_items`.
 *
 * Deliberately derived from actual sales rather than a hand-set "featured"
 * flag. It is the one piece of social proof that needs no reviews to exist, it
 * sharpens itself as the store grows, and — unlike a invented "11 people have
 * this in their cart" counter — it is true, so it keeps working on repeat
 * visitors instead of training them to distrust the badges.
 *
 * Returns an empty list on any failure: a badge is a nice-to-have and must
 * never be able to break a page.
 */
export async function bestsellerIds(
    supabase: SupabaseClient,
    limit = 10
): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .limit(2000);

        if (error || !data?.length) return [];

        const sold = new Map<string, number>();
        for (const row of data) {
            const id = String(row.product_id ?? "");
            if (!id) continue;
            const qty = Number(row.quantity) || 0;
            sold.set(id, (sold.get(id) ?? 0) + qty);
        }

        return [...sold.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);
    } catch {
        return [];
    }
}
