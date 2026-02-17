"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Check, Star, Zap } from "lucide-react"
import { useCart } from "@/store/use-cart"
import { Product } from "@/types/supabase"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const cart = useCart()
    const [isAdded, setIsAdded] = useState(false)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        cart.addItem({
            id: product.id.toString(),
            title: product.title,
            price: product.price,
            image: product.image_url || product.images?.[0] || '',
            category: product.category,
        });
        cart.onOpen();
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    // Extract a tech tag or fallback to category
    const techTag = product.specifications
        ? Object.values(product.specifications)[0]
        : product.category;

    return (
        <Link href={`/products/${product.id}`} className="group block h-full">
            <motion.div
                className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group-hover:-translate-y-1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                    <motion.div
                        className="h-full w-full"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {product.images?.[0] || product.image_url ? (
                            <Image
                                src={product.images?.[0] || product.image_url || ''}
                                alt={product.title}
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-950">
                                <Zap className="w-8 h-8 opacity-20" />
                            </div>
                        )}
                    </motion.div>

                    {/* Floating Badge */}
                    <div className="absolute top-3 right-3 z-10">
                        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                            {techTag}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between relative">
                    {/* Gradient Overlay for Text Readability if needed, but using solid bg here */}

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-semibold text-zinc-400">
                                    {product.average_rating ? product.average_rating.toFixed(1) : "4.8"}
                                </span>
                            </div>
                            {product.is_featured && (
                                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                                    Featured
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-lg text-white leading-tight mb-4 min-h-[3rem] line-clamp-2" title={product.title}>
                            {product.title}
                        </h3>
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-500 mb-0.5">Price</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
                                </span>
                                {product.compare_at_price && product.compare_at_price > product.price && (
                                    <>
                                        <span className="text-xs text-muted-foreground line-through">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.compare_at_price)}
                                        </span>
                                        <span className="text-[10px] font-bold text-green-500">
                                            {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <motion.button
                        onClick={handleAddToCart}
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                            isAdded
                                ? "bg-green-500 text-black"
                                : "bg-white text-black hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                        )}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isAdded ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </Link >
    )
}
