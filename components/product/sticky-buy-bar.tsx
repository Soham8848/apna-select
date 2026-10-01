"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

import { useCart } from "@/store/use-cart";
import { Product } from "@/types/supabase";
import { Price } from "@/components/commerce/price";
import { stockState } from "@/lib/commerce";

/**
 * Mobile sticky purchase bar.
 *
 * On a phone the buy button scrolls out of view the moment someone reads the
 * description or the reviews — exactly when they decide to buy. Keeping price
 * and action permanently in the thumb zone is one of the single highest-impact
 * mobile commerce patterns there is.
 */
export function StickyBuyBar({ product }: { product: Product }) {
    const router = useRouter();
    const addItem = useCart((s) => s.addItem);
    const stock = stockState(product.inventory_count);

    const line = {
        id: product.id.toString(),
        title: product.title,
        price: product.price,
        compare_at_price: product.compare_at_price,
        image: product.images?.[0] || product.image_url || "",
        category: product.category,
    };

    return (
        <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                    <Price price={product.price} compareAt={product.compare_at_price} size="md" />
                </div>
                {stock.inStock ? (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                addItem(line, 1);
                                useCart.getState().onOpen();
                            }}
                            className="h-11 rounded-xl border-2 border-border px-4 text-xs font-bold uppercase"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                addItem(line, 1);
                                router.push("/checkout");
                            }}
                            className="flex h-11 items-center gap-1.5 rounded-xl bg-accent px-5 text-xs font-bold uppercase text-accent-foreground shadow-cta"
                        >
                            <Zap className="size-3.5" />
                            Buy now
                        </button>
                    </div>
                ) : (
                    <span className="rounded-xl bg-muted px-4 py-3 text-xs font-bold text-muted-foreground">
                        Out of stock
                    </span>
                )}
            </div>
        </div>
    );
}
