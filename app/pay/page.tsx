"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { Loader2 } from "lucide-react";

import { isAllowedAppReturn } from "@/lib/app-return";

/**
 * Payment hand-off for the mobile app.
 *
 * The app creates the order through /api/checkout/cashfree, then opens this
 * page in a secure in-app browser with the Cashfree session id. We launch
 * Cashfree's checkout; afterwards Cashfree redirects to /api/checkout/verify,
 * which confirms the payment server-side and sends the shopper back into the
 * app via `return_to` (an apnaselect:// deep link).
 */
function Pay() {
    const params = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const session = params.get("session");
        const returnTo = params.get("return_to") ?? "";

        if (!session) {
            setError("This payment link is incomplete. Please go back to the app and try again.");
            return;
        }

        const verify = new URL("/api/checkout/verify", window.location.origin);
        // Cashfree substitutes {order_id}; URLSearchParams would escape the braces, so append raw.
        let returnUrl = `${verify.toString()}?order_id={order_id}`;
        if (isAllowedAppReturn(returnTo)) {
            returnUrl += `&app_return=${encodeURIComponent(returnTo)}`;
        }

        (async () => {
            try {
                const cashfree = await load({
                    mode:
                        process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT?.trim().toUpperCase() === "PRODUCTION"
                            ? "production"
                            : "sandbox",
                });
                if (!cashfree) throw new Error("Could not load the payment window.");
                cashfree.checkout({ paymentSessionId: session, returnUrl, redirectTarget: "_self" });
            } catch (e) {
                setError(e instanceof Error ? e.message : "Could not open the payment window.");
            }
        })();
    }, [params]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
            {error ? (
                <p className="max-w-sm text-sm font-semibold text-urgent">{error}</p>
            ) : (
                <>
                    <Loader2 className="size-8 animate-spin text-accent" />
                    <p className="text-sm text-muted-foreground">Opening secure payment…</p>
                </>
            )}
        </div>
    );
}

export default function PayPage() {
    return (
        <Suspense fallback={null}>
            <Pay />
        </Suspense>
    );
}
