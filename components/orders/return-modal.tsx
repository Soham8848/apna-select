'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ReturnModalProps {
    itemId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function ReturnModal({ itemId, isOpen, onOpenChange, children }: ReturnModalProps) {
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (!reason.trim()) return

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/orders/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, reason }),
            })

            console.log("Response:", response)

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit return")
            }

            toast.success("Return request submitted. Status will update shortly.")
            onOpenChange(false)
            setReason('')
            router.refresh() // Triggers UserOrderItems to re-render with new status

        } catch (error: any) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request Return</DialogTitle>
                    <DialogDescription>
                        Why do you want to return this item?
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Return</Label>
                        <Textarea
                            id="reason"
                            placeholder="Wrong size, damaged, etc..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !reason.trim()}>
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
