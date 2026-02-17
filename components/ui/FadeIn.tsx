"use client"

import { motion, useInView, Variants } from "framer-motion"
import { useRef } from "react"

interface FadeInProps {
    children: React.ReactNode
    className?: string
    delay?: number
    duration?: number
    direction?: "up" | "down" | "left" | "right" | "none"
}

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    direction = "up"
}: FadeInProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

    const variants: Variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
            x: direction === "left" ? 40 : direction === "right" ? -40 : 0
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: duration,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }
        }
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    )
}
