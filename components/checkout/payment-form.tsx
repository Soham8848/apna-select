"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Banknote, Loader2, Lock, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { load } from "@cashfreepayments/cashfree-js"

import { useCart } from "@/store/use-cart"
import { inr, orderTotals, PaymentMethod, COD_FEE } from "@/lib/commerce"
import { cn } from "@/lib/utils"

interface PaymentFormProps {
    address: any | null
    method: PaymentMethod
    onMethodChange: (method: PaymentMethod) => void
}

const OPTIONS = [
    {
        id: "prepaid" as PaymentMethod,
        icon: Smartphone,
        title: "Pay online",
        detail: "UPI, cards, netbanking & wallets",
        // Prepaid is nudged first: it removes RTO risk entirely, which is the
        // single biggest cost in Indian dropshipping.
        badge: "Free delivery eligible",
    },
    {
        id: "cod" as PaymentMethod,
        icon: Banknote,
        title: "Cash on delivery",
        detail: "Pay the courier when it arrives",
        badge: `+${inr(COD_FEE)} handling fee`,
    },
]

export function PaymentForm({ address, method, onMethodChange }: PaymentFormProps) {
    const cart = useCart()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)

    const totals = orderTotals(cart.items, method)

    const handlePayment = async () => {
        if (!address) {
            toast.error("Please add a delivery address first.")
            return
        }
        if (cart.items.length === 0) {
            toast.error("Your cart is empty.")
            return
        }

        setIsProcessing(true)

        const addressSnapshot = {
            line_1: address.address_line1,
            line_2: address.address_line2 || "",
            city: address.city,
            state: address.state,
            pincode: address.postal_code ?? address.zip_code,
        }

        // Only ids and quantities are sent. The server re-prices the order from
        // the database, so nothing here can change what gets charged.
        const payload = {
            items: cart.items.map((i) => ({ id: i.id, quantity: i.quantity })),
            addressSnapshot,
            name: address.full_name,
            email: address.email,
            phone: address.phone,
        }

        try {
            if (method === "cod") {
                const response = await fetch("/api/create-cod-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                const data = await response.json()
                if (data.error) throw new Error(data.error)

                if (data.success) {
                    cart.clearCart()
                    toast.success("Order placed. We'll be in touch shortly.")
                    router.push("/checkout/success")
                    return
                }
                throw new Error("Could not place the order. Please try again.")
            }

            const response = await fetch("/api/checkout/cashfree", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.error) throw new Error(data.error)

            const cashfree = await load({
                mode:
                    process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT?.trim().toUpperCase() ===
                    "PRODUCTION"
                        ? "production"
                        : "sandbox",
            })

            if (!cashfree) throw new Error("Could not open the payment window.")

            cashfree.checkout({
                paymentSessionId: data.payment_session_id,
                returnUrl: `${window.location.origin}/api/checkout/verify?order_id={order_id}`,
            })
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    const disabled = isProcessing || totals.total === 0 || !address

    return (
        <div className="space-y-4">
            <fieldset className="space-y-2.5">
                <legend className="sr-only">Payment method</legend>
                {OPTIONS.map(({ id, icon: Icon, title, detail, badge }) => {
                    const selected = method === id
                    return (
                        <label
                            key={id}
                            className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors",
                                selected
                                    ? "border-accent bg-accent/5"
                                    : "border-border hover:border-accent/40"
                            )}
                        >
                            <input
                                type="radio"
                                name="payment-method"
                                value={id}
                                checked={selected}
                                onChange={() => onMethodChange(id)}
                                className="mt-1 size-4 accent-[var(--accent)]"
                            />
                            <Icon
                                className={cn(
                                    "mt-0.5 size-5 shrink-0",
                                    selected ? "text-accent" : "text-muted-foreground"
                                )}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold">{title}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
                                <p
                                    className={cn(
                                        "mt-1.5 text-[11px] font-bold",
                                        id === "prepaid" ? "text-trust" : "text-muted-foreground"
                                    )}
                                >
                                    {badge}
                                </p>
                            </div>
                        </label>
                    )
                })}
            </fieldset>

            <button
                type="button"
                onClick={handlePayment}
                disabled={disabled}
                className={cn(
                    "flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent text-base font-bold uppercase tracking-wide text-accent-foreground shadow-cta transition",
                    "hover:brightness-95 active:scale-[0.99]",
                    "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                )}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="size-5 animate-spin" />
                        Processing…
                    </>
                ) : method === "cod" ? (
                    <>Place order · {inr(totals.total)}</>
                ) : (
                    <>
                        <Lock className="size-4" />
                        Pay {inr(totals.total)}
                    </>
                )}
            </button>

            {!address && (
                <p className="text-center text-xs text-muted-foreground">
                    Add a delivery address above to continue.
                </p>
            )}
        </div>
    )
}
