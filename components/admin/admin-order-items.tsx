'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Check, X, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Helper to calculate total
const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

export function AdminOrderItems({ items: initialItems }: { items: any[] }) {
    const router = useRouter()

    // OPTIMISTIC STATE: We initialize state with props, but we can update it instantly
    const [items, setItems] = useState(initialItems)
    const [processingId, setProcessingId] = useState<string | null>(null)

    // Sync state if parent re-fetches (e.g. after router.refresh completes)
    useEffect(() => {
        setItems(initialItems)
    }, [initialItems])

    const updateStatus = async (itemId: string, newStatus: 'approved' | 'rejected') => {
        // 1. Optimistic Update (Instant UI Feedback)
        setProcessingId(itemId)
        const previousItems = [...items]

        // Update the UI immediately before server responds
        setItems(current => current.map(item =>
            item.id === itemId ? { ...item, return_status: newStatus } : item
        ))

        try {
            // 2. Server Action
            const endpoint = newStatus === 'approved'
                ? '/api/admin/returns/approve'
                : '/api/admin/returns/reject' // You need to make sure this route exists too

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId })
            })

            if (!res.ok) throw new Error("Failed to update")

            toast.success(`Return ${newStatus} successfully`)
            router.refresh() // Fetch real data to confirm

        } catch (error) {
            // 3. Rollback on Error
            toast.error("Update failed, rolling back")
            setItems(previousItems)
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Items & Return Requests</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`flex flex-col sm:flex-row items-start justify-between p-4 rounded-lg border transition-all ${item.return_status === 'requested'
                                ? 'bg-amber-500/5 border-amber-500/30'
                                : 'border-border'
                                }`}
                        >
                            {/* Product Info */}
                            <div className="flex gap-4 mb-4 sm:mb-0">
                                <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0 border">
                                    <Image
                                        src={item.products?.images?.[0] || '/placeholder.png'}
                                        alt={item.products?.title || 'Product image'}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm sm:text-base">{item.products.title}</p>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Qty: {item.quantity} × {formatCurrency(item.price_at_purchase)}
                                    </div>

                                    {/* Reason Box - Always visible if a reason exists */}
                                    {item.return_reason && (
                                        <div className="mt-2 p-2 bg-background rounded border text-xs max-w-sm">
                                            <span className="font-semibold text-amber-600 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Return Reason:
                                            </span>
                                            <span className="italic text-muted-foreground">"{item.return_reason}"</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions / Status Column */}
                            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                                <p className="font-medium text-sm">{formatCurrency(item.price_at_purchase * item.quantity)}</p>

                                {/* LOGIC: STRICT CONDITIONAL RENDERING */}

                                {/* 1. PENDING REQUEST */}
                                {item.return_status === 'requested' && (
                                    <div className="flex flex-col items-end gap-2 animate-in fade-in">
                                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 mb-1">
                                            Action Required
                                        </Badge>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                                                onClick={() => updateStatus(item.id, 'approved')}
                                                disabled={!!processingId}
                                            >
                                                {processingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-8 text-xs"
                                                onClick={() => updateStatus(item.id, 'rejected')}
                                                disabled={!!processingId}
                                            >
                                                <X className="w-3 h-3 mr-1" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* 2. APPROVED */}
                                {item.return_status === 'approved' && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 px-3 py-1">
                                        <Check className="w-3 h-3 mr-1" /> Returned
                                    </Badge>
                                )}

                                {/* 3. REJECTED */}
                                {item.return_status === 'rejected' && (
                                    <Badge variant="destructive" className="px-3 py-1">
                                        <X className="w-3 h-3 mr-1" /> Return Rejected
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}