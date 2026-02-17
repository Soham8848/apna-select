"use client"

import { useState } from "react"
import { useCart } from "@/store/use-cart"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { CreditCard, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentFormProps {
    addressId: string | null
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function PaymentForm({ addressId }: PaymentFormProps) {
    const cart = useCart()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')

    const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const handlePayment = async () => {
        if (!addressId) {
            toast.error("Please select a shipping address first.")
            return
        }

        setIsProcessing(true)

        try {
            if (paymentMethod === 'cod') {
                // Handle Cash on Delivery
                const response = await fetch("/api/create-cod-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: cart.items, addressId }),
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
                // Handle Razorpay
                // 1. Create Order
                const response = await fetch("/api/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: cart.items }),
                })

                const orderData = await response.json()

                if (orderData.error) {
                    throw new Error(orderData.error)
                }

                // 2. Open Razorpay
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Modern Dropship Eco",
                    description: "Order Payment",
                    order_id: orderData.id,
                    handler: async function (response: any) {
                        // 3. Verify Payment
                        try {
                            const verifyRes = await fetch("/api/verify-payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    items: cart.items,
                                    addressId,
                                }),
                            })

                            const verifyData = await verifyRes.json()

                            if (verifyData.success) {
                                cart.clearCart()
                                toast.success("Payment successful!")
                                router.push("/checkout/success")
                            } else {
                                toast.error(verifyData.error || "Payment verification failed")
                            }
                        } catch (err) {
                            toast.error("Payment verification failed")
                            console.error(err)
                        }
                    },
                    prefill: {
                        name: "User Name", // Could pull from profile
                        email: "user@example.com",
                        contact: "9999999999",
                    },
                    theme: {
                        color: "#000000",
                    },
                }

                const paymentObject = new window.Razorpay(options)
                paymentObject.open()
            }

        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
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
                            onClick={() => setPaymentMethod('razorpay')}
                            className={cn(
                                "cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200",
                                paymentMethod === 'razorpay'
                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600 shadow-sm"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                            )}
                        >
                            <CreditCard className={cn(
                                "w-6 h-6",
                                paymentMethod === 'razorpay' ? "text-indigo-600" : "text-muted-foreground"
                            )} />
                            <div className="text-center">
                                <p className={cn("font-medium text-sm", paymentMethod === 'razorpay' ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300")}>Online Payment</p>
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
                    disabled={isProcessing || total === 0 || !addressId}
                >
                    {isProcessing
                        ? "Processing..."
                        : paymentMethod === 'razorpay'
                            ? `Pay $${total.toFixed(2)} Now`
                            : "Place Order (COD)"
                    }
                </Button>
            </div>
        </>
    )
}
