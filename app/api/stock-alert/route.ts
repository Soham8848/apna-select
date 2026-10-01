import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Register interest in an out-of-stock product.
 *
 * Fails soft on a duplicate: if this person already asked to be told, we report
 * success rather than an error, because from their point of view the outcome is
 * identical and an error would just be confusing.
 */
export async function POST(req: Request) {
    try {
        const { productId, email } = await req.json();

        if (!productId) {
            return NextResponse.json({ error: "Missing product." }, { status: 400 });
        }

        const clean = String(email ?? "").trim().toLowerCase();
        // Intentionally permissive: this is a notification list, not an auth
        // boundary, and an over-strict pattern rejects valid addresses.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from("stock_alerts")
            .insert({ product_id: productId, email: clean });

        if (error) {
            // 23505 = unique violation: they are already on the list.
            if (error.code === "23505") {
                return NextResponse.json({ ok: true, alreadyListed: true });
            }
            // The table does not exist yet: PostgREST reports a missing relation
            // as PGRST205 from its schema cache, not as Postgres' own 42P01.
            if (error.code === "PGRST205" || error.code === "42P01") {
                console.error(
                    "stock_alerts table missing — run supabase/migrations/05_stock_alerts.sql"
                );
                return NextResponse.json(
                    { error: "Alerts are not set up yet. Please try again later." },
                    { status: 503 }
                );
            }
            console.error("stock_alert insert failed:", error.message);
            return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
    }
}
