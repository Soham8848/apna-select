import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
    value?: number | null;
    count?: number | null;
    /** compact = single star chip for dense grids, full = five stars */
    variant?: "compact" | "full";
    className?: string;
}

/**
 * Social proof. A product with no reviews yet says "New" rather than showing
 * five empty stars, which reads as a one-star product and actively repels.
 */
export function Rating({ value, count, variant = "compact", className }: RatingProps) {
    const hasRating = typeof value === "number" && value > 0;

    if (!hasRating) {
        return (
            <span
                className={cn(
                    "inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground",
                    className
                )}
            >
                New
            </span>
        );
    }

    if (variant === "compact") {
        return (
            <div className={cn("flex items-center gap-1.5", className)}>
                <span className="inline-flex items-center gap-1 rounded bg-trust px-1.5 py-0.5 text-[11px] font-bold text-trust-foreground">
                    <span data-price>{value.toFixed(1)}</span>
                    <Star className="size-2.5 fill-current" />
                </span>
                {typeof count === "number" && count > 0 && (
                    <span data-price className="text-[11px] font-medium text-muted-foreground">
                        ({count.toLocaleString("en-IN")})
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "size-4",
                            i < Math.round(value)
                                ? "fill-star text-star"
                                : "fill-border text-border"
                        )}
                    />
                ))}
            </div>
            <span className="text-sm font-semibold">
                <span data-price>{value.toFixed(1)}</span>
                {typeof count === "number" && count > 0 && (
                    <span className="font-normal text-muted-foreground">
                        {" "}
                        · {count.toLocaleString("en-IN")} review{count === 1 ? "" : "s"}
                    </span>
                )}
            </span>
            <span className="sr-only">
                Rated {value.toFixed(1)} out of 5{count ? ` from ${count} reviews` : ""}
            </span>
        </div>
    );
}
