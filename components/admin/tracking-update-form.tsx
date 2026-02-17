'use client'

import { useActionState } from "react"
import { updateOrderTracking } from "@/lib/actions/order-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const initialState = {
    message: '',
    error: ''
}

export function TrackingUpdateForm({ orderId, shipments }: { orderId: string, shipments?: any[] }) {
    const [state, formAction, isPending] = useActionState(updateOrderTracking, initialState)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Shipment Updates</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="orderId" value={orderId} />

                    <div className="grid gap-2">
                        <Label htmlFor="shipmentId">Update Target</Label>
                        <Select name="shipmentId" defaultValue="general">
                            <SelectTrigger>
                                <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General Order Update</SelectItem>
                                {shipments?.map((shipment, index) => (
                                    <SelectItem key={shipment.id} value={shipment.id}>
                                        Shipment #{index + 1} ({shipment.courier_name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Delayed">Delayed</SelectItem>
                                <SelectItem value="In Transit">In Transit</SelectItem>
                                <SelectItem value="Return Initiated">Return Initiated</SelectItem>
                                <SelectItem value="Return Picked Up">Return Picked Up</SelectItem>
                                <SelectItem value="Refund Processed">Refund Processed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input name="description" placeholder="e.g. Arrived at Hub" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input name="location" placeholder="e.g. Mumbai" required />
                    </div>

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Updating...' : 'Update Status'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
