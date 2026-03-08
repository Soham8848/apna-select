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
        if (!product.inventory_count || product.inventory_count <= 0) return;

        cart.addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image_url || product.images?.[0] || '',
            category: product.category,
        })
        cart.onOpen()
    }

    const isOutOfStock = !product.inventory_count || product.inventory_count <= 0;

    return (
        <Button
            onClick={onAddToCart}
            size="lg"
            disabled={isOutOfStock}
            className={cn(
                "w-full gap-2",
                isOutOfStock && "opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400 dark:bg-zinc-700",
                className
            )}
        >
            <ShoppingCart className="h-5 w-5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
    )
}
