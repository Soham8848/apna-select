import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { itemId } = await req.json()

        // 1. Admin Check (Security)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // 2. Update Item Status
        const { data: item, error: updateError } = await supabase
            .from('order_items')
            .update({ return_status: 'approved' })
            .eq('id', itemId)
            .select('order_id') // Get order ID to update timeline
            .single()

        if (updateError) throw updateError

        // 3. Add to Timeline (So user sees it in tracking)
        await supabase.from('order_tracking').insert({
            order_id: item.order_id,
            status: 'Return Approved',
            description: 'Your return request has been processed. Pickup scheduling in progress.',
            location: 'System'
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Return approval error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}