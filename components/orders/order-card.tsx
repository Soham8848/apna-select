"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/format"
import { Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface OrderCardProps {
    order: any
}

export function OrderCard({ order }: OrderCardProps) {
    const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        pending: "secondary", // Yellow-ish usually, but secondary is grey. We can customize or use what we have.
        paid: "default",      // Blue/Primary
        shipped: "default",   // Purple (custom color classes needed if we want specific)
        delivered: "outline", // Green usually
        cancelled: "destructive",
    }

    // Custom color map for Tailwind classes if Badge variants aren't enough
    const statusColorClasses: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100/80",
        paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100/80",
        shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100/80",
        delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100/80",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80",
    }

    const status = order.status.toLowerCase()
    const customClass = statusColorClasses[status] || ""

    return (
        <div className="border rounded-xl p-6 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Order ID: <span className="font-mono text-foreground">#{order.id.slice(0, 8)}</span></p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(order.total_amount)}</p>
                    {customClass ? (
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${customClass}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                    ) : (
                        <Badge variant={statusColors[status] || "outline"}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                    )}
                </div>
            </div>

            <Separator />

            {/* Body: Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {order.order_items.map((item: any) => (
                    <div key={item.id} className="relative w-16 h-16 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden border">
                        {item.products?.images?.[0] ? (
                            <Image
                                src={item.products.images[0]}
                                alt={item.products.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                <Package size={20} />
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 rounded-tl-md">
                            x{item.quantity}
                        </span>
                    </div>
                ))}
                {order.order_items.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No items (Wait, this shouldn't happen)</p>
                )}
            </div>

            <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href={`/orders/${order.id}`}>View Details & Tracking</Link>
            </Button>
        </div>
    )
}
