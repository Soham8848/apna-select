"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface CategoryRailProps {
    categories: string[]
    activeCategory: string
    onSelect: (category: string) => void
}

export function CategoryRail({ categories, activeCategory, onSelect }: CategoryRailProps) {
    return (
        <div className="w-full flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide whitespace-nowrap px-4 py-2 max-w-full">
            <div className="flex items-center gap-3">
                {categories.map((category) => {
                    const isActive = activeCategory === category
                    return (
                        <motion.button
                            key={category}
                            onClick={() => onSelect(category)}
                            className={cn(
                                "relative flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 whitespace-nowrap",
                                isActive
                                    ? "text-black bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                                    : "text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-zinc-200 hover:border-white/20"
                            )}
                            whileTap={{ scale: 0.95 }}
                        >
                            {category}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
