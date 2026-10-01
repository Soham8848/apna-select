import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PRICE_TIERS } from "@/lib/price-tiers";

/**
 * "Deals for every budget" — shop-by-price entry points.
 *
 * Each tile shows a live count so the shopper knows there is something behind
 * it before they tap, and a tier with nothing in it is hidden rather than
 * leading to an empty shelf.
 */
export function BudgetTiers({ prices }: { prices: number[] }) {
    const tiers = PRICE_TIERS.map((tier) => ({
        ...tier,
        count: prices.filter((p) => p >= tier.min && p <= tier.max).length,
    })).filter((t) => t.count > 0);

    if (!tiers.length) return null;

    return (
        <div className="rail -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible lg:px-0">
            {tiers.map((tier) => (
                <Link
                    key={tier.slug}
                    href={`/deals/${tier.slug}`}
                    className={`group relative w-[136px] overflow-hidden rounded-xl bg-gradient-to-br ${tier.gradient} p-4 text-white shadow-tile transition-transform hover:-translate-y-0.5 lg:w-auto`}
                >
                    <span
                        aria-hidden
                        className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-white/15 blur-xl"
                    />
                    <p className="relative font-display text-lg font-extrabold leading-tight">
                        {tier.label}
                    </p>
                    <p className="relative mt-1 text-[11px] font-semibold text-white/75">
                        {tier.count} {tier.count === 1 ? "product" : "products"}
                    </p>
                    <span className="relative mt-3 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide">
                        Shop
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                </Link>
            ))}
        </div>
    );
}
