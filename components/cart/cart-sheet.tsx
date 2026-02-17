"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/store/use-cart"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function CartSheet() {
    const cart = useCart()
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const onCheckout = () => {
        cart.onClose()
        router.push("/checkout")
    }

    return (
        <Sheet open={cart.isOpen} onOpenChange={(open) => open ? cart.onOpen() : cart.onClose()}>
            {/* SheetTrigger removed - Controlled by global store */}
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                <SheetHeader className="px-1">
                    <SheetTitle>Your Cart ({cart.items.length})</SheetTitle>
                </SheetHeader>

                {cart.items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center space-y-4">
                        <div className="relative h-40 w-40 text-muted-foreground/20">
                            <ShoppingBag className="h-full w-full" />
                        </div>
                        <p className="text-lg font-medium text-muted-foreground">Your cart is empty.</p>
                        <Button variant="secondary" onClick={() => cart.onClose()}>
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto pr-6">
                            <ul className="my-6 space-y-6">
                                {cart.items.map((item) => (
                                    <li key={item.id} className="flex py-2">
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover object-center"
                                            />
                                        </div>

                                        <div className="ml-4 flex flex-1 flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-foreground">
                                                    <h3>{item.title}</h3>
                                                    <p className="ml-4">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price * item.quantity)}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>
                                            </div>
                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <div className="flex items-center space-x-2 border rounded-md p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                    onClick={() => cart.removeItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4 pr-6 pb-6">
                            <Separator />
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-base font-medium">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>
                            </div>
                            <Button className="w-full h-12 text-lg font-semibold" onClick={onCheckout}>
                                Checkout
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
