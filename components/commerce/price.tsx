import { cn } from "@/lib/utils";
import { discountPercent, inr } from "@/lib/commerce";

interface PriceProps {
    price: number;
    compareAt?: number | null;
    /** sm = grid tiles, md = cart rows, lg = product page buy box */
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizes = {
    sm: { now: "text-[15px] font-extrabold", was: "text-[11px]", off: "text-[11px]" },
    md: { now: "text-lg font-extrabold", was: "text-xs", off: "text-xs" },
    lg: { now: "text-3xl font-extrabold", was: "text-sm", off: "text-sm" },
};

/**
 * Price + MRP + discount, always in that reading order: what you pay, what it
 * was, what you saved. The saving uses the trust colour rather than the accent
 * so it never competes with the Add to cart button next to it.
 */
export function Price({ price, compareAt, size = "sm", className }: PriceProps) {
    const pct = discountPercent(price, compareAt);
    const s = sizes[size];

    return (
        <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
            <span data-price className={cn(s.now, "tracking-tight text-foreground")}>
                {inr(price)}
            </span>
            {pct !== null && (
                <>
                    <span data-price className={cn(s.was, "text-muted-foreground line-through")}>
                        {inr(compareAt)}
                    </span>
                    <span className={cn(s.off, "font-bold text-trust")}>{pct}% off</span>
                </>
            )}
        </div>
    );
}
