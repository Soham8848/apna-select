"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Package, Truck, Plus } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface OrderItem {
    id: string
    quantity: number
    products: {
        title: string
    }
    shipment_id: string | null
    shipments?: {
        courier_name: string
        tracking_number: string
        created_at: string
    }
}

interface FulfillmentCardProps {
    orderId: string
    items: OrderItem[]
    trackingHistory?: any[]
}

// Helper to group by shipment (if not already grouped by Parent)
// But here we receive flat items
export function FulfillmentCard({ orderId, items, trackingHistory }: FulfillmentCardProps) {
    const router = useRouter()
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [courier, setCourier] = useState("")
    const [tracking, setTracking] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    // Filter unshipped items
    const unshippedItems = items.filter(item => !item.shipment_id)

    // Group shipped items by shipment_id manually if needed, or rely on passed data structure
    // Since we receive items with shipment_id, let's group them.
    const shipmentGroups: Record<string, OrderItem[]> = {}
    items.forEach(item => {
        if (item.shipment_id) {
            if (!shipmentGroups[item.shipment_id]) {
                shipmentGroups[item.shipment_id] = []
            }
            shipmentGroups[item.shipment_id].push(item)
        }
    })


    const toggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const handleSelectAll = () => {
        if (selectedItems.length === unshippedItems.length) {
            setSelectedItems([])
        } else {
            setSelectedItems(unshippedItems.map(i => i.id))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedItems.length === 0) {
            toast.error("Please select at least one item")
            return
        }
        if (!courier || !tracking) {
            toast.error("Please enter courier and tracking number")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/shipments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    itemIds: selectedItems,
                    courier,
                    trackingNumber: tracking
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Failed to create shipment")

            toast.success("Shipment created successfully")
            router.refresh()
            setSelectedItems([])
            setCourier("")
            setTracking("")
            setIsSheetOpen(false)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* 1. Unshipped Items Queue */}
            {unshippedItems.length > 0 && (
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Pending Fulfillment
                                </CardTitle>
                                <CardDescription>
                                    {unshippedItems.length} items waiting to be shipped
                                </CardDescription>
                            </div>
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button size="sm">Create Shipment</Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Create New Shipment</SheetTitle>
                                        <SheetDescription>
                                            Select items and enter tracking details.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b">
                                                <span className="text-sm font-medium">Select Items</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleSelectAll}
                                                    className="h-auto p-0 text-primary"
                                                >
                                                    {selectedItems.length === unshippedItems.length ? "Deselect All" : "Select All"}
                                                </Button>
                                            </div>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                {unshippedItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50"
                                                        onClick={() => toggleItem(item.id)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(item.id)}
                                                            onChange={() => toggleItem(item.id)}
                                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-sm">{item.products.title}</p>
                                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label>Courier</Label>
                                                <Input
                                                    placeholder="e.g. UPS, FedEx"
                                                    value={courier}
                                                    onChange={e => setCourier(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tracking Number</Label>
                                                <Input
                                                    placeholder="Tracking ID"
                                                    value={tracking}
                                                    onChange={e => setTracking(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isSubmitting || selectedItems.length === 0}>
                                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Confirm Shipment
                                        </Button>
                                    </form>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            Ready to process.
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 2. Existing Shipments History */}
            {Object.entries(shipmentGroups).map(([shipmentId, groupItems], idx) => {
                const shipmentEvents = trackingHistory?.filter((e: any) => e.shipment_id === shipmentId) || []

                return (
                    <Card key={shipmentId} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        Shipment #{idx + 1}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">{groupItems[0].shipments?.courier_name || "Courier"}</span>
                                        <span>•</span>
                                        <span className="font-mono">{groupItems[0].shipments?.tracking_number || "No Tracking"}</span>
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-2">
                                {groupItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>{item.products.title}</span>
                                        <span className="text-muted-foreground">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {shipmentEvents.length > 0 && (
                                <div className="pt-4 border-t">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">Shipment History</p>
                                    <div className="space-y-4 pl-2 border-l-2 border-muted">
                                        {shipmentEvents.map((event: any) => (
                                            <div key={event.id} className="relative pl-4">
                                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-medium">{event.status}</span>
                                                    <span className="text-xs text-muted-foreground">{event.description}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
