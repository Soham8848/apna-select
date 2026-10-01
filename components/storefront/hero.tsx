"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
    { src: "/images/posters/summerposter.jpeg", href: "/products", label: "Shop the summer edit" },
    { src: "/images/posters/poster1.jpeg", href: "/products", label: "Shop new arrivals" },
    { src: "/images/posters/poster2.jpeg", href: "/products", label: "Shop best sellers" },
    { src: "/images/posters/poster3.jpeg", href: "/products", label: "Shop today's deals" },
];

/**
 * Promotional hero.
 *
 * Built on a native scroll-snap rail rather than a CSS transform, which buys
 * real finger-swipe on mobile, correct keyboard and screen-reader behaviour,
 * and no janky re-renders — for free, from the browser.
 *
 * Autoplay stops permanently once the shopper interacts, and never starts at
 * all under prefers-reduced-motion. Hijacking a carousel out from under
 * someone mid-look is a genuine usability failure, not a growth tactic.
 */
export function Hero() {
    const railRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    const goTo = useCallback((i: number) => {
        const rail = railRef.current;
        if (!rail) return;
        rail.scrollTo({ left: rail.clientWidth * i, behavior: "smooth" });
    }, []);

    // Autoplay
    useEffect(() => {
        if (paused) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const id = setInterval(() => {
            const rail = railRef.current;
            if (!rail) return;
            const next = (Math.round(rail.scrollLeft / rail.clientWidth) + 1) % SLIDES.length;
            rail.scrollTo({ left: rail.clientWidth * next, behavior: "smooth" });
        }, 5000);
        return () => clearInterval(id);
    }, [paused]);

    // Track the active slide from real scroll position, so dots stay truthful
    // whether the move came from autoplay, a swipe or an arrow key.
    const onScroll = () => {
        const rail = railRef.current;
        if (!rail) return;
        setActive(Math.round(rail.scrollLeft / rail.clientWidth));
    };

    return (
        <section
            className="relative"
            aria-roledescription="carousel"
            aria-label="Promotions"
            onPointerDown={() => setPaused(true)}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div
                ref={railRef}
                onScroll={onScroll}
                className="rail gap-0 pb-0"
                style={{ scrollSnapType: "x mandatory" }}
            >
                {SLIDES.map((slide, i) => (
                    <Link
                        key={slide.src}
                        href={slide.href}
                        aria-label={slide.label}
                        className="relative block w-full"
                        style={{ flex: "0 0 100%" }}
                    >
                        <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
                            <Image
                                src={slide.src}
                                alt={slide.label}
                                fill
                                priority={i === 0}
                                sizes="100vw"
                                className="object-cover object-center"
                            />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Desktop arrows — hidden on touch, where swiping is the natural move */}
            <button
                type="button"
                onClick={() => goTo(Math.max(0, active - 1))}
                aria-label="Previous promotion"
                className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-tile backdrop-blur transition hover:bg-background lg:grid"
            >
                <ChevronLeft className="size-5" />
            </button>
            <button
                type="button"
                onClick={() => goTo(Math.min(SLIDES.length - 1, active + 1))}
                aria-label="Next promotion"
                className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-tile backdrop-blur transition hover:bg-background lg:grid"
            >
                <ChevronRight className="size-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-sm">
                {SLIDES.map((slide, i) => (
                    <button
                        key={slide.src}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Go to promotion ${i + 1}`}
                        aria-current={i === active}
                        className={`h-1.5 rounded-full transition-all ${
                            i === active ? "w-6 bg-accent" : "w-1.5 bg-white/60 hover:bg-white"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
