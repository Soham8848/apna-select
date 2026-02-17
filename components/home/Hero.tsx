"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/ui/FadeIn"
import { ArrowDown, ArrowRight, Zap } from "lucide-react"

const headlineFirst = "Next Gen"
const headlineSecond = "Shopping."

const letterVariants = {
    hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.8,
            ease: [0.2, 0.65, 0.3, 0.9] as const
        }
    }
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
}

const scrollToProducts = () => {
    document.getElementById('latest-drops')?.scrollIntoView({ behavior: 'smooth' });
};

export function Hero() {
    return (
        <div className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a] text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#202020_1px,transparent_1px),linear-gradient(to_bottom,#202020_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

                {/* Glowing Orb */}
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">

                <FadeIn delay={0.2} direction="down">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 w-fit mx-auto shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:bg-white/10 transition-colors cursor-default">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                            The Future is Here
                        </span>
                    </div>
                </FadeIn>

                <motion.div
                    className="flex flex-col items-center justify-center mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9] uppercase flex flex-col items-center">
                        <span className="flex overflow-hidden">
                            {headlineFirst.split("").map((char, i) => (
                                <motion.span key={`first-${i}`} variants={letterVariants} className="inline-block bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-2xl">
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </span>
                        <span className="flex overflow-hidden">
                            {headlineSecond.split("").map((char, i) => (
                                <motion.span key={`second-${i}`} variants={letterVariants} className="inline-block bg-gradient-to-br from-cyan-400 via-purple-500 to-amber-500 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                                    {char}
                                </motion.span>
                            ))}
                        </span>
                    </h1>
                </motion.div>

                <FadeIn delay={1.0}>
                    <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light tracking-wide">
                        Experience the future of commerce. Curated luxury, instant delivery, best-in-class pricing.
                    </p>
                </FadeIn>

                <FadeIn delay={1.3}>
                    <div
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity z-20"
                        onClick={scrollToProducts}
                    >
                        <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase animate-pulse">
                            Scroll to Scan
                        </span>
                        {/* The Scanner Pill */}
                        <div className="w-[20px] h-[40px] border-2 border-cyan-500/50 rounded-full flex justify-center p-1 relative overflow-hidden backdrop-blur-sm">
                            {/* The Moving Scanner Line */}
                            <div className="w-1 h-2 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full animate-[bounce_1.5s_infinite]" />
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    )
}
