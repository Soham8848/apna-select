"use client"

import { useCart } from "@/store/use-cart"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

export function CartButton() {
    const cart = useCart()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            onClick={() => cart.onOpen()}
        >
            <ShoppingBag className="h-5 w-5" />
            {cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium text-white flex items-center justify-center">
                    {cart.items.length}
                </span>
            )}
        </Button>
    )
}
