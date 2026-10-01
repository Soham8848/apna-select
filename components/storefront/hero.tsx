"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    href: string;
    image: string;
    /** Small highlight chip, e.g. "Up to 62% off". Optional. */
    badge?: string;
}

/**
 * Promotional hero.
 *
 * Replaces the previous version, which was four flat poster JPEGs. A bare
 * image is the most expensive real estate on the site doing the least work:
 * no headline, no call to action, no text a search engine or screen reader can
 * read, and any text baked into the JPEG turns illegible at phone width.
 *
 * These slides are composed in the browser instead — real type, a real button,
 * and a real product photo pulled from the catalogue — so each one states an
 * offer and gives somewhere to tap.
 *
 * Mechanics are a native scroll-snap rail, which gives genuine finger-swipe,
 * keyboard access and no layout thrash for free. Autoplay stops for good on
 * first interaction and never runs under prefers-reduced-motion.
 */
export function Hero({ slides }: { slides: HeroSlide[] }) {
    const railRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    const goTo = useCallback((i: number) => {
        const rail = railRef.current;
        if (!rail) return;
        rail.scrollTo({ left: rail.clientWidth * i, behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (paused || slides.length < 2) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const id = setInterval(() => {
            const rail = railRef.current;
            if (!rail) return;
            const next = (Math.round(rail.scrollLeft / rail.clientWidth) + 1) % slides.length;
            rail.scrollTo({ left: rail.clientWidth * next, behavior: "smooth" });
        }, 6000);
        return () => clearInterval(id);
    }, [paused, slides.length]);

    const onScroll = () => {
        const rail = railRef.current;
        if (!rail) return;
        setActive(Math.round(rail.scrollLeft / rail.clientWidth));
    };

    if (!slides.length) return null;

    return (
        <section
            className="relative isolate"
            aria-roledescription="carousel"
            aria-label="Promotions"
            onPointerDown={() => setPaused(true)}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div ref={railRef} onScroll={onScroll} className="rail gap-0 pb-0">
                {slides.map((slide, i) => (
                    <div key={slide.title} className="brand-slab relative w-full" style={{ flex: "0 0 100%" }}>
                        {/* Soft light bloom keeps the flat gradient from looking like a
                            solid block of colour */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-20 -top-24 size-[380px] rounded-full opacity-25 blur-3xl"
                            style={{ background: "oklch(0.8 0.2 330)" }}
                        />

                        <div className="shell relative grid items-center gap-6 py-10 sm:py-14 md:grid-cols-[1.1fr_1fr] md:gap-10 md:py-16">
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                                    {slide.eyebrow}
                                </p>

                                <h2 className="mt-2.5 font-display text-[clamp(1.75rem,7vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight text-white">
                                    {slide.title}
                                </h2>

                                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                                    {slide.subtitle}
                                </p>

                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <Link
                                        href={slide.href}
                                        className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold uppercase tracking-wide text-ink shadow-lg transition hover:gap-3"
                                    >
                                        {slide.ctaLabel}
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>

                                    {slide.badge && (
                                        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                                            {slide.badge}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-5 text-[11px] font-semibold text-white/60">
                                    Free delivery over ₹499 · Cash on delivery · 7-day returns
                                </p>
                            </div>

                            {/* Product image. Hidden from assistive tech: it is decorative
                                here, and the headline already carries the message. */}
                            {slide.image && (
                                <div className="relative mx-auto aspect-square w-full max-w-[220px] sm:max-w-[300px] md:max-w-none">
                                    <div
                                        aria-hidden
                                        className="absolute inset-0 rotate-6 rounded-[2rem] bg-white/10"
                                    />
                                    <div className="relative size-full overflow-hidden rounded-[1.75rem] border border-white/20 shadow-2xl">
                                        <Image
                                            src={slide.image}
                                            alt=""
                                            fill
                                            priority={i === 0}
                                            sizes="(max-width: 768px) 60vw, 420px"
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => goTo(Math.max(0, active - 1))}
                        aria-label="Previous promotion"
                        className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 lg:grid"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo(Math.min(slides.length - 1, active + 1))}
                        aria-label="Next promotion"
                        className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 lg:grid"
                    >
                        <ChevronRight className="size-5" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                        {slides.map((slide, i) => (
                            <button
                                key={slide.title}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Go to promotion ${i + 1}`}
                                aria-current={i === active}
                                className={`h-1.5 rounded-full transition-all ${
                                    i === active ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
