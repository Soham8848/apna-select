import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceOrder } from "@/lib/server/pricing";
import {
    cashfreeConfig,
    cashfreeHeaders,
    validateAddress,
    validateContact,
} from "@/lib/server/checkout";

/**
 * Starts an online payment.
 *
 * Order of operations matters: we save our own order first (with an id we
 * generate), and only then ask Cashfree to collect money for it. Previously
 * the Cashfree order was created first and a failed database insert was only
 * logged — so a shopper could pay for an order that did not exist.
 */
export async function POST(req: Request) {
    try {
        const { items, addressSnapshot, name, email, phone } = await req.json();

        const supabase = await createClient();
        const db = createAdminClient() ?? supabase;
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const addressError = validateAddress(addressSnapshot);
        if (addressError) return NextResponse.json({ error: addressError }, { status: 400 });

        const checked = validateContact({ name, phone, email, fallbackEmail: user?.email });
        if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: 400 });
        const { contact } = checked;

        // Prices come from the database; the request supplies ids and quantities only.
        const priced = await priceOrder(db, items, "prepaid");
        if ("error" in priced) {
            return NextResponse.json({ error: priced.error }, { status: 400 });
        }
        const { order: pricedOrder } = priced;

        const { appId, secretKey, baseUrl } = cashfreeConfig();
        if (!appId || !secretKey) {
            console.error("Cashfree keys are not configured");
            return NextResponse.json({ error: "Online payment is unavailable right now." }, { status: 500 });
        }

        // 1. Save the order under our own id.
        const cfOrderId = `AS_${Date.now()}_${randomBytes(4).toString("hex")}`;

        const { data: order, error: orderError } = await db
            .from("orders")
            .insert({
                user_id: user?.id ?? null,
                status: "pending",
                total_amount: pricedOrder.total,
                payment_intent_id: cfOrderId,
                order_address_snapshot: addressSnapshot,
                customer_name: contact.name,
                customer_email: contact.email,
                customer_phone: contact.phone,
                payment_method: "cashfree",
                is_paid: false,
            })
            .select("id")
            .single();

        if (orderError || !order) {
            console.error("Order insert error:", orderError?.message);
            return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
        }

        const { error: itemsError } = await db.from("order_items").insert(
            pricedOrder.lines.map((line) => ({
                order_id: order.id,
                product_id: line.product_id,
                quantity: line.quantity,
                price_at_purchase: line.unit_price,
            }))
        );

        if (itemsError) {
            console.error("Order items insert error:", itemsError.message);
            await db.from("orders").delete().eq("id", order.id);
            return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
        }

        // 2. Ask Cashfree to collect payment for exactly that order.
        // The site URL comes from config, never from the request's Origin header.
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");

        const response = await fetch(`${baseUrl}/orders`, {
            method: "POST",
            headers: cashfreeHeaders(),
            body: JSON.stringify({
                order_id: cfOrderId,
                order_amount: pricedOrder.total,
                order_currency: "INR",
                customer_details: {
                    customer_id: user?.id ?? `guest_${contact.phone}`,
                    customer_phone: contact.phone,
                    customer_name: contact.name,
                    ...(contact.email ? { customer_email: contact.email } : {}),
                },
                order_meta: {
                    return_url: `${siteUrl}/api/checkout/verify?order_id={order_id}`,
                    // Cashfree only accepts https webhook URLs, so skip it on localhost.
                    ...(siteUrl.startsWith("https://")
                        ? { notify_url: `${siteUrl}/api/webhooks/cashfree` }
                        : {}),
                },
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree order create failed:", response.status, data?.message);
            await db.from("orders").update({ status: "failed" }).eq("id", order.id);
            return NextResponse.json(
                { error: data?.message || "Could not start the payment. Please try again." },
                { status: 502 }
            );
        }

        return NextResponse.json({
            order_id: data.order_id,
            payment_session_id: data.payment_session_id,
        });
    } catch (error) {
        console.error("Cashfree checkout error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
