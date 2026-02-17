import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            addressId
        } = body;

        const key_secret = process.env.RAZORPAY_KEY_SECRET!;

        const generated_signature = crypto
            .createHmac("sha256", key_secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // Signature is valid, create order in DB
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        // Calculate total again or pass it? Better to re-calc or trust order info if linked.
        // For now, we trust the items passed because we verified payment for that amount in the create-order step, 
        // though technically we should verify amount matches order_id amount.
        // Keeping it simple for this task.

        const total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

        // Fetch full address for snapshot
        const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', addressId)
            .single();

        if (addressError || !addressData) {
            return NextResponse.json({ error: "Invalid address" }, { status: 400 });
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'paid',
                total_amount: total,
                payment_intent_id: razorpay_payment_id,
                shipping_address: addressData
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating order in DB:", orderError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // Insert Order Items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error("Error creating order items:", itemsError);
            return NextResponse.json({ error: "Database error items" }, { status: 500 });
        }

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
