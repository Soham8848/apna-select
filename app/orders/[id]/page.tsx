import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OrderTimeline } from "@/components/order/order-timeline"
import { UserOrderItems } from "@/components/order/user-order-items"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MapPin, Package, Truck, ExternalLink, Copy } from "lucide-react"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Fetch Order with Shipments
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                products (
                    title,
                    images
                ),
                shipment:shipments(*)
            ),
            shipments (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !order) {
        return <div className="container py-16 text-center">Order not found</div>
    }

    // Fetch Tracking
    const { data: tracking } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false })

    // Group Items
    const pendingItems = order.order_items.filter((item: any) => !item.shipment_id)

    // Create a map of shipmentId -> items
    const shipmentGroups: Record<string, any[]> = {}
    order.shipments?.forEach((shipment: any) => {
        shipmentGroups[shipment.id] = order.order_items.filter((item: any) => item.shipment_id === shipment.id)
    })

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
            <Link href="/orders" className="flex items-center text-muted-foreground hover:text-foreground transition-colors w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
                    <p className="text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                        {order.status}
                    </span>
                    <span className="font-mono text-muted-foreground text-sm">#{order.id.slice(0, 8)}</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Items (Grouped by Shipment) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Render Shipment Groups */}
                    {order.shipments?.map((shipment: any, index: number) => (
                        <Card key={shipment.id} className="border-border/60 shadow-sm overflow-hidden">
                            <CardHeader className="border-b bg-muted/40 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Truck className="w-4 h-4 text-primary" />
                                        Shipment #{index + 1}
                                    </CardTitle>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="text-muted-foreground">{shipment.courier_name}</span>
                                        <div className="flex items-center gap-1 font-mono bg-background px-2 py-1 rounded border">
                                            {shipment.tracking_number}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                            <a
                                                href={`https://www.google.com/search?q=${shipment.courier_name}+tracking+${shipment.tracking_number}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Track Package"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <UserOrderItems items={shipmentGroups[shipment.id] || []} orderStatus={order.status} />

                                {/* Shipment Specific Tracking */}
                                {(tracking || []).filter((e: any) => e.shipment_id === shipment.id).length > 0 && (
                                    <div className="mt-6 pt-4 border-t">
                                        <details className="group">
                                            <summary className="flex items-center gap-2 text-sm font-medium cursor-pointer list-none text-muted-foreground hover:text-foreground transition-colors">
                                                <span className="group-open:rotate-90 transition-transform">▶</span>
                                                View Tracking History
                                            </summary>
                                            <div className="mt-4 pl-4 border-l-2 border-muted space-y-4">
                                                {(tracking || []).filter((e: any) => e.shipment_id === shipment.id).map((event: any) => (
                                                    <div key={event.id} className="relative pl-4">
                                                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                                                        <div className="flex flex-col text-sm">
                                                            <span className="font-medium text-foreground">{event.status}</span>
                                                            <span className="text-muted-foreground text-xs">{event.description}</span>
                                                            <span className="text-xs text-muted-foreground mt-0.5">
                                                                {new Date(event.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Pending Items */}
                    {pendingItems.length > 0 && (
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="border-b bg-muted/40 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                    Preparing for Dispatch
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <UserOrderItems items={pendingItems} orderStatus={order.status} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Order Summary Footer */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${order.total_amount}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs font-bold text-lg pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span>${order.total_amount}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Timeline & Shipping */}
                <div className="space-y-6">
                    {/* Delivery Details Card */}
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="border-b bg-muted/40 pb-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                Delivery Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">{order.shipping_address?.full_name}</p>
                                <div className="text-sm text-muted-foreground space-y-0.5">
                                    <p>{order.shipping_address?.address_line1}</p>
                                    {order.shipping_address?.address_line2 && <p>{order.shipping_address?.address_line2}</p>}
                                    <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}</p>
                                    <p>{order.shipping_address?.country}</p>
                                </div>
                                {(order.shipping_address?.phone || order.shipping_address?.email) && (
                                    <div className="text-xs text-muted-foreground pt-3 mt-3 border-t w-full space-y-1">
                                        {order.shipping_address?.email && <p>Email: {order.shipping_address.email}</p>}
                                        {order.shipping_address?.phone && <p>Phone: {order.shipping_address.phone}</p>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline Card - General Events Only */}
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="border-b bg-muted/40 pb-4">
                            <CardTitle className="text-base">Order Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <OrderTimeline events={tracking?.filter((e: any) => !e.shipment_id) || []} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
