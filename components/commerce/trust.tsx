import { BadgeIndianRupee, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The four objections that stop an Indian dropship purchase, answered in the
 * order shoppers raise them: will it arrive, can I pay cash, can I send it
 * back, is my money safe. Repeated at every decision point in the funnel —
 * header, product page, cart, checkout — because trust decays between steps.
 */
export const TRUST_POINTS = [
    { icon: Truck, title: "Free delivery", detail: "On orders over ₹499" },
    { icon: BadgeIndianRupee, title: "Cash on delivery", detail: "Pay when it arrives" },
    { icon: RotateCcw, title: "7-day returns", detail: "No questions asked" },
    { icon: ShieldCheck, title: "Secure payments", detail: "UPI · Cards · Netbanking" },
] as const;

/** Full-width reassurance strip. Used below the fold on home and PDP. */
export function TrustBar({ className }: { className?: string }) {
    return (
        <section className={cn("border-y border-border bg-surface-sunken", className)}>
            <div className="shell grid grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4">
                {TRUST_POINTS.map(({ icon: Icon, title, detail }) => (
                    <div key={title} className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-trust-subtle text-trust">
                            <Icon className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-bold leading-tight">{title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/** Inline chips for tight spaces — the buy box and the cart footer. */
export function TrustChips({ className }: { className?: string }) {
    return (
        <ul className={cn("flex flex-wrap gap-x-4 gap-y-2", className)}>
            {TRUST_POINTS.map(({ icon: Icon, title }) => (
                <li key={title} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Icon className="size-3.5 text-trust" />
                    {title}
                </li>
            ))}
        </ul>
    );
}
