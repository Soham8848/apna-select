"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ImageOff, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Price } from "@/components/commerce/price";
import { Rating } from "@/components/commerce/rating";
import { discountPercent, stockState } from "@/lib/commerce";
import { useCart } from "@/store/use-cart";
import { Product } from "@/types/supabase";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: Product;
    /** Above-the-fold tiles get priority loading; the rest stay lazy. */
    priority?: boolean;
}

/**
 * The storefront's workhorse. Every element here is doing a job:
 * discount flag (why look), image (what is it), rating (do others like it),
 * title, price, and a single accent CTA (what to do next).
 *
 * The previous version hardcoded `bg-zinc-900/40` and `text-white`, which
 * rendered white titles on the near-white light-mode page background — the
 * product names were literally invisible. Everything is on theme tokens now,
 * so it is correct in both themes by construction.
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
    const cart = useCart();
    const [added, setAdded] = useState(false);

    const image = product.images?.[0] || product.image_url || "";
    const pct = discountPercent(product.price, product.compare_at_price);
    const stock = stockState(product.inventory_count);

    const handleAdd = (e: React.MouseEvent) => {
        // The whole tile is a link, so the button must not navigate.
        e.preventDefault();
        e.stopPropagation();
        if (!stock.inStock) return;

        cart.addItem({
            id: product.id.toString(),
            title: product.title,
            price: product.price,
            compare_at_price: product.compare_at_price,
            image,
            category: product.category,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);

        toast.success("Added to cart", {
            description: product.title,
            action: { label: "View cart", onClick: () => cart.onOpen() },
        });
    };

    return (
        <Link
            href={`/products/${product.id}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-tile transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-tile-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
            <div className="relative aspect-square overflow-hidden bg-surface-sunken">
                {image ? (
                    <Image
                        src={image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        priority={priority}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/30">
                        <ImageOff className="size-7" />
                    </div>
                )}

                {/* Savings flag — the single strongest reason to stop scrolling */}
                {pct !== null && (
                    <span className="absolute left-0 top-2.5 rounded-r-md bg-urgent px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-urgent-foreground shadow-sm">
                        {pct}% off
                    </span>
                )}

                {!stock.inStock && (
                    <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-[2px]">
                        <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background">
                            Out of stock
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-3">
                <Rating value={product.average_rating} count={product.review_count} />

                <h3
                    className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground"
                    title={product.title}
                >
                    {product.title}
                </h3>

                {/* mt-auto pins price + CTA to the bottom so tiles align in a row
                    even when titles wrap to different heights */}
                <div className="mt-auto space-y-2.5 pt-1">
                    <Price price={product.price} compareAt={product.compare_at_price} />

                    {stock.tone === "urgent" && stock.inStock && (
                        <p className="text-[11px] font-bold text-urgent">{stock.label}</p>
                    )}

                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!stock.inStock}
                        aria-label={`Add ${product.title} to cart`}
                        className={cn(
                            "flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors",
                            "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
                            added
                                ? "bg-trust text-trust-foreground"
                                : "bg-accent text-accent-foreground hover:brightness-95 active:brightness-90"
                        )}
                    >
                        {added ? (
                            <>
                                <Check className="size-4" /> Added
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="size-4" /> Add
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}
