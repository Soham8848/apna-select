"use client";

import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";

/**
 * "Tell me when it's back."
 *
 * Replaces a dead-end "out of stock" message. This shopper has the highest
 * intent of anyone on the site — they came for one specific product — so
 * letting them leave without capturing anything is the most expensive silence
 * in the funnel. No account required, because requiring one discards most of
 * the demand.
 */
export function StockAlertForm({ productId }: { productId: string | number }) {
    const [email, setEmail] = useState("");
    const [state, setState] = useState<"idle" | "sending" | "done">("idle");
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setState("sending");

        try {
            const res = await fetch("/api/stock-alert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, email }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Could not save your request.");
                setState("idle");
                return;
            }
            setState("done");
        } catch {
            setError("Could not save your request. Please try again.");
            setState("idle");
        }
    };

    if (state === "done") {
        return (
            <div className="flex items-start gap-3 rounded-xl bg-trust-subtle p-4">
                <Check className="mt-0.5 size-5 shrink-0 text-trust" />
                <div>
                    <p className="text-sm font-bold">You're on the list</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        We'll email you the moment this is back in stock.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-surface-sunken p-4">
            <p className="flex items-center gap-2 text-sm font-bold">
                <BellRing className="size-4 text-accent" />
                Out of stock — want it back?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
                Leave your email and we'll tell you the moment it returns. No spam.
            </p>

            <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor={`alert-email-${productId}`}>
                    Email address
                </label>
                <input
                    id={`alert-email-${productId}`}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="h-11 flex-1 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                    type="submit"
                    disabled={state === "sending"}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-accent-foreground transition hover:brightness-95 disabled:opacity-60"
                >
                    {state === "sending" ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        "Notify me"
                    )}
                </button>
            </form>

            {error && <p className="mt-2 text-xs font-semibold text-urgent">{error}</p>}
        </div>
    );
}
