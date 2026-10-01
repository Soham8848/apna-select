"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, categoryByName } from "@/lib/categories";
import { Product } from "@/types/supabase";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

/**
 * Browsable catalogue with category tabs.
 *
 * Two fixes over the previous version: the tabs only list categories that have
 * products in them (no more tapping into an empty shelf), and "Load more"
 * actually reveals more products. Before, it ran a 1.5s fake spinner and then
 * showed the same grid — which is worse than having no button at all.
 */
export function ShopGrid({ products }: { products: Product[] }) {
    const [active, setActive] = useState("All");
    const [visible, setVisible] = useState(PAGE_SIZE);

    // Only tabs with stock behind them, ordered by our taxonomy.
    const tabs = useMemo(() => {
        const present = new Set(
            products.map((p) => p.category?.toLowerCase()).filter(Boolean)
        );
        const ordered = CATEGORIES.filter((c) => present.has(c.name.toLowerCase()));
        return [{ name: "All", hinglish: "Sab Kuch" }, ...ordered];
    }, [products]);

    const filtered = useMemo(() => {
        if (active === "All") return products;
        return products.filter(
            (p) => p.category?.toLowerCase() === active.toLowerCase()
        );
    }, [active, products]);

    const shown = filtered.slice(0, visible);

    const selectTab = (name: string) => {
        setActive(name);
        setVisible(PAGE_SIZE);
    };

    return (
        <div>
            <div className="rail -mx-4 mb-5 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                {tabs.map((tab) => {
                    const isActive = active === tab.name;
                    return (
                        <button
                            key={tab.name}
                            type="button"
                            onClick={() => selectTab(tab.name)}
                            aria-pressed={isActive}
                            className={cn(
                                "rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                                isActive
                                    ? "border-accent bg-accent text-accent-foreground"
                                    : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
                            )}
                        >
                            {tab.hinglish ?? tab.name}
                        </button>
                    );
                })}
            </div>

            {shown.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {shown.map((product, i) => (
                            <ProductCard key={product.id} product={product} priority={i < 4} />
                        ))}
                    </div>

                    {visible < filtered.length && (
                        <div className="mt-8 text-center">
                            <button
                                type="button"
                                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                                className="h-11 rounded-full border-2 border-border bg-card px-8 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
                            >
                                Load more ({filtered.length - visible} left)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                    <SearchX className="size-8 text-muted-foreground/40" />
                    <p className="font-semibold">
                        Nothing in {categoryByName(active)?.hinglish ?? active} yet
                    </p>
                    <p className="max-w-xs text-sm text-muted-foreground">
                        We restock weekly. Try another category meanwhile.
                    </p>
                    <button
                        type="button"
                        onClick={() => selectTab("All")}
                        className="mt-1 text-sm font-bold text-accent hover:underline"
                    >
                        Browse everything
                    </button>
                </div>
            )}
        </div>
    );
}
