"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

interface CategoryCarouselProps {
    categories?: { name: string; image?: string; slug?: string }[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const defaultCategories = [
        { id: 1, english: "Audio", hinglish: "Shor Sharaba", imageUrl: "/images/categories/audio.jpg" },
        { id: 2, english: "Wearables", hinglish: "Wrist Pe Swag", imageUrl: "/images/categories/wearables.jpg" },
        { id: 3, english: "Mobile Accs", hinglish: "Phone Ka Shringar", imageUrl: "/images/categories/mobile-accs.jpg" },
        { id: 4, english: "Gaming", hinglish: "Noob to Pro", imageUrl: "/images/categories/gaming.jpg" },
        { id: 5, english: "Electronics", hinglish: "Gadget Gali", imageUrl: "/images/categories/electronics.jpg" },
        { id: 6, english: "Home & Gift", hinglish: "Ghar Ki Raunak", imageUrl: "/images/categories/home-gift.jpg" },
        { id: 7, english: "Accessories", hinglish: "Style Ka Tadka", imageUrl: "/images/categories/accessories.jpg" },
        { id: 8, english: "Tools", hinglish: "Jugaad Junction", imageUrl: "/images/categories/tools.jpg" },
        { id: 9, english: "Quirky Items", hinglish: "Khatarnak Collection", imageUrl: "/images/categories/quirky.jpg" },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                ref={scrollRef}
                className="flex items-start justify-start lg:justify-center gap-4 md:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide py-4 px-2 md:px-4 snap-x"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {defaultCategories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/category/${encodeURIComponent(cat.english.toLowerCase())}`}
                        className="flex flex-col items-center gap-2 shrink-0 snap-start group"
                    >
                        <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-full border-2 border-slate-100 dark:border-zinc-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 bg-slate-50 dark:bg-zinc-900 flex items-center justify-center">
                            <Image
                                src={cat.imageUrl}
                                alt={cat.english}
                                fill
                                className="object-cover rounded-full"
                            />
                        </div>

                        <div className="flex flex-col items-center justify-center mt-2 w-full gap-0.5">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-center truncate w-full">
                                {cat.english}
                            </span>
                            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 text-center truncate w-full">
                                {cat.hinglish}
                            </span>
                        </div>
                    </Link>
                ))}

                {/* Shop All Circle */}
                <Link
                    href="/products"
                    className="flex flex-col items-center gap-2 shrink-0 snap-start group"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-full border-2 border-slate-100 dark:border-zinc-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 bg-slate-50 dark:bg-zinc-900 flex items-center justify-center">
                        <LayoutGrid strokeWidth={1.5} className="w-8 h-8 text-slate-800 dark:text-slate-200 transform transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <div className="h-6 overflow-hidden w-24 md:w-28 mt-1 flex items-center justify-center">
                        <span className="text-sm font-medium tracking-wide text-slate-700 dark:text-slate-300 text-center truncate w-full">
                            Shop All
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
