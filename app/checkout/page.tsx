"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock } from "lucide-react"

import { CheckoutSummary } from "@/components/checkout/checkout-summary"
import { AddressSelection } from "@/components/checkout/address-selection"
import { PaymentForm } from "@/components/checkout/payment-form"
import { PaymentMethod } from "@/lib/commerce"

/**
 * Checkout.
 *
 * The payment method lives here rather than inside PaymentForm, because the
 * order summary has to react to it — picking cash on delivery adds a handling
 * fee, and the shopper must see that total update before they commit, not
 * discover it afterwards.
 *
 * Deliberately stripped back: no category nav, no promos, no distractions.
 * Every link that is not "complete this order" is a way to lose the sale.
 */
export default function CheckoutPage() {
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null)
    const [method, setMethod] = useState<PaymentMethod>("prepaid")

    const steps = [
        { n: 1, label: "Delivery address", done: !!selectedAddress },
        { n: 2, label: "Payment", done: false },
    ]

    return (
        <div className="shell py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Checkout
                </h1>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Lock className="size-3.5 text-trust" />
                    Secure · 256-bit encrypted
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
                <div className="space-y-5">
                    {steps.map((step) => {
                        const isAddress = step.n === 1
                        const locked = !isAddress && !selectedAddress

                        return (
                            <section
                                key={step.n}
                                aria-labelledby={`step-${step.n}`}
                                className={
                                    locked
                                        ? "rounded-xl border border-border bg-card opacity-60"
                                        : "rounded-xl border border-border bg-card"
                                }
                            >
                                <h2
                                    id={`step-${step.n}`}
                                    className="flex items-center gap-2.5 border-b border-border px-5 py-4"
                                >
                                    <span
                                        className={
                                            step.done
                                                ? "grid size-7 shrink-0 place-items-center rounded-full bg-trust text-xs font-bold text-trust-foreground"
                                                : "grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white"
                                        }
                                    >
                                        {step.done ? "✓" : step.n}
                                    </span>
                                    <span className="font-display text-base font-extrabold">
                                        {step.label}
                                    </span>
                                </h2>

                                <div className={locked ? "pointer-events-none p-5" : "p-5"}>
                                    {isAddress ? (
                                        <AddressSelection onSelect={(addr) => setSelectedAddress(addr)} />
                                    ) : (
                                        <PaymentForm
                                            address={selectedAddress}
                                            method={method}
                                            onMethodChange={setMethod}
                                        />
                                    )}
                                </div>
                            </section>
                        )
                    })}

                    <p className="text-center text-xs text-muted-foreground">
                        By placing this order you agree to our{" "}
                        <Link href="/products" className="font-semibold underline hover:text-accent">
                            terms and return policy
                        </Link>
                        .
                    </p>
                </div>

                <div>
                    <CheckoutSummary method={method} />
                </div>
            </div>
        </div>
    )
}
