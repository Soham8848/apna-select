"use client"

import { useCart } from "@/store/use-cart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useEffect, useState } from "react"

export function CheckoutSummary() {
    const cart = useCart()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    // Hardcoded shipping for now, or calculate based on logic
    const shipping = 0
    const total = subtotal + shipping

    if (cart.items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">Your cart is empty.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="sticky top-20">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                                <span className="font-medium text-sm">{item.title}</span>
                                <span className="text-muted-foreground text-xs">Qty: {item.quantity}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium text-sm">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price * item.quantity)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator />

                <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes</span>
                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(0)}</span>
                    </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
