"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/store/use-cart"
import { ShoppingCart } from "lucide-react"
import { Product } from "@/types/supabase"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
    product: Product
    className?: string
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
    const cart = useCart()

    const onAddToCart = () => {
        cart.addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image_url || product.images?.[0] || '',
            category: product.category,
        })
        cart.onOpen()
    }

    return (
        <Button onClick={onAddToCart} size="lg" className={cn("w-full gap-2", className)}>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
        </Button>
    )
}
