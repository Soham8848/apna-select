"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface AddReviewFormProps {
    productId: string
    userId?: string
}

export function AddReviewForm({ productId, userId }: AddReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    // If no user, we might want to show login prompt or disable
    // For now assuming parent handles auth check or we check here

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) {
            setMessage({ type: 'error', text: "You must be logged in to review." })
            return
        }
        if (rating === 0) {
            setMessage({ type: 'error', text: "Please select a rating." })
            return
        }

        setIsSubmitting(true)
        setMessage(null)

        const supabase = createClient()

        try {
            const { error } = await supabase.from('reviews').insert({
                product_id: productId,
                user_id: userId,
                rating: rating,
                comment: comment
            })

            if (error) throw error

            setMessage({ type: 'success', text: "Review submitted successfully!" })
            setComment("")
            setRating(0)
            router.refresh() // Refresh server components to show new review

        } catch (error: any) {
            console.error("Error submitting review:", error)
            setMessage({ type: 'error', text: error.message || "Failed to submit review." })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">Write a Review</h3>

            {/* Rating Stars */}
            <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="focus:outline-none"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={cn(
                                "h-6 w-6 transition-colors",
                                (hoverRating || rating) >= star
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-zinc-100 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700"
                            )}
                        />
                    </button>
                ))}
            </div>

            {/* Comment */}
            <div className="mb-4">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full min-h-[100px] rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-500"
                    required
                />
            </div>

            {/* Message & Button */}
            <div className="flex items-center justify-between">
                <div>
                    {message && (
                        <p className={cn("text-sm", message.type === 'success' ? "text-green-600" : "text-red-600")}>
                            {message.text}
                        </p>
                    )}
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isSubmitting ? "Submitting..." : "Post Review"}
                </Button>
            </div>
        </form>
    )
}
