import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, addressSnapshot, name, email, phone } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in cart" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const userId = user ? user.id : null;

        // Calculate total securely from DB
        let total = 0;
        const verifiedItems = [];

        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('price, id')
                .eq('id', item.id)
                .single();

            if (product) {
                total += product.price * item.quantity;
                verifiedItems.push({
                    product_id: product.id,
                    quantity: item.quantity,
                    price: product.price
                });
            }
        }

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
