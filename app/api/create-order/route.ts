import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items } = body; // Expect items from cart to calculate total on backend

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in cart" }, { status: 400 });
        }

        const supabase = await createClient();

        // Calculate total securely from DB
        let total = 0;

        // Helper to fetch prices. Optimized for fewer queries in a real app (e.g. `in` query)
        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('price')
                .eq('id', item.id)
                .single();

            if (product) {
                total += product.price * item.quantity;
            }
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const options = {
            amount: Math.round(total * 100), // Amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);

    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
