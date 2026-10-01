import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { priceOrder } from "@/lib/server/pricing";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, addressSnapshot, name, email, phone } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const userId = user ? user.id : null;

        /**
         * Price from the database, including delivery and the COD fee, so the
         * amount stored on the order matches the total the shopper confirmed.
         *
         * This replaces a per-item loop that issued one query per cart line and
         * silently dropped any product it could not find — meaning a stale cart
         * could place an order for less than the shopper actually selected.
         * `priceOrder` fetches every product in one query and fails loudly
         * instead.
         */
        const priced = await priceOrder(supabase, items, "cod");
        if ("error" in priced) {
            return NextResponse.json({ error: priced.error }, { status: 400 });
        }
        const total = priced.order.total;
        const verifiedItems = priced.order.lines.map((line) => ({
            product_id: line.product_id,
            quantity: line.quantity,
            price: line.unit_price,
        }));

        // Insert Order
        // Note: Using 'cod' as payment_method and is_paid: false
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                status: 'pending',
                total_amount: total,
                payment_intent_id: `COD-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                order_address_snapshot: addressSnapshot,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                payment_method: 'cod',
                is_paid: false
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating COD order:", orderError);
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // Insert Order Items
        const orderItemsData = verifiedItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) {
            console.error("Error creating COD order items:", itemsError);
            // Ideally we should rollback order here, but for now just error
            return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
        }

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error: any) {
        console.error("Error processing COD order:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
