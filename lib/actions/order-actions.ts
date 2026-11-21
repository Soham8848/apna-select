'use server'

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/server/auth"
import { createAdminClient } from "@/lib/supabase/admin"

type ActionState = { success?: boolean; error?: string } | null

/**
 * Admin: add a tracking event to an order and update its status.
 *
 * Server actions are callable by anyone who can load the page that uses them,
 * so the admin check lives here, not just in the admin layout.
 *
 * (The unused requestReturn / approveReturn / rejectReturn actions that used to
 * live here had no auth checks at all; the UI uses the /api/orders/return and
 * /api/admin/returns/* routes instead, so they were removed.)
 */
export async function updateOrderTracking(_prevState: ActionState, formData: FormData) {
    const auth = await requireAdmin()
    if (!auth.ok) return { error: auth.error }

    const db = createAdminClient() ?? auth.supabase

    const orderId = formData.get('orderId') as string
    const status = formData.get('status') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const shipmentId = formData.get('shipmentId') as string | null // "general" or uuid

    if (!orderId || !status || !description || !location) {
        return { error: "Missing required fields" }
    }

    const { error: trackingError } = await db
        .from('order_tracking')
        .insert({
            order_id: orderId,
            status,
            description,
            location,
            shipment_id: shipmentId === 'general' ? null : shipmentId
        })

    if (trackingError) return { error: trackingError.message }

    const { error: orderError } = await db
        .from('orders')
        .update({ status })
        .eq('id', orderId)

    if (orderError) return { error: orderError.message }

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/orders/${orderId}`)
    return { success: true }
}
