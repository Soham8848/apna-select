import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/supabase";
import { categoryBySlug } from "@/lib/categories";
import { ProductBrowser } from "@/components/storefront/product-browser";
import { CategoryRail } from "@/components/storefront/category-rail";
import { TrustBar } from "@/components/commerce/trust";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string }>;
}

/**
 * Resolve a URL segment to the category name stored in Supabase.
 *
 * This is the fix for a real breakage: the page used to query
 * `ilike('category', slug)` directly, so a tidy URL like `/category/home-gift`
 * searched for the literal string "home-gift" while the column holds
 * "Home & Gift" — the page rendered "coming soon" over a shelf that was
 * actually full. We map through the taxonomy first and only fall back to the
 * raw segment for categories not in our list.
 */
async function resolve(slug: string) {
    const known = categoryBySlug(slug);
    return {
        dbName: known?.name ?? decodeURIComponent(slug),
        display: known?.hinglish ?? decodeURIComponent(slug),
        english: known?.name ?? decodeURIComponent(slug),
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const { english } = await resolve(slug);
    return {
        title: english,
        description: `Shop ${english} on Apna Select. Free delivery over ₹499, cash on delivery and 7-day returns.`,
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const { dbName, display, english } = await resolve(slug);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("category", dbName)
        .order("created_at", { ascending: false });

    if (error) console.error("Error fetching category products:", error.message);

    const products = (data || []) as Product[];

    return (
        <>
            <div className="shell py-8">
                <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
                    <Link href="/" className="hover:text-accent hover:underline">
                        Home
                    </Link>
                    <span className="mx-1.5">/</span>
                    <Link href="/products" className="hover:text-accent hover:underline">
                        Products
                    </Link>
                    <span className="mx-1.5">/</span>
                    <span className="font-semibold text-foreground">{english}</span>
                </nav>

                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {display}
                </h1>
                {display !== english && (
                    <p className="mt-1 text-sm text-muted-foreground">{english}</p>
                )}

                {products.length > 0 ? (
                    <div className="mt-8">
                        <ProductBrowser products={products} />
                    </div>
                ) : (
                    <div className="mt-8 rounded-xl border border-dashed border-border py-16 text-center">
                        <p className="font-display text-lg font-extrabold">
                            New {english} stock is on the way
                        </p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                            This shelf is being restocked. Browse everything else meanwhile —
                            we add new products every week.
                        </p>
                        <Link
                            href="/products"
                            className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground transition hover:brightness-95"
                        >
                            Browse all products
                        </Link>
                    </div>
                )}

                <div className="mt-12">
                    <p className="eyebrow mb-3">Other categories</p>
                    <CategoryRail />
                </div>
            </div>

            <TrustBar />
        </>
    );
}
