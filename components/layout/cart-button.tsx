"use client"

import { useEffect, useState } from "react"
import { ShoppingBag } from "lucide-react"

import { useCart } from "@/store/use-cart"
import { cn } from "@/lib/utils"

export function CartButton() {
    const items = useCart((s) => s.items)
    const onOpen = useCart((s) => s.onOpen)
    const [mounted, setMounted] = useState(false)
    const [bump, setBump] = useState(false)

    // The cart is read from localStorage, so the count is only known on the
    // client. Rendering it before mount would mismatch the server HTML.
    useEffect(() => setMounted(true), [])

    const count = items.reduce((n, i) => n + i.quantity, 0)

    // Animate the badge whenever the count rises — this is the feedback that
    // replaces the drawer we no longer force open on every add.
    useEffect(() => {
        if (!mounted || count === 0) return
        setBump(true)
        const id = setTimeout(() => setBump(false), 300)
        return () => clearTimeout(id)
    }, [count, mounted])

    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"}
            className="relative grid size-10 place-items-center rounded-full transition-colors hover:bg-secondary"
        >
            <ShoppingBag className="size-5" />
            {mounted && count > 0 && (
                <span
                    data-price
                    className={cn(
                        "absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground transition-transform",
                        bump && "scale-125"
                    )}
                >
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </button>
    )
}
