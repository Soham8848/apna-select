"use client";

import { useMemo, useState } from "react";
import { PackageOpen, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import { discountPercent } from "@/lib/commerce";
import { Product } from "@/types/supabase";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

const SORTS = {
    featured: { label: "Recommended", fn: () => 0 },
    priceAsc: { label: "Price: low to high", fn: (a: Product, b: Product) => a.price - b.price },
    priceDesc: { label: "Price: high to low", fn: (a: Product, b: Product) => b.price - a.price },
    discount: {
        label: "Biggest discount",
        fn: (a: Product, b: Product) =>
            (discountPercent(b.price, b.compare_at_price) ?? 0) -
            (discountPercent(a.price, a.compare_at_price) ?? 0),
    },
    rating: {
        label: "Top rated",
        fn: (a: Product, b: Product) => (b.average_rating ?? 0) - (a.average_rating ?? 0),
    },
} as const;

type SortKey = keyof typeof SORTS;

const PRICE_BANDS = [
    { label: "Under ₹500", min: 0, max: 499 },
    { label: "₹500 – ₹1,000", min: 500, max: 1000 },
    { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
    { label: "Over ₹2,500", min: 2500, max: Infinity },
] as const;

/**
 * Shared catalogue browser for /products, /category/[slug] and /search.
 *
 * The old listing pages were a bare grid with no sort and no filters, which
 * is a direct revenue leak: price sorting is the control shoppers reach for
 * first, and without it anyone with a budget in mind simply leaves.
 *
 * Filtering runs client-side over an already-fetched list. That is the right
 * trade-off at this catalogue size — instant, no spinners, no extra Supabase
 * round trips. If the catalogue grows past a few thousand SKUs this should
 * move to server-side queries with URL search params.
 */
export function ProductBrowser({ products }: { products: Product[] }) {
    const [sort, setSort] = useState<SortKey>("featured");
    const [band, setBand] = useState<number | null>(null);
    const [dealsOnly, setDealsOnly] = useState(false);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const result = useMemo(() => {
        let list = [...products];

        if (band !== null) {
            const { min, max } = PRICE_BANDS[band];
            list = list.filter((p) => p.price >= min && p.price <= max);
        }
        if (dealsOnly) {
            list = list.filter((p) => discountPercent(p.price, p.compare_at_price) !== null);
        }
        if (inStockOnly) {
            list = list.filter(
                (p) => p.inventory_count === null || p.inventory_count === undefined || p.inventory_count > 0
            );
        }

        if (sort !== "featured") list.sort(SORTS[sort].fn as (a: Product, b: Product) => number);
        return list;
    }, [products, band, dealsOnly, inStockOnly, sort]);

    const shown = result.slice(0, visible);
    const activeFilters = (band !== null ? 1 : 0) + (dealsOnly ? 1 : 0) + (inStockOnly ? 1 : 0);

    const reset = () => {
        setBand(null);
        setDealsOnly(false);
        setInStockOnly(false);
        setVisible(PAGE_SIZE);
    };

    return (
        <div>
            {/* Controls */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <p className="text-sm text-muted-foreground">
                    <span data-price className="font-bold text-foreground">
                        {result.length}
                    </span>{" "}
                    {result.length === 1 ? "product" : "products"}
                    {activeFilters > 0 && (
                        <button
                            type="button"
                            onClick={reset}
                            className="ml-2 font-bold text-accent hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setFiltersOpen((o) => !o)}
                        aria-expanded={filtersOpen}
                        className={cn(
                            "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors",
                            activeFilters > 0
                                ? "border-accent text-accent"
                                : "border-border hover:border-accent/50"
                        )}
                    >
                        <SlidersHorizontal className="size-3.5" />
                        Filters
                        {activeFilters > 0 && (
                            <span className="grid size-4 place-items-center rounded-full bg-accent text-[10px] text-accent-foreground">
                                {activeFilters}
                            </span>
                        )}
                    </button>

                    <label className="sr-only" htmlFor="sort">
                        Sort products
                    </label>
                    <select
                        id="sort"
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value as SortKey);
                            setVisible(PAGE_SIZE);
                        }}
                        className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {Object.entries(SORTS).map(([key, { label }]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filtersOpen && (
                <div className="mb-5 space-y-4 rounded-xl border border-border bg-surface-sunken p-4">
                    <div>
                        <p className="eyebrow mb-2">Price</p>
                        <div className="flex flex-wrap gap-2">
                            {PRICE_BANDS.map((b, i) => (
                                <button
                                    key={b.label}
                                    type="button"
                                    onClick={() => {
                                        setBand(band === i ? null : i);
                                        setVisible(PAGE_SIZE);
                                    }}
                                    aria-pressed={band === i}
                                    className={cn(
                                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                                        band === i
                                            ? "border-accent bg-accent text-accent-foreground"
                                            : "border-border bg-card hover:border-accent/50"
                                    )}
                                >
                                    {b.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {[
                            { label: "On offer only", value: dealsOnly, set: setDealsOnly },
                            { label: "In stock only", value: inStockOnly, set: setInStockOnly },
                        ].map(({ label, value, set }) => (
                            <label
                                key={label}
                                className="flex cursor-pointer items-center gap-2 text-xs font-semibold"
                            >
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => {
                                        set(e.target.checked);
                                        setVisible(PAGE_SIZE);
                                    }}
                                    className="size-4 accent-[var(--accent)]"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {shown.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {shown.map((product, i) => (
                            <ProductCard key={product.id} product={product} priority={i < 5} />
                        ))}
                    </div>

                    {visible < result.length && (
                        <div className="mt-8 text-center">
                            <button
                                type="button"
                                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                                className="h-11 rounded-full border-2 border-border bg-card px-8 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
                            >
                                Load more ({result.length - visible} left)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
                    <PackageOpen className="size-9 text-muted-foreground/40" />
                    <p className="font-semibold">No products match these filters</p>
                    <p className="max-w-xs text-sm text-muted-foreground">
                        Try widening your price range or clearing the filters.
                    </p>
                    {activeFilters > 0 && (
                        <button
                            type="button"
                            onClick={reset}
                            className="mt-1 text-sm font-bold text-accent hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
