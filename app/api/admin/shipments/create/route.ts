import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const supabase = await createClient()

    // 1. Auth & Admin Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Validate Payload
    const body = await req.json()
    const { orderId, itemIds, courier, trackingNumber } = body

    if (!orderId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0 || !courier || !trackingNumber) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    try {
        // 3a. Create Shipment
        const { data: shipment, error: shipmentError } = await supabase
            .from('shipments')
            .insert({
                order_id: orderId,
                courier_name: courier,
                tracking_number: trackingNumber
            })
            .select()
            .single()

        if (shipmentError) throw shipmentError

        // 3b. Update Order Items
        const { error: itemsError } = await supabase
            .from('order_items')
            .update({ shipment_id: shipment.id })
            .in('id', itemIds)

        if (itemsError) throw itemsError

        // 3c. Update Tracking Log
        const logDescription = `Items shipped via ${courier}. Tracking: ${trackingNumber}`
        await supabase.from('order_tracking').insert({
            order_id: orderId,
            status: 'Shipped',
            description: logDescription,
            location: 'Warehouse'
        })

        // 3d. Check if ALL items are shipped
        const { data: allItems } = await supabase
            .from('order_items')
            .select('shipment_id')
            .eq('order_id', orderId)

        const allShipped = allItems?.every(item => item.shipment_id !== null)

        if (allShipped) {
            await supabase
                .from('orders')
                .update({ status: 'shipped' })
                .eq('id', orderId)
        } else {
            await supabase
                .from('orders')
                .update({ status: 'partially_shipped' })
                .eq('id', orderId)
        }

        return NextResponse.json({ success: true, shipment })

    } catch (error: any) {
        console.error("Shipment creation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
