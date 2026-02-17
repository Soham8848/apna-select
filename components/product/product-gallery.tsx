"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
    images: string[]
    title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    // Fallbacks
    const displayImages = images && images.length > 0 ? images : []
    const activeImage = displayImages[activeIndex]

    if (!activeImage) {
        return (
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                No Image
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Main View */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full w-full"
                    >
                        <Image
                            src={activeImage}
                            alt={`${title} - View ${activeIndex + 1}`}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    {displayImages.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={cn(
                                "relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all duration-200",
                                activeIndex === i
                                    ? "border-blue-500 ring-2 ring-blue-500/20"
                                    : "border-zinc-200 hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-100"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`View ${i + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
