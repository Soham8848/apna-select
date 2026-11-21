import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceOrder } from "@/lib/server/pricing";
import { validateAddress, validateContact } from "@/lib/server/checkout";

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

        // A COD order with no reachable phone number cannot be delivered.
        const checked = validateContact({ name, phone, email, fallbackEmail: user?.email });
        if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: 400 });
        const { contact } = checked;

        // Price from the database, including delivery and the COD fee.
        const priced = await priceOrder(db, items, "cod");
        if ("error" in priced) {
            return NextResponse.json({ error: priced.error }, { status: 400 });
        }

        const { data: order, error: orderError } = await db
            .from("orders")
            .insert({
                user_id: user?.id ?? null,
                status: "pending",
                total_amount: priced.order.total,
                payment_intent_id: `COD_${Date.now()}_${randomBytes(4).toString("hex")}`,
                order_address_snapshot: addressSnapshot,
                customer_name: contact.name,
                customer_email: contact.email,
                customer_phone: contact.phone,
                payment_method: "cod",
                is_paid: false,
            })
            .select("id")
            .single();

        if (orderError || !order) {
            console.error("Error creating COD order:", orderError?.message);
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        const { error: itemsError } = await db.from("order_items").insert(
            priced.order.lines.map((line) => ({
                order_id: order.id,
                product_id: line.product_id,
                quantity: line.quantity,
                price_at_purchase: line.unit_price,
            }))
        );

        if (itemsError) {
            console.error("Error creating COD order items:", itemsError.message);
            // Roll back so an order with no items never reaches the admin queue.
            await db.from("orders").delete().eq("id", order.id);
            return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
        }

        return NextResponse.json({ success: true, orderId: order.id });
    } catch (error) {
        console.error("Error processing COD order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
