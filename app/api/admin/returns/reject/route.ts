import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { itemId } = await req.json()

        // 1. Admin Check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // 2. Update Status to 'rejected'
        const { data, error } = await supabase
            .from('order_items')
            .update({ return_status: 'rejected' })
            .eq('id', itemId)
            .select('order_id')
            .single()

        if (error) throw error

        // 3. Optional: Add a tracking note saying it was rejected
        await supabase.from('order_tracking').insert({
            order_id: data.order_id,
            status: 'Return Rejected',
            description: 'Return request was reviewed and rejected. Contact support for details.',
            location: 'System'
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Return rejection error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}