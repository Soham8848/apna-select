import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/supabase";
import { ProductBrowser } from "@/components/storefront/product-browser";
import { CategoryRail } from "@/components/storefront/category-rail";

export const metadata: Metadata = {
    title: "Search",
    robots: { index: false, follow: true },
};

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const query = (q || "").trim();

    let products: Product[] = [];

    if (query) {
        const supabase = await createClient();
        // Search titles AND descriptions — a shopper typing "power bank" should
        // still find "20000mAh Transparent Charger" when the phrase only appears
        // in the description. Commas are escaped because PostgREST's `or`
        // filter treats them as argument separators.
        const safe = query.replace(/[,()]/g, " ").trim();
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .or(`title.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`)
            .limit(200);

        if (error) console.error("Search failed:", error.message);
        products = (data || []) as Product[];
    }

    return (
        <div className="shell py-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {query ? (
                    <>
                        Results for &ldquo;<span className="text-accent">{query}</span>&rdquo;
                    </>
                ) : (
                    "Search the store"
                )}
            </h1>

            {query && products.length > 0 && (
                <div className="mt-8">
                    <ProductBrowser products={products} />
                </div>
            )}

            {query && products.length === 0 && (
                <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                    <SearchX className="size-9 text-muted-foreground/40" />
                    <p className="font-semibold">Nothing matched &ldquo;{query}&rdquo;</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Check the spelling, try a shorter word, or browse a category below.
                    </p>
                    <Link
                        href="/products"
                        className="mt-2 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground transition hover:brightness-95"
                    >
                        Browse all products
                    </Link>
                </div>
            )}

            <div className="mt-12">
                <p className="eyebrow mb-3">Shop by category</p>
                <CategoryRail />
            </div>
        </div>
    );
}
