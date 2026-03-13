"use client"

import { useState } from "react"
import { useCart } from "@/store/use-cart"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { CreditCard, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"
import { load } from "@cashfreepayments/cashfree-js"

interface PaymentFormProps {
    address: any | null
}

export function PaymentForm({ address }: PaymentFormProps) {
    const cart = useCart()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cashfree' | 'cod'>('cashfree')

    const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const handlePayment = async () => {
        if (!address) {
            toast.error("Please select a shipping address first.")
            return
        }

        setIsProcessing(true)

        const addressSnapshot = {
            line_1: address.address_line1,
            line_2: address.address_line2 || '',
            city: address.city,
            state: address.state,
            pincode: address.zip_code
        }

        const payload = {
            items: cart.items,
            addressSnapshot,
            name: address.full_name,
            email: address.email,
            phone: address.phone
        }

        try {
            if (paymentMethod === 'cod') {
                // Handle Cash on Delivery
                const response = await fetch("/api/create-cod-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })

                const data = await response.json()

                if (data.error) {
                    throw new Error(data.error)
                }

                if (data.success) {
                    cart.clearCart()
                    toast.success("Order placed successfully!")
                    router.push("/checkout/success")
                }
            } else {
                // Handle Cashfree
                const response = await fetch("/api/checkout/cashfree", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })

                const data = await response.json()

                if (data.error) {
                    throw new Error(data.error)
                }

                const cashfree = await load({
                    mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox',
                })

                if (cashfree) {
                    cashfree.checkout({
                        paymentSessionId: data.payment_session_id,
                        returnUrl: `${window.location.origin}/api/checkout/verify?order_id={order_id}`,
                    })
                }
            }

        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <div className="space-y-6">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Total to Pay</span>
                        <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium">Payment Method</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                            onClick={() => setPaymentMethod('cashfree')}
                            className={cn(
                                "cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200",
                                paymentMethod === 'cashfree'
                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600 shadow-sm"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                            )}
                        >
                            <CreditCard className={cn(
                                "w-6 h-6",
                                paymentMethod === 'cashfree' ? "text-indigo-600" : "text-muted-foreground"
                            )} />
                            <div className="text-center">
                                <p className={cn("font-medium text-sm", paymentMethod === 'cashfree' ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300")}>Online Payment</p>
                                <p className="text-xs text-muted-foreground mt-0.5">UPI, Cards, Netbanking</p>
                            </div>
                        </div>

                        <div
                            onClick={() => setPaymentMethod('cod')}
                            className={cn(
                                "cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200",
                                paymentMethod === 'cod'
                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600 shadow-sm"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                            )}
                        >
                            <Banknote className={cn(
                                "w-6 h-6",
                                paymentMethod === 'cod' ? "text-indigo-600" : "text-muted-foreground"
                            )} />
                            <div className="text-center">
                                <p className={cn("font-medium text-sm", paymentMethod === 'cod' ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300")}>Cash on Delivery</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Pay upon arrival</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handlePayment}
                    disabled={isProcessing || total === 0 || !address}
                >
                    {isProcessing
                        ? "Processing..."
                        : paymentMethod === 'cashfree'
                            ? `Pay ₹${total.toFixed(2)} Now`
                            : "Place Order (COD)"
                    }
                </Button>
            </div>
        </>
    )
}
