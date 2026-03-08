import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, addressId } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        let total = 0;
        for (const item of items) {
            const { data: product } = await supabase.from('products').select('price').eq('id', item.id).single();
            if (product) total += product.price * item.quantity;
        }

        const { data: addressData } = await supabase.from('addresses').select('*').eq('id', addressId).single();

        // 1. Create pending order in DB
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'pending',
                total_amount: total,
                shipping_address: addressData,
                payment_method: 'cashfree'
            })
            .select()
            .single();

        if (orderError) throw new Error(orderError.message);

        // 2. Insert Order Items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price
        }));
        await supabase.from('order_items').insert(orderItems);

        // 3. Create Cashfree Order
        const cfOrderData = {
            order_id: order.id.replace(/-/g, '_'),
            order_amount: total,
            order_currency: "INR",
            customer_details: {
                customer_id: user.id.replace(/-/g, ''),
                customer_phone: addressData.phone || "9999999999",
                customer_name: addressData.full_name || "Guest",
                customer_email: user.email || "guest@example.com"
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/checkout/verify?order_id={order_id}`
            }
        };

        const env = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX';
        const baseUrl = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg/orders' : 'https://sandbox.cashfree.com/pg/orders';

        const cfRes = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID || '',
                'x-client-secret': process.env.CASHFREE_SECRET_KEY || ''
            },
            body: JSON.stringify(cfOrderData)
        });

        const cfData = await cfRes.json();

        if (!cfRes.ok) {
            console.error("Cashfree error", cfData);
            return NextResponse.json({ error: cfData.message || "Cashfree API error" }, { status: 500 });
        }

        // 4. Update order with payment_intent_id
        await supabase.from('orders').update({ payment_intent_id: cfData.order_id }).eq('id', order.id);

        return NextResponse.json({
            payment_session_id: cfData.payment_session_id,
            order_id: cfData.order_id
        });

    } catch (error: any) {
        console.error("Error creating cashfree order:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
