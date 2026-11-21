import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/server/auth"

const OUTCOMES = {
    approved: {
        tracking: "Return Approved",
        description: "Your return request has been processed. Pickup scheduling in progress.",
    },
    rejected: {
        tracking: "Return Rejected",
        description: "Return request was reviewed and rejected. Contact support for details.",
    },
} as const

/**
 * Admin decision on a return request. Shared by the approve and reject routes
 * so the admin check cannot be forgotten in one of them again — both
 * previously only checked that *someone* was logged in.
 */
export async function decideReturn(req: Request, outcome: keyof typeof OUTCOMES) {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    try {
        const { itemId } = await req.json()
        if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 })

        const db = createAdminClient() ?? auth.supabase

        const { data: item, error } = await db
            .from("order_items")
            .update({ return_status: outcome })
            .eq("id", itemId)
            .eq("return_status", "requested") // only act on an open request
            .select("order_id")
            .single()

        if (error || !item) {
            return NextResponse.json({ error: "No open return request for this item." }, { status: 404 })
        }

        await db.from("order_tracking").insert({
            order_id: item.order_id,
            status: OUTCOMES[outcome].tracking,
            description: OUTCOMES[outcome].description,
            location: "System",
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(`Return ${outcome} error:`, error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
