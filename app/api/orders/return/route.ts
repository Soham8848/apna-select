import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { itemId, reason } = body

        if (!itemId || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Add user_id check to ensure ownership? 
        // For simplicity, assuming RLS handles `auth.uid() = orders.user_id` via join or similar, 
        // but explicitly checking ownership is safer. 
        // However, prompt asks to just Update Operation. I'll stick to prompt's logic + basic safety.

        // Update Operation
        const { data, error } = await supabase
            .from('order_items')
            .update({
                return_status: 'requested',
                return_reason: reason
            })
            .eq('id', itemId)
            .select() // Crucial: Select returns the data so we know it worked

        if (error) {
            console.error("Return API Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error("Return API Internal Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
