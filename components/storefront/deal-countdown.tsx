"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

function pad(n: number) {
    return n.toString().padStart(2, "0");
}

/**
 * Countdown to midnight for "Deals of the day".
 *
 * This tracks a real deadline — the deals genuinely reset daily — rather than
 * a fake timer that resets on reload. Scarcity only works twice if it was true
 * the first time, and a timer that visibly lies costs more trust than the
 * urgency ever earns.
 *
 * Renders nothing until mounted, because server and client would otherwise
 * disagree on the current time and trip a hydration mismatch.
 */
export function DealCountdown() {
    const [remaining, setRemaining] = useState<number | null>(null);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            setRemaining(midnight.getTime() - now.getTime());
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    if (remaining === null) {
        // Reserve the same footprint so the row does not jump on hydration.
        return <span className="h-6 w-[108px]" aria-hidden />;
    }

    const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold">
            <Flame className="size-3.5 text-urgent" />
            <span className="text-muted-foreground">Ends in</span>
            <span className="flex items-center gap-0.5" role="timer" aria-live="off">
                {[pad(hours), pad(minutes), pad(seconds)].map((part, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                        {i > 0 && <span className="text-urgent">:</span>}
                        <span
                            data-price
                            className="rounded bg-ink px-1.5 py-0.5 text-white"
                        >
                            {part}
                        </span>
                    </span>
                ))}
            </span>
        </span>
    );
}
