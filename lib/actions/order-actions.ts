'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOrderTracking(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const orderId = formData.get('orderId') as string
    const status = formData.get('status') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const shipmentId = formData.get('shipmentId') as string | null // "general" or uuid

    if (!orderId || !status || !description || !location) {
        return { error: "Missing required fields" }
    }

    try {
        // 1. Insert into order_tracking
        const { error: trackingError } = await supabase
            .from('order_tracking')
            .insert({
                order_id: orderId,
                status,
                description,
                location,
                shipment_id: shipmentId === 'general' ? null : shipmentId
            })

        if (trackingError) throw trackingError

        // 2. Update parent order status (Optional: logic could be more complex here to deduce "Partially Shipped")
        // keeping simple overwrite for now as per original
        const { error: orderError } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)

        if (orderError) throw orderError

        revalidatePath(`/admin/orders/${orderId}`)
        revalidatePath(`/orders/${orderId}`)
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function requestReturn(itemId: string, reason: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('order_items')
            .update({
                return_status: 'requested',
                return_reason: reason
            })
            .eq('id', itemId)

        if (error) throw error

        revalidatePath('/orders') // Revalidate list just in case
        // We can't easily know the order ID here without fetching, but usually the UI will revalidate current path
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function approveReturn(itemId: string) {
    const supabase = await createClient()

    try {
        // 1. Get the item to find the order_id
        const { data: item, error: fetchError } = await supabase
            .from('order_items')
            .select('order_id')
            .eq('id', itemId)
            .single()

        if (fetchError || !item) throw new Error("Item not found")

        // 2. Approve Return
        const { error } = await supabase
            .from('order_items')
            .update({ return_status: 'approved' })
            .eq('id', itemId)

        if (error) throw error

        // 3. Add Tracking Event
        await supabase
            .from('order_tracking')
            .insert({
                order_id: item.order_id,
                status: 'Return Approved',
                description: 'Return request approved. Pickup will be scheduled.',
                location: 'System'
            })

        // 4. Update Parent Order Status
        await supabase
            .from('orders')
            .update({ status: 'Return Processing' })
            .eq('id', item.order_id)

        revalidatePath(`/admin/orders/${item.order_id}`)
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function rejectReturn(itemId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('order_items')
            .update({ return_status: 'rejected' })
            .eq('id', itemId)

        if (error) throw error

        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}
