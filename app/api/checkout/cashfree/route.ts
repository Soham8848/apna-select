import { NextResponse } from "next/server";
export async function POST(req: Request) {
    try {
        const body = await req.json();

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
            order_amount: body.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
            order_currency: "INR",
            customer_details: {
                customer_id: "CUST_" + Date.now(),
                customer_phone: "9999999999", // Replace with actual user phone if available
                customer_name: "Customer", // Replace with actual user name if available
                customer_email: "test@example.com" // Replace with actual email
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

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
