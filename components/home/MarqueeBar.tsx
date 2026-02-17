"use client"

import { motion } from "framer-motion"

const MARQUEE_CONTENT = "⚡ WORLD'S BEST PRODUCTS • 🚀 FASTEST SHIPPING • 💎 UNBEATABLE PRICES • 🔥 LIMITED DROPS • "

export function MarqueeBar() {
    return (
        <div className="w-full bg-amber-500 text-black py-3 overflow-hidden flex whitespace-nowrap z-20 relative">
            <motion.div
                className="flex items-center font-bold font-mono text-base tracking-wider uppercase"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20
                }}
            >
                {/* Repeat enough times to fill screen and allow smooth loop */}
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="flex-shrink-0 mr-4">
                        {MARQUEE_CONTENT}
                    </span>
                ))}
            </motion.div>
        </div>
    )
}
