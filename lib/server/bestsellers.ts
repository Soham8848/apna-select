import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Best-selling product ids, most-sold first, computed from real `order_items`.
 *
 * Derived from actual sales rather than a hand-set "featured" flag, so the
 * badge is true and keeps working on repeat visitors.
 *
 * Reads with the service-role client: `order_items` is private per shopper
 * under RLS, and only the aggregated product ids ever leave this function.
 *
 * Returns an empty list on any failure: a badge is a nice-to-have and must
 * never be able to break a page.
 */
export async function bestsellerIds(limit = 10): Promise<string[]> {
    try {
        const supabase = createAdminClient() ?? createPublicClient();
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
