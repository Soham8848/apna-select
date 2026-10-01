import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { priceOrder } from "@/lib/server/pricing";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, addressSnapshot, name, email, phone } = body;

        // Price the order from the database before anything else. The request
        // body is untrusted input: it supplies product ids and quantities only,
        // never amounts.
        const supabase = await createClient();
        const priced = await priceOrder(supabase, items, "prepaid");
        if ("error" in priced) {
            return NextResponse.json({ error: priced.error }, { status: 400 });
        }
        const { order: pricedOrder } = priced;

        // Safely get the origin (falls back to the known production domain if headers fail)
        const origin = req.headers.get('origin') || 'https://apna-select.vercel.app';

        // Cashfree requires '{order_id}' exactly as written, they will replace it dynamically
        const secureReturnUrl = `${origin}/checkout/success?order_id={order_id}`;

        // 1. Clean the keys
        const rawEnv = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT?.trim().toUpperCase();
        const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID?.trim();
        const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
        // 2. Determine exact URL
        const isProd = rawEnv === 'PRODUCTION';
        const cashfreeUrl = isProd
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';
        // 3. Log safely (DO NOT log the secret key)
        console.log("--- CASHFREE DEBUG ---");
        console.log(`Environment Variable: ${rawEnv}`);
        console.log(`Target URL: ${cashfreeUrl}`);
        console.log(`App ID Length: ${appId?.length}`);
        if (!appId || !secretKey) {
            return NextResponse.json({ error: "Missing Cashfree API Keys" }, { status: 500 });
        }

        // 4. Set strict headers
        const headers = {
            'x-api-version': '2023-08-01',
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        // 5. Payload structure (Ensure this matches your actual logic)
        const orderPayload = {
            order_amount: pricedOrder.total,
            order_currency: "INR",
            customer_details: {
                customer_id: "CUST_" + Date.now(),
                customer_phone: phone || "9999999999",
                customer_name: name || "Customer",
                customer_email: email || "test@example.com"
            },
            order_meta: {
                // This is handled by the frontend SDK, but we pass a dummy URL to satisfy the API
                return_url: secureReturnUrl
            }
        };
        const response = await fetch(cashfreeUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(orderPayload)
        });
        const data = await response.json();
        console.log("Cashfree Response Status:", response.status);
        if (!response.ok) {
            console.error("Cashfree Error:", data);
            return NextResponse.json({ error: data.message || "Payment init failed" }, { status: response.status });
        }

        // Insert Order into Supabase
        const { data: { user } } = await supabase.auth.getUser();

        const userId = user ? user.id : null;
        const totalAmount = pricedOrder.total;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                status: 'pending',
                total_amount: totalAmount,
                payment_intent_id: data.order_id, // Cashfree generates order_id
                order_address_snapshot: addressSnapshot,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                payment_method: 'cashfree',
                is_paid: false
            })
            .select()
            .single();

        if (orderError) {
            console.error("Order Insert Error:", orderError);
        } else if (order) {
            // Create order items
            // Record the database price, not the submitted one, so the order
            // history can never disagree with what was charged.
            const orderItemsData = pricedOrder.lines.map((line) => ({
                order_id: order.id,
                product_id: line.product_id,
                quantity: line.quantity,
                price_at_purchase: line.unit_price
            }));
            const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
            if (itemsError) {
                console.error("Order Items Insert Error:", itemsError);
            }
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
