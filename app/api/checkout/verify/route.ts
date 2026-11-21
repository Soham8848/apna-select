import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchCashfreeOrder, markOrderPaid } from "@/lib/server/checkout";
import { isAllowedAppReturn } from "@/lib/app-return";

/**
 * Where Cashfree sends the shopper's browser after payment. The status is
 * always re-read from Cashfree's API — the query string is never trusted.
 *
 * This is the fast path only. If the shopper closes the tab before arriving
 * here, /api/webhooks/cashfree marks the order paid instead.
 */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
        return NextResponse.redirect(new URL("/checkout?error=MissingOrderId", req.url));
    }

    // Payments started from the mobile app return to the app, not the website.
    const appReturn = url.searchParams.get("app_return");
    const toApp = isAllowedAppReturn(appReturn)
        ? (status: "paid" | "failed") => {
              const sep = appReturn.includes("?") ? "&" : "?";
              return NextResponse.redirect(
                  `${appReturn}${sep}status=${status}&order_id=${encodeURIComponent(orderId)}`
              );
          }
        : null;

    try {
        const cfOrder = await fetchCashfreeOrder(orderId);
        if (!cfOrder) {
            return toApp ? toApp("failed") : NextResponse.redirect(new URL("/checkout?error=PaymentFailed", req.url));
        }

        const db = createAdminClient() ?? (await createClient());
        const result = await markOrderPaid(db, cfOrder);

        if (result === "paid" || result === "already_paid") {
            return toApp ? toApp("paid") : NextResponse.redirect(new URL("/checkout/success", req.url));
        }
        return toApp ? toApp("failed") : NextResponse.redirect(new URL("/checkout?error=PaymentFailed", req.url));
    } catch (e) {
        console.error("Payment verify error:", e);
        return toApp ? toApp("failed") : NextResponse.redirect(new URL("/checkout?error=Server_Error", req.url));
    }
}
