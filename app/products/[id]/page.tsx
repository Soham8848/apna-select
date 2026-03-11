import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShoppingCart, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ProductCard"
import { AddToCartButton } from "@/components/AddToCartButton"
import { ProductGallery } from "@/components/product/product-gallery"
import { AddReviewForm } from "@/components/product/add-review-form"

export const revalidate = 60; // Revalidate every minute

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch Product
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !product) {
        notFound()
    }

    // 2. Fetch Related Products
    const { data: relatedProducts } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(4)

    // 3. Fetch Reviews
    let reviews = []
    try {
        const { data: reviewsData } = await supabase
            .from("reviews")
            .select("*")
            .eq("product_id", id)
            .order("created_at", { ascending: false })
            .limit(10)

        if (reviewsData) reviews = reviewsData
    } catch (e) {
        console.warn("Could not fetch reviews", e)
    }

    // Calculate Average Rating dynamically if needed, 
    // but relying on product.average_rating if available or calculating from reviews for now if small set.
    // For now, let's use the product's stored rating or fallback to reviews average.
    const averageRating = product.average_rating || (reviews.length > 0
        ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
        : 0)

    // JSONB Specs
    const specs = product.specifications as Record<string, string> | null

    const images = product.images || (product.image_url ? [product.image_url] : [])

    return (
        <div className="min-h-screen bg-zinc-50 pb-32 md:pb-20 dark:bg-zinc-950/50">
            <div className="container mx-auto px-4 py-8">

                {/* Top Section: Grid */}
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">

                    {/* Left: Immersive Image Gallery */}
                    <div className="md:sticky md:top-24 md:self-start">
                        <ProductGallery images={images} title={product.title} />
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col pt-2">
                        <div className="mb-6">
                            <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                {product.category}
                            </span>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
                                {product.title}
                            </h1>
                        </div>

                        {/* Rating */}
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mr-2">{averageRating.toFixed(1)}</span>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-800 dark:text-zinc-800"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 underline decoration-zinc-300 underline-offset-4 cursor-pointer hover:text-blue-500 transition-colors">
                                {reviews.length} reviews
                            </span>
                        </div>

                        {/* Price */}
                        <div className="mb-10 flex items-center gap-4">
                            <p className="text-5xl font-bold text-zinc-900 dark:text-white">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
                            </p>
                            {product.compare_at_price && (
                                <p className="text-2xl font-medium text-zinc-400 line-through decoration-2">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.compare_at_price)}
                                </p>
                            )}
                        </div>

                        {/* Stock Status Indicator */}
                        <div className="mb-6">
                            {(!product.inventory_count || product.inventory_count <= 0) ? (
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 dark:bg-red-500"></span>
                                    </span>
                                    <span className="text-sm font-bold text-red-600 dark:text-red-500">Out of Stock</span>
                                </div>
                            ) : product.inventory_count <= 5 ? (
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                    </span>
                                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                        Only {product.inventory_count} left in stock - order soon!
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">In Stock</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="prose prose-zinc dark:prose-invert mb-10 max-w-none leading-relaxed text-zinc-600 dark:text-zinc-300">
                            <p>{product.description}</p>
                        </div>

                        {/* Tech Specs - Glassmorphism */}
                        {specs && (
                            <div className="hidden md:block mb-10 rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tech Specs</h3>
                                <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2">
                                    {Object.entries(specs).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800 md:block md:border-0 md:pb-0">
                                            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 capitalize">{key.replace(/_/g, ' ')}</dt>
                                            <dd className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{value}</dd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart (Desktop) */}
                        <div className="hidden md:block mt-auto">
                            <div className="flex gap-4">
                                <AddToCartButton product={product} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Specs Section (if needed, kept simple for now as requested) */}

                {/* Reviews Section */}
                <div className="mt-24 max-w-5xl mx-auto">
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Customer Reviews</h2>
                            <p className="text-zinc-500 dark:text-zinc-400">See what others are saying about the {product.title}</p>
                        </div>
                        <div className="flex items-center gap-4 rounded-full border border-zinc-200 bg-white px-6 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                            </div>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-700 pl-4">{reviews.length} Ratings</span>
                        </div>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-12">
                        {/* Review Form */}
                        <div className="lg:col-span-5">
                            <AddReviewForm productId={product.id} userId={user?.id} />
                        </div>

                        {/* Reviews List */}
                        <div className="lg:col-span-7 space-y-6">
                            {reviews.length > 0 ? (
                                reviews.map((review: any) => (
                                    <div key={review.id} className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-800 dark:text-zinc-800"}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-xs px-2 py-0.5 rounded-full font-medium">Verified Purchase</span>
                                            </div>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">"{review.comment || review.content}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
                                    <p className="text-zinc-500">No reviews yet. Be the first to share your thoughts!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer: Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-24 border-t border-zinc-200 pt-24 dark:border-zinc-800">
                        <h2 className="mb-10 text-2xl font-bold">You Might Also Like</h2>
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Sticky Bottom Bar - "Creative Extra" */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/80 p-4 pb-safe backdrop-blur-lg md:hidden dark:border-zinc-800 dark:bg-zinc-950/80">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Total</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
                        </p>
                    </div>
                    <div className="flex-1">
                        <AddToCartButton product={product} className="w-full shadow-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}
