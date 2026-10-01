"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Lock } from "lucide-react"

import { useCart } from "@/store/use-cart"
import { inr, orderTotals, PaymentMethod } from "@/lib/commerce"
import { TrustChips } from "@/components/commerce/trust"

/**
 * Order summary. Reads from the same `orderTotals` the cart drawer and the
 * server pricing use, so the shopper sees one consistent number from the
 * drawer through to the gateway. A total that changes between steps is the
 * classic reason carts get abandoned at the last moment.
 */
export function CheckoutSummary({ method = "prepaid" }: { method?: PaymentMethod }) {
    const cart = useCart()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const totals = orderTotals(cart.items, method)

    if (cart.items.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="font-bold">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add a product before checking out.
                </p>
                <Link
                    href="/products"
                    className="mt-4 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground"
                >
                    Browse products
                </Link>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card lg:sticky lg:top-28">
            <div className="border-b border-border px-5 py-4">
                <h2 className="font-display text-base font-extrabold">Order summary</h2>
            </div>

            <ul className="max-h-[36vh] divide-y divide-border overflow-y-auto px-5">
                {cart.items.map((item) => (
                    <li key={item.id} className="flex gap-3 py-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-sunken">
                            {item.image && (
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold">{item.title}</p>
                            <p data-price className="mt-0.5 text-xs text-muted-foreground">
                                Qty {item.quantity}
                            </p>
                        </div>
                        <span data-price className="text-sm font-bold">
                            {inr(item.price * item.quantity)}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="space-y-2 border-t border-border px-5 py-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-price className="font-semibold">{inr(totals.subtotal)}</span>
                </div>

                {totals.productDiscount > 0 && (
                    <div className="flex justify-between text-trust">
                        <span>Discount</span>
                        <span data-price className="font-semibold">−{inr(totals.productDiscount)}</span>
                    </div>
                )}

                <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    {totals.shipping === 0 ? (
                        <span className="font-semibold text-trust">Free</span>
                    ) : (
                        <span data-price className="font-semibold">{inr(totals.shipping)}</span>
                    )}
                </div>

                {totals.codFee > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash on delivery fee</span>
                        <span data-price className="font-semibold">{inr(totals.codFee)}</span>
                    </div>
                )}

                <div className="flex items-baseline justify-between border-t border-border pt-3">
                    <span className="font-display text-base font-extrabold">Total</span>
                    <div className="text-right">
                        <span data-price className="font-display text-xl font-extrabold">
                            {inr(totals.total)}
                        </span>
                        <p className="text-[11px] text-muted-foreground">Inclusive of all taxes</p>
                    </div>
                </div>

                {totals.productDiscount > 0 && (
                    <p className="rounded-lg bg-trust-subtle px-3 py-2 text-center text-xs font-bold text-trust">
                        You save {inr(totals.productDiscount)} on this order
                    </p>
                )}
            </div>

            <div className="space-y-3 border-t border-border px-5 py-4">
                <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Lock className="size-3.5 text-trust" />
                    Secure checkout · payments handled by Cashfree
                </p>
                <TrustChips className="justify-center" />
            </div>
        </div>
    )
}
