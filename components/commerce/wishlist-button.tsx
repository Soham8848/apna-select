"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { toggleFavorite } from "@/app/actions/favorite-actions";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
    productId: string | number;
    initialFavorited?: boolean;
    /** overlay = floating on a product image, inline = beside other controls */
    variant?: "overlay" | "inline";
    className?: string;
}

/**
 * Save-for-later control.
 *
 * Optimistic: the heart fills the instant it is tapped and rolls back if the
 * server rejects it. A wishlist that waits on a round trip feels broken, and
 * this sits inside a card that is itself a link, so the click must be stopped
 * from navigating.
 */
export function WishlistButton({
    productId,
    initialFavorited = false,
    variant = "overlay",
    className,
}: WishlistButtonProps) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const next = !favorited;
        setFavorited(next);

        startTransition(async () => {
            const res = await toggleFavorite(productId);
            if (!res.ok) {
                setFavorited(!next);
                toast.error(res.error ?? "Could not update your wishlist.", {
                    action: res.error?.includes("sign in")
                        ? { label: "Sign in", onClick: () => router.push("/login") }
                        : undefined,
                });
                return;
            }
            toast.success(res.favorited ? "Saved to wishlist" : "Removed from wishlist");
        });
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={pending}
            aria-pressed={favorited}
            aria-label={favorited ? "Remove from wishlist" : "Save to wishlist"}
            className={cn(
                "grid place-items-center rounded-full transition-colors",
                variant === "overlay"
                    ? "size-8 bg-background/85 backdrop-blur hover:bg-background"
                    : "size-11 border-2 border-border hover:border-urgent",
                className
            )}
        >
            <Heart
                className={cn(
                    variant === "overlay" ? "size-4" : "size-5",
                    favorited ? "fill-urgent text-urgent" : "text-foreground"
                )}
            />
        </button>
    );
}
