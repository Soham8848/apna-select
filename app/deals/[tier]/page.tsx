import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/supabase";
import { PRICE_TIERS, tierBySlug } from "@/lib/price-tiers";
import { inr } from "@/lib/commerce";
import { ProductBrowser } from "@/components/storefront/product-browser";
import { TrustBar } from "@/components/commerce/trust";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ tier: string }>;
}

/** Pre-render every tier — there are six and they are high-traffic landing pages. */
export function generateStaticParams() {
    return PRICE_TIERS.map((t) => ({ tier: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { tier: slug } = await params;
    const tier = tierBySlug(slug);
    if (!tier) return { title: "Deals" };

    return {
        title: tier.heading,
        description: `${tier.heading} on Apna Select — cash on delivery, free delivery over ₹499 and 7-day returns.`,
    };
}

export default async function DealsTierPage({ params }: PageProps) {
    const { tier: slug } = await params;
    const tier = tierBySlug(slug);
    if (!tier) notFound();

    const supabase = await createClient();
    let query = supabase.from("products").select("*").gte("price", tier.min);
    // Skip the upper bound on the open-ended premium tier.
    if (tier.max !== Number.MAX_SAFE_INTEGER) query = query.lte("price", tier.max);

    const { data } = await query.order("price", { ascending: true });
    const products = (data || []) as Product[];

    const cheapest = products[0]?.price;

    return (
        <>
            <section className="brand-slab">
                <div className="shell py-10">
                    <nav aria-label="Breadcrumb" className="mb-3 text-xs text-white/70">
                        <Link href="/" className="hover:text-white hover:underline">
                            Home
                        </Link>
                        <span className="mx-1.5">/</span>
                        <span className="font-semibold text-white">{tier.label}</span>
                    </nav>

                    <h1 className="font-display text-[clamp(1.6rem,6vw,2.75rem)] font-extrabold leading-tight tracking-tight text-white">
                        {tier.heading}
                    </h1>
                    <p className="mt-2 max-w-lg text-sm text-white/80">
                        {products.length} {products.length === 1 ? "product" : "products"}
                        {cheapest !== undefined && <> · starting at {inr(cheapest)}</>} · cash on
                        delivery available
                    </p>
                </div>
            </section>

            {/* Sideways tier switcher, so a shopper who finds this band too cheap or
                too dear can move bands without going back to the homepage. */}
            <div className="shell pt-6">
                <div className="rail -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
                    {PRICE_TIERS.map((t) => (
                        <Link
                            key={t.slug}
                            href={`/deals/${t.slug}`}
                            aria-current={t.slug === tier.slug}
                            className={
                                t.slug === tier.slug
                                    ? "rounded-full border border-accent bg-accent px-4 py-2 text-xs font-bold text-accent-foreground"
                                    : "rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                            }
                        >
                            {t.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="shell py-8">
                {products.length > 0 ? (
                    <ProductBrowser products={products} />
                ) : (
                    <div className="rounded-xl border border-dashed border-border py-16 text-center">
                        <p className="font-display text-lg font-extrabold">
                            Nothing in this range right now
                        </p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                            Try the next band up, or browse the full catalogue.
                        </p>
                        <Link
                            href="/products"
                            className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground"
                        >
                            Browse all products
                        </Link>
                    </div>
                )}
            </div>

            <TrustBar />
        </>
    );
}
