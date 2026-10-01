"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react"

import { useCart } from "@/store/use-cart"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TrustChips } from "@/components/commerce/trust"
import { inr, orderTotals } from "@/lib/commerce"

export function CartSheet() {
    const cart = useCart()
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const totals = orderTotals(cart.items)
    const count = cart.items.reduce((n, i) => n + i.quantity, 0)

    const onCheckout = () => {
        cart.onClose()
        router.push("/checkout")
    }

    return (
        <Sheet open={cart.isOpen} onOpenChange={(open) => (open ? cart.onOpen() : cart.onClose())}>
            <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border px-4 py-4">
                    <SheetTitle className="font-display text-base font-extrabold">
                        Your cart {count > 0 && <span className="text-muted-foreground">({count})</span>}
                    </SheetTitle>
                </SheetHeader>

                {cart.items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <ShoppingBag className="size-16 text-muted-foreground/20" />
                        <div>
                            <p className="font-bold">Your cart is empty</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add something you like and it will show up here.
                            </p>
                        </div>
                        <Link
                            href="/products"
                            onClick={() => cart.onClose()}
                            className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground transition hover:brightness-95"
                        >
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Free-delivery nudge. Telling someone they are ₹80 away from
                            free delivery reliably lifts basket size, and it is an
                            honest offer rather than a pressure tactic. */}
                        <div className="border-b border-border bg-surface-sunken px-4 py-3">
                            {totals.qualifiesFreeShipping ? (
                                <p className="flex items-center gap-2 text-xs font-bold text-trust">
                                    <Truck className="size-4" />
                                    Free delivery unlocked
                                </p>
                            ) : (
                                <>
                                    <p className="flex items-center gap-2 text-xs font-semibold">
                                        <Truck className="size-4 text-accent" />
                                        Add{" "}
                                        <span data-price className="font-extrabold text-accent">
                                            {inr(totals.freeShippingShortfall)}
                                        </span>{" "}
                                        more for free delivery
                                    </p>
                                    <div
                                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
                                        role="progressbar"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={Math.round(
                                            (totals.subtotal / (totals.subtotal + totals.freeShippingShortfall)) * 100
                                        )}
                                    >
                                        <div
                                            className="h-full rounded-full bg-accent transition-all duration-500"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    (totals.subtotal /
                                                        (totals.subtotal + totals.freeShippingShortfall)) *
                                                        100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <ul className="flex-1 divide-y divide-border overflow-y-auto px-4">
                            {cart.items.map((item) => (
                                <li key={item.id} className="flex gap-3 py-4">
                                    <Link
                                        href={`/products/${item.id}`}
                                        onClick={() => cart.onClose()}
                                        className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-sunken"
                                    >
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        )}
                                    </Link>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <Link
                                            href={`/products/${item.id}`}
                                            onClick={() => cart.onClose()}
                                            className="line-clamp-2 text-sm font-semibold hover:text-accent"
                                        >
                                            {item.title}
                                        </Link>

                                        <div className="mt-1 flex items-baseline gap-2">
                                            <span data-price className="text-sm font-extrabold">
                                                {inr(item.price * item.quantity)}
                                            </span>
                                            {item.quantity > 1 && (
                                                <span data-price className="text-xs text-muted-foreground">
                                                    {inr(item.price)} each
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            <div className="flex items-center rounded-lg border border-border">
                                                <button
                                                    type="button"
                                                    onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                                    aria-label={`Reduce quantity of ${item.title}`}
                                                    className="grid size-8 place-items-center rounded-l-lg transition-colors hover:bg-secondary"
                                                >
                                                    <Minus className="size-3.5" />
                                                </button>
                                                <span data-price className="w-8 text-center text-xs font-bold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                                    aria-label={`Increase quantity of ${item.title}`}
                                                    className="grid size-8 place-items-center rounded-r-lg transition-colors hover:bg-secondary"
                                                >
                                                    <Plus className="size-3.5" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => cart.removeItem(item.id)}
                                                aria-label={`Remove ${item.title}`}
                                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-urgent-subtle hover:text-urgent"
                                            >
                                                <Trash2 className="size-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-3 border-t border-border bg-surface px-4 py-4">
                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span data-price className="font-semibold">
                                        {inr(totals.subtotal)}
                                    </span>
                                </div>
                                {totals.productDiscount > 0 && (
                                    <div className="flex justify-between text-trust">
                                        <span>Discount applied</span>
                                        <span data-price className="font-semibold">
                                            −{inr(totals.productDiscount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery</span>
                                    {totals.shipping === 0 ? (
                                        <span className="font-semibold text-trust">Free</span>
                                    ) : (
                                        <span data-price className="font-semibold">
                                            {inr(totals.shipping)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold">
                                    <span>Total</span>
                                    <span data-price>{inr(totals.total)}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onCheckout}
                                className="h-12 w-full rounded-xl bg-accent text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-cta transition hover:brightness-95"
                            >
                                Checkout · {inr(totals.total)}
                            </button>

                            <TrustChips className="justify-center" />
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
