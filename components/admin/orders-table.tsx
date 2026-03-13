"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, Search, Filter } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/format"
import { updateOrderStatus } from "@/app/actions/orders"
import { toast } from "sonner"

interface OrdersTableProps {
    orders: any[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
    const [filterStatus, setFilterStatus] = useState("all")
    const [isLoading, setIsLoading] = useState<string | null>(null) // orderId if loading
    const router = useRouter()

    const filteredOrders = orders.filter(order => {
        if (filterStatus === "all") return true
        return order.status === filterStatus
    })

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setIsLoading(orderId)
        try {
            const result = await updateOrderStatus(orderId, newStatus)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Order status updated")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setIsLoading(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary'
            case 'paid': return 'default'
            case 'shipped': return 'default' // Purple isn't a default variant, but default (primary) is fine for now
            case 'delivered': return 'outline' // Green usually desired, outline is fine
            case 'cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Search could be added here later */}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium font-mono">
                                        {order.id.slice(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{order.customer_name || order.shipping_address?.full_name || "Unknown"}</span>
                                                {order.user_id ? (
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1 py-0">Registered</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1 py-0">Guest</Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {order.customer_email || "N/A"} • {order.customer_phone || "N/A"}
                                            </span>
                                            <div className="text-[10px] text-muted-foreground leading-tight mt-1 max-w-[200px] truncate">
                                                {order.order_address_snapshot ? (
                                                    <>
                                                        {order.order_address_snapshot.line_1}, {order.order_address_snapshot.city}, {order.order_address_snapshot.state} - {order.order_address_snapshot.pincode}
                                                    </>
                                                ) : order.shipping_address ? (
                                                    <>
                                                        {order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state}
                                                    </>
                                                ) : (
                                                    "No address"
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.created_at).toLocaleString('en-IN', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                            hour12: true
                                        })}
                                    </TableCell>
                                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="capitalize text-sm">{order.payment_method === 'cod' ? 'COD' : 'Online'}</span>
                                            <span className={`text-[10px] ${order.is_paid ? 'text-green-600' : 'text-amber-600'}`}>
                                                {order.is_paid ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={order.status}
                                            onValueChange={(val) => handleStatusChange(order.id, val)}
                                            disabled={isLoading === order.id}
                                        >
                                            <SelectTrigger className="h-8 w-[110px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="shipped">Shipped</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
