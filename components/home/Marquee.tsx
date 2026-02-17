"use client"

import { motion } from "framer-motion"

const MARQUEE_TEXT = [
    "Free Shipping Worldwide",
    "•",
    "30-Day Money Back Guarantee",
    "•",
    "Premium Quality Materials",
    "•",
    "Secure Checkout",
    "•",
    "24/7 Support",
    "•",
    "Sustainable Packaging",
    "•"
]

export function Marquee() {
    return (
        <div className="w-full bg-black dark:bg-white text-white dark:text-black py-4 overflow-hidden flex whitespace-nowrap">
            <motion.div
                className="flex items-center gap-8 font-medium text-sm tracking-widest uppercase"
                animate={{ x: "-50%" }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 30
                }}
            >
                {/* Repeat list twice for seamless loop */}
                {[...MARQUEE_TEXT, ...MARQUEE_TEXT, ...MARQUEE_TEXT, ...MARQUEE_TEXT].map((text, i) => (
                    <span key={i} className="flex-shrink-0">
                        {text}
                    </span>
                ))}
            </motion.div>
        </div>
    )
}
