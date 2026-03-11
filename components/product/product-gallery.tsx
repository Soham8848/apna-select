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
            <div className="relative w-full max-w-full flex-shrink-0 max-h-[60vh] mx-auto flex items-center justify-center p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 md:aspect-square">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full flex items-center justify-center"
                    >
                        <Image
                            src={activeImage}
                            alt={`${title} - View ${activeIndex + 1}`}
                            width={500}
                            height={500}
                            className="object-contain max-h-[50vh] w-full h-auto max-w-full aspect-square object-center md:object-cover md:w-full md:h-full"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="w-full min-w-0">
                    <div className="flex w-full overflow-x-auto snap-x scrollbar-hide gap-3 pb-2">
                        {displayImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={cn(
                                    "flex-shrink-0 snap-start w-20 h-20 relative rounded-md overflow-hidden border-2 transition-all duration-200",
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
                </div>
            )}
        </div>
    )
}
