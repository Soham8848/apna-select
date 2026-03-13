import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TrackingUpdateForm } from "@/components/admin/tracking-update-form"
import { AdminOrderItems } from "@/components/admin/admin-order-items"
import { FulfillmentCard } from "./fulfillment-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"


export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Admin check
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
    if (!profile?.is_admin) redirect("/")

    // Fetch Order
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                products (
                    title,
                    images
                )
            )
        `)
        .eq('id', id)
        .single()

    if (order) {
        console.log('Admin Item Data:', order.order_items.map((i: any) => ({
            id: i.id,
            status: i.return_status
        })))
    }

    if (error || !order) {
        return <div className="p-8">Order not found</div>
    }

    // Fetch Tracking History
    const { data: trackingHistory } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold">Order {order.id.slice(0, 8)}...</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Order Details & Items */}
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-muted-foreground block text-sm">Status</span>
                                    <span className="font-medium capitalize">{order.status}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-sm">Date</span>
                                    <span className="font-medium">
                                        {new Date(order.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-sm">Total</span>
                                    <span className="font-medium">${order.total_amount}</span>
                                </div>
                            </div>

                            <Separator />
                            
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    Customer Details
                                    {order.user_id ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border inline-block">Registered</span>
                                    ) : (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border inline-block">Guest</span>
                                    )}
                                </h3>
                                <p className="text-sm font-medium">{order.customer_name || order.shipping_address?.full_name || "Unknown"}</p>
                                <p className="text-sm text-muted-foreground">{order.customer_email || "N/A"} • {order.customer_phone || "N/A"}</p>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    {order.order_address_snapshot ? (
                                        <>
                                            {order.order_address_snapshot.line_1}<br />
                                            {order.order_address_snapshot.line_2 && <>{order.order_address_snapshot.line_2}<br /></>}
                                            {order.order_address_snapshot.city}, {order.order_address_snapshot.state} - {order.order_address_snapshot.pincode}
                                        </>
                                    ) : order.shipping_address ? (
                                        <>
                                            {order.shipping_address.address_line1}<br />
                                            {order.shipping_address.address_line2 && <>{order.shipping_address.address_line2}<br /></>}
                                            {order.shipping_address.city}, {order.shipping_address.state}
                                        </>
                                    ) : (
                                        "No shipping address"
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <AdminOrderItems items={order.order_items} />
                </div>

                {/* Right Column: Tracking Actions & History */}
                <div className="space-y-8">
                    <FulfillmentCard orderId={order.id} items={order.order_items} trackingHistory={trackingHistory || []} />
                    <TrackingUpdateForm orderId={order.id} shipments={order.shipments} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Tracking History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {trackingHistory?.filter((e: any) => !e.shipment_id).map((event: any, i: number) => (
                                    <div key={event.id} className="relative pl-6 border-l last:border-0 border-muted-foreground/20 pb-6 last:pb-0">
                                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{event.status}</span>
                                            <span className="text-muted-foreground text-xs">{event.description}</span>
                                            <span className="text-muted-foreground text-xs">{event.location}</span>
                                            <span className="text-xs text-muted-foreground mt-1">
                                                {new Date(event.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!trackingHistory || trackingHistory.length === 0) && (
                                    <p className="text-muted-foreground text-sm">No tracking updates yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
