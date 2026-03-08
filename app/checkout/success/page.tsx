"use client"
import { useEffect } from "react"
import { useCart } from "@/store/use-cart"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/ui/FadeIn"

export default function CheckoutSuccessPage() {
    const cart = useCart()

    useEffect(() => {
        cart.clearCart()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <FadeIn>
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-500">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Payment Successful!</h1>
                        <p className="text-muted-foreground">
                            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button asChild className="w-full h-12 text-lg font-semibold">
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </FadeIn>
        </div>
    )
}
