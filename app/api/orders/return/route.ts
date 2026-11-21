import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Shopper requests a return for one order line.
 *
 * Ownership is checked explicitly: the item's order must belong to the
 * signed-in user. Previously any logged-in user could file a return against
 * any order item id.
 */
export async function POST(req: Request) {
    try {
        const { itemId, reason } = await req.json()

        const cleanReason = String(reason ?? "").trim().slice(0, 1000)
        if (!itemId || !cleanReason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const db = createAdminClient() ?? supabase

        const { data: item } = await db
            .from("order_items")
            .select("id, order_id, return_status")
            .eq("id", itemId)
            .maybeSingle()

        if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })

        const { data: order } = await db
            .from("orders")
            .select("user_id")
            .eq("id", item.order_id)
            .maybeSingle()

        if (!order || order.user_id !== user.id) {
            // Same response as "not found" so ids of other people's orders are not confirmed.
            return NextResponse.json({ error: "Item not found" }, { status: 404 })
        }

        if (item.return_status) {
            return NextResponse.json(
                { error: "A return has already been requested for this item." },
                { status: 409 }
            )
        }

        const { data, error } = await db
            .from("order_items")
            .update({ return_status: "requested", return_reason: cleanReason })
            .eq("id", itemId)
            .select()

        if (error) {
            console.error("Return API Error:", error)
            return NextResponse.json({ error: "Could not submit the return request." }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error("Return API Internal Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
