"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/store/use-cart";
import { Product } from "@/types/supabase";
import { stockState } from "@/lib/commerce";
import { cn } from "@/lib/utils";

/**
 * Quantity stepper + the two actions that matter.
 *
 * "Add to cart" keeps the shopper browsing; "Buy now" sends them straight to
 * checkout. Offering both raises AOV and conversion at the same time, because
 * the two shopper types want opposite things and a single button forces one of
 * them to work against their instinct.
 *
 * Only "Buy now" is the accent colour. Two equally loud CTAs is the same as
 * none — the shopper has to stop and choose instead of acting.
 */
export function BuyBox({ product, max }: { product: Product; max?: number | null }) {
    const router = useRouter();
    const addItem = useCart((s) => s.addItem);
    const [qty, setQty] = useState(1);

    const stock = stockState(product.inventory_count);
    // Cap the stepper at real stock when we track it, otherwise allow a
    // sensible per-order ceiling.
    const ceiling = typeof max === "number" && max > 0 ? Math.min(max, 10) : 10;

    const line = {
        id: product.id.toString(),
        title: product.title,
        price: product.price,
        compare_at_price: product.compare_at_price,
        image: product.images?.[0] || product.image_url || "",
        category: product.category,
    };

    const add = () => {
        addItem(line, qty);
        toast.success(`Added ${qty} × ${product.title}`, {
            action: { label: "View cart", onClick: () => useCart.getState().onOpen() },
        });
    };

    const buyNow = () => {
        addItem(line, qty);
        router.push("/checkout");
    };

    if (!stock.inStock) {
        return (
            <div className="rounded-xl border border-border bg-surface-sunken p-4 text-center">
                <p className="font-bold">Currently out of stock</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    This item is being restocked. Check back soon.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center rounded-lg border border-border">
                    <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                        className="grid size-9 place-items-center rounded-l-lg transition-colors hover:bg-secondary disabled:opacity-40"
                    >
                        <Minus className="size-4" />
                    </button>
                    <span data-price className="w-10 text-center text-sm font-bold">
                        {qty}
                    </span>
                    <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(ceiling, q + 1))}
                        disabled={qty >= ceiling}
                        aria-label="Increase quantity"
                        className="grid size-9 place-items-center rounded-r-lg transition-colors hover:bg-secondary disabled:opacity-40"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
                {qty >= ceiling && (
                    <span className="text-xs text-muted-foreground">Max {ceiling} per order</span>
                )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <button
                    type="button"
                    onClick={add}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-transparent text-sm font-bold uppercase tracking-wide transition-colors hover:bg-secondary dark:border-border"
                >
                    <ShoppingCart className="size-4" />
                    Add to cart
                </button>
                <button
                    type="button"
                    onClick={buyNow}
                    className={cn(
                        "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-cta transition-all",
                        "hover:brightness-95 active:scale-[0.99]"
                    )}
                >
                    <Zap className="size-4" />
                    Buy now
                </button>
            </div>
        </div>
    );
}
