"use client"

import { useState } from "react"
import { CheckoutSummary } from "@/components/checkout/checkout-summary"
import { AddressSelection } from "@/components/checkout/address-selection"
import { PaymentForm } from "@/components/checkout/payment-form"
import { FadeIn } from "@/components/ui/FadeIn"

export default function CheckoutPage() {
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Column: Steps */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Step 1: Address Selection */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm">1</span>
                                    Shipping Address
                                </h2>
                                <AddressSelection onSelect={(addr) => setSelectedAddressId(addr.id)} />
                            </div>

                            {/* Step 2: Payment */}
                            <div className={`bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm transition-opacity ${!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}`}>
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm">2</span>
                                    Payment
                                </h2>
                                <PaymentForm addressId={selectedAddressId} />
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="lg:col-span-5">
                            <CheckoutSummary />
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    )
}
