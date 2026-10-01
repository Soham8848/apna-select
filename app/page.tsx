import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/supabase";
import { discountPercent } from "@/lib/commerce";

import { Hero } from "@/components/storefront/hero";
import { CategoryRail } from "@/components/storefront/category-rail";
import { ProductRail } from "@/components/storefront/product-rail";
import { ShopGrid } from "@/components/storefront/shop-grid";
import { SectionHeader } from "@/components/storefront/section-header";
import { DealCountdown } from "@/components/storefront/deal-countdown";
import { SocialProof, ReviewQuote } from "@/components/storefront/social-proof";
import { TrustBar } from "@/components/commerce/trust";

export const revalidate = 60;

/**
 * Homepage, ordered the way a shopper actually decides:
 *   1. Promise (announcement bar, in the layout)
 *   2. Offer            → hero
 *   3. Navigation       → category rail
 *   4. Urgency          → today's biggest discounts, with a real countdown
 *   5. Freshness        → new arrivals
 *   6. Depth            → full browsable catalogue
 *   7. Reassurance      → trust bar + genuine reviews
 *
 * Deals come before the full grid because a discount is the cheapest reason to
 * stop scrolling, and the grid is where someone who is already interested goes
 * to actually choose.
 */
export default async function Home() {
    const supabase = await createClient();

    const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    const products = (data || []) as Product[];

    const categoryNames = Array.from(
        new Set(products.map((p) => p.category).filter(Boolean))
    ) as string[];

    // Biggest genuine discounts first — no invented "deal" flag.
    const deals = products
        .map((p) => ({ p, pct: discountPercent(p.price, p.compare_at_price) ?? 0 }))
        .filter((x) => x.pct >= 20)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 12)
        .map((x) => x.p);

    const newArrivals = products.slice(0, 12);

    // Reviews power the social-proof section. The table may not exist on a
    // fresh Supabase project, so a failure here must not take the page down.
    let reviewQuotes: ReviewQuote[] = [];
    try {
        const { data: reviews } = await supabase
            .from("reviews")
            .select("id, rating, comment, author, product_id")
            .gte("rating", 4)
            .order("created_at", { ascending: false })
            .limit(6);

        if (reviews?.length) {
            const titleById = new Map(products.map((p) => [String(p.id), p.title]));
            reviewQuotes = reviews.map((r) => ({
                ...r,
                product_title: titleById.get(String(r.product_id)) ?? null,
            })) as ReviewQuote[];
        }
    } catch {
        // No reviews table yet — the section simply does not render.
    }

    return (
        <>
            <Hero />

            <section className="shell py-8">
                <SectionHeader
                    eyebrow="Browse"
                    title="Shop by category"
                    href="/products"
                    hrefLabel="All products"
                />
                <CategoryRail names={categoryNames} />
            </section>

            {deals.length > 0 && (
                <section className="bg-surface-sunken py-8">
                    <div className="shell">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="eyebrow mb-1">Limited time</p>
                                <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                                    Deals of the day
                                </h2>
                            </div>
                            <DealCountdown />
                        </div>
                        <ProductRail products={deals} />
                    </div>
                </section>
            )}

            {newArrivals.length > 0 && (
                <section className="shell py-10">
                    <SectionHeader
                        eyebrow="Just landed"
                        title="New arrivals"
                        subtitle="Fresh stock, added weekly."
                        href="/products"
                    />
                    <ProductRail products={newArrivals} />
                </section>
            )}

            <TrustBar />

            <section className="shell py-10" id="shop">
                <SectionHeader
                    eyebrow="Everything"
                    title="Shop the full catalogue"
                    subtitle={
                        products.length
                            ? `${products.length} products across ${categoryNames.length} categories`
                            : undefined
                    }
                />
                <ShopGrid products={products} />
            </section>

            <SocialProof reviews={reviewQuotes} />
        </>
    );
}
