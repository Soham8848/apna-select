"use client"

import { useState, useMemo } from "react"
import { Product } from "@/types/supabase"
import { CategoryRail } from "./CategoryRail"
import { ProductCard } from "@/components/ProductCard"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface FeaturedProductsProps {
    initialProducts: Product[]
}

const CATEGORIES = ["All", "Electronics", "Wearables", "Gaming", "Accessories"]

export function FeaturedProducts({ initialProducts }: FeaturedProductsProps) {
    const [activeCategory, setActiveCategory] = useState("All")
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const filteredProducts = useMemo(() => {
        if (activeCategory === "All") return initialProducts
        return initialProducts.filter(p => p.category === activeCategory)
    }, [activeCategory, initialProducts])

    // Simulate "Load More" for visual consistency
    const handleLoadMore = () => {
        setIsLoadingMore(true)
        setTimeout(() => setIsLoadingMore(false), 1500)
    }

    return (
        <section className="container mx-auto px-4 py-20 relative z-10">
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-center mb-2 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                    Curated Groups
                </h2>
                <div className="w-24 h-1 bg-amber-500 rounded-full shadow-[0_0_15px_#F59E0B]" />
            </div>

            <CategoryRail
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-zinc-500">
                            No products found in this category.
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {filteredProducts.length > 0 && (
                <div className="mt-16 text-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="h-12 px-8 rounded-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all font-mono tracking-widest text-xs uppercase"
                    >
                        {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More +"}
                    </Button>
                </div>
            )}
        </section>
    )
}
