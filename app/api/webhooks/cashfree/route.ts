import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { fetchCashfreeOrder, markOrderPaid, verifyCashfreeSignature } from "@/lib/server/checkout";

/**
 * Cashfree server-to-server payment notification.
 *
 * Without this, an order is only marked paid if the shopper's browser makes it
 * back to /api/checkout/verify — closing the tab or losing signal right after
 * paying left a paid order stuck at "pending".
 *
 * The URL is sent to Cashfree per-order as `notify_url` (production / https
 * only). It can also be set once in the Cashfree dashboard under
 * Developers → Webhooks: https://<your-domain>/api/webhooks/cashfree
 */
export async function POST(req: Request) {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp") ?? "";
    const signature = req.headers.get("x-webhook-signature") ?? "";

    if (!verifyCashfreeSignature(rawBody, timestamp, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let orderId: string | undefined;
    try {
        orderId = JSON.parse(rawBody)?.data?.order?.order_id;
    } catch {
        return NextResponse.json({ error: "Bad payload" }, { status: 400 });
    }
    if (!orderId) return NextResponse.json({ ok: true, ignored: true });

    const db = createAdminClient();
    if (!db) {
        // Without the service key we cannot write past RLS; 500 makes Cashfree retry later.
        console.error("Cashfree webhook received but SUPABASE_SERVICE_ROLE_KEY is not set");
        return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    // Re-read the status from Cashfree rather than trusting the event type, so
    // failure / dropped events and retries are all handled by one code path.
    const cfOrder = await fetchCashfreeOrder(orderId);
    if (!cfOrder) return NextResponse.json({ error: "Lookup failed" }, { status: 502 });

    const result = await markOrderPaid(db, cfOrder);
    return NextResponse.json({ ok: true, result });
}
