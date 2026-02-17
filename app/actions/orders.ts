"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient()

    // 1. Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Unauthorized" }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        return { error: "Forbidden: Admin only" }
    }

    // 2. Update order status
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

    if (error) {
        console.error("Error updating order status:", error)
        return { error: "Failed to update status" }
    }

    // 3. Revalidate paths
    revalidatePath("/admin/orders")
    revalidatePath("/orders")

    return { success: true }
}
