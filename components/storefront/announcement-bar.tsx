"use client";

import { useEffect, useState } from "react";
import { BadgeIndianRupee, RotateCcw, Truck } from "lucide-react";

const MESSAGES = [
    { icon: Truck, text: "Free delivery on orders above ₹499" },
    { icon: BadgeIndianRupee, text: "Cash on delivery available across India" },
    { icon: RotateCcw, text: "7-day easy returns on everything" },
];

/**
 * Thin rotating value-prop bar. Replaces the old CSS marquee: a continuously
 * sliding strip is hard to read, impossible to tap and ignores reduced-motion.
 * This cross-fades one message at a time, so each one is actually legible.
 */
export function AnnouncementBar() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="bg-ink text-white/90">
            <div className="shell flex h-9 items-center justify-center overflow-hidden">
                <div className="relative h-4 w-full max-w-sm">
                    {MESSAGES.map(({ icon: Icon, text }, i) => (
                        <p
                            key={text}
                            aria-hidden={i !== index}
                            className={`absolute inset-0 flex items-center justify-center gap-1.5 whitespace-nowrap text-[11px] font-medium tracking-wide transition-opacity duration-500 sm:text-xs ${
                                i === index ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <Icon className="size-3.5 shrink-0 text-accent" />
                            {text}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}
