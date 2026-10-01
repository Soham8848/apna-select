/**
 * Shop-by-budget tiers.
 *
 * The single biggest structural idea worth taking from the budget-wholesale
 * playbook: a value shopper does not arrive thinking "I want a jewellery box",
 * they arrive thinking "what can I get for ₹99". A price filter buried behind a
 * Filters button cannot answer that question — a browsable entry point can.
 *
 * The bands are matched to the real catalogue (₹29–₹1,499, with a dense cluster
 * under ₹199) rather than copied from another store, so no tier lands empty.
 */
export interface PriceTier {
    slug: string;
    /** Short label for tiles and rails. */
    label: string;
    /** Longer heading used on the tier's own page. */
    heading: string;
    min: number;
    max: number;
    /** Tailwind gradient classes for the tile. */
    gradient: string;
}

export const PRICE_TIERS: PriceTier[] = [
    {
        slug: "under-99",
        label: "Under ₹99",
        heading: "Everything under ₹99",
        min: 0,
        max: 99,
        gradient: "from-violet-600 to-indigo-700",
    },
    {
        slug: "under-149",
        label: "Under ₹149",
        heading: "Everything under ₹149",
        min: 0,
        max: 149,
        gradient: "from-fuchsia-600 to-violet-700",
    },
    {
        slug: "under-199",
        label: "Under ₹199",
        heading: "Everything under ₹199",
        min: 0,
        max: 199,
        gradient: "from-rose-500 to-fuchsia-700",
    },
    {
        slug: "under-299",
        label: "Under ₹299",
        heading: "Everything under ₹299",
        min: 0,
        max: 299,
        gradient: "from-orange-500 to-rose-600",
    },
    {
        slug: "under-499",
        label: "Under ₹499",
        heading: "Everything under ₹499",
        min: 0,
        max: 499,
        gradient: "from-emerald-500 to-teal-700",
    },
    {
        slug: "premium",
        label: "₹500 & above",
        heading: "Premium picks, ₹500 and above",
        min: 500,
        max: Number.MAX_SAFE_INTEGER,
        gradient: "from-slate-700 to-violet-900",
    },
];

export function tierBySlug(slug: string | null | undefined): PriceTier | undefined {
    if (!slug) return undefined;
    return PRICE_TIERS.find((t) => t.slug === slug.toLowerCase());
}
