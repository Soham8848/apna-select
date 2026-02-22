'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, RotateCcw, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

// 1. MAIN PARENT COMPONENT
export function UserOrderItems({ items, orderStatus }: { items: any[], orderStatus: string }) {
    return (
        <div className="space-y-6">
            {items.map((item) => (
                <OrderItemRow key={item.id} item={item} orderStatus={orderStatus} />
            ))}
        </div>
    )
}

// 2. ISOLATED CHILD COMPONENT (Prevents state bleeding)
function OrderItemRow({ item, orderStatus }: { item: any, orderStatus: string }) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [reason, setReason] = useState("")

    const handleReturnRequest = async () => {
        if (!reason.trim()) {
            toast.error("Please enter a reason")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch('/api/orders/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: item.id, reason })
            })

            if (!res.ok) throw new Error("Failed to submit request")

            toast.success("Return request submitted")
            setIsModalOpen(false)
            router.refresh()
        } catch (error) {
            toast.error("Could not process request")
        } finally {
            setIsLoading(false)
        }
    }

    const isDelivered = orderStatus.toLowerCase() === 'delivered'

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b last:border-0">
            {/* Product Info */}
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted rounded-md overflow-hidden border flex-shrink-0 relative">
                    <Image
                        src={item.products?.images?.[0] || '/placeholder.png'}
                        alt={item.products?.title || 'Product image'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                </div>
                <div>
                    <h4 className="font-medium text-sm sm:text-base">{item.products.title}</h4>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-semibold mt-1">${item.price_at_purchase}</p>
                </div>
            </div>

            {/* Status & Actions - ISOLATED LOGIC */}
            <div className="flex items-center sm:justify-end min-w-[140px]">
                {/* 1. NOT REQUESTED YET */}
                {(!item.return_status || item.return_status === 'none') && (
                    <>
                        {isDelivered ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsModalOpen(true)}
                                className="text-xs"
                            >
                                <RotateCcw className="w-3 h-3 mr-2" />
                                Return Item
                            </Button>
                        ) : (
                            // Only show if NOT delivered yet
                            null
                        )}
                    </>
                )}

                {/* 2. REQUESTED (PENDING) */}
                {item.return_status === 'requested' && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 gap-1.5 py-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Pending Approval
                    </Badge>
                )}

                {/* 3. APPROVED */}
                {item.return_status === 'approved' && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1.5 py-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Return Approved
                    </Badge>
                )}

                {/* 4. REJECTED */}
                {item.return_status === 'rejected' && (
                    <div className="flex flex-col items-end">
                        <Badge variant="destructive" className="gap-1.5 py-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            Return Rejected
                        </Badge>
                        <span className="text-[10px] text-muted-foreground mt-1">Contact Support</span>
                    </div>
                )}
            </div>

            {/* Modal - specific to THIS item only */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Return Request</DialogTitle>
                        <DialogDescription>
                            Why are you returning the <strong>{item.products.title}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label>Reason</Label>
                        <Textarea
                            placeholder="e.g. Item arrived damaged, Wrong color..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleReturnRequest} disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}