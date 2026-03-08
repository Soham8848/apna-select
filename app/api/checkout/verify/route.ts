import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const order_id = url.searchParams.get('order_id');

        if (!order_id) {
            return NextResponse.redirect(new URL('/checkout?error=MissingOrderId', req.url));
        }

        const env = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX';
        const baseUrl = env === 'PRODUCTION' ? `https://api.cashfree.com/pg/orders/${order_id}` : `https://sandbox.cashfree.com/pg/orders/${order_id}`;

        const cfRes = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'x-api-version': '2023-08-01',
                'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID || '',
                'x-client-secret': process.env.CASHFREE_SECRET_KEY || ''
            }
        });

        const cfData = await cfRes.json();

        if (cfData.order_status === 'PAID') {
            const supabase = await createClient();
            await supabase.from('orders').update({
                status: 'paid',
                is_paid: true
            }).eq('payment_intent_id', order_id);

            return NextResponse.redirect(new URL('/checkout/success', req.url));
        } else {
            return NextResponse.redirect(new URL('/checkout?error=PaymentFailed', req.url));
        }
    } catch (e: any) {
        return NextResponse.redirect(new URL('/checkout?error=Server_Error', req.url));
    }
}
