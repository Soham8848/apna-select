import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, Truck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Product } from "@/types/supabase"
import { categoryByName } from "@/lib/categories"
import { deliveryWindow, inr, savings, stockState } from "@/lib/commerce"
import { Price } from "@/components/commerce/price"
import { Rating } from "@/components/commerce/rating"
import { TrustChips, TrustBar } from "@/components/commerce/trust"
import { ProductCard } from "@/components/ProductCard"
import { ProductGallery } from "@/components/product/product-gallery"
import { AddReviewForm } from "@/components/product/add-review-form"
import { BuyBox } from "@/components/product/buy-box"
import { StickyBuyBar } from "@/components/product/sticky-buy-bar"
import { SectionHeader } from "@/components/storefront/section-header"

export const revalidate = 60

interface PageProps {
    params: Promise<{ id: string }>
}

interface Review {
    id: string | number
    rating: number
    comment?: string | null
    content?: string | null
    author?: string | null
    created_at: string
}

async function getProduct(id: string) {
    const supabase = await createClient()
    const { data } = await supabase.from("products").select("*").eq("id", id).single()
    return data as Product | null
}

/** Per-product titles and descriptions — these are what shows up in search. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const product = await getProduct(id)
    if (!product) return { title: "Product not found" }

    const description =
        product.description?.slice(0, 155) ||
        `Buy ${product.title} on Apna Select with free delivery over ₹499 and cash on delivery.`

    return {
        title: product.title,
        description,
        openGraph: {
            title: product.title,
            description,
            images: product.images?.[0] || product.image_url || undefined,
        },
    }
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: productData, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !productData) notFound()
    const product = productData as Product

    const { data: relatedData } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(5)

    let reviews: Review[] = []
    try {
        const { data } = await supabase
            .from("reviews")
            .select("*")
            .eq("product_id", id)
            .order("created_at", { ascending: false })
            .limit(10)
        if (data) reviews = data as Review[]
    } catch {
        // Reviews are optional; never let a missing table 500 the product page.
    }

    const related = (relatedData || []) as Product[]
    const images = product.images?.length
        ? product.images
        : product.image_url
          ? [product.image_url]
          : []

    const averageRating =
        product.average_rating ||
        (reviews.length
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0)

    const reviewCount = product.review_count ?? reviews.length
    const specs = product.specifications as Record<string, string> | null
    const stock = stockState(product.inventory_count)
    const saved = savings(product.price, product.compare_at_price)
    const cat = categoryByName(product.category)

    /**
     * Product structured data. This is what earns the price, rating and
     * availability chips in Google results — effectively free, higher-intent
     * traffic, which is why it belongs on every product page.
     */
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description ?? undefined,
        image: images,
        category: product.category,
        offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "INR",
            availability: stock.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
        },
        ...(averageRating > 0 && reviewCount > 0
            ? {
                  aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: Number(averageRating.toFixed(1)),
                      reviewCount,
                  },
              }
            : {}),
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Bottom padding clears the mobile sticky buy bar */}
            <div className="shell pb-28 pt-6 md:pb-12">
                <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
                    <Link href="/" className="hover:text-accent hover:underline">
                        Home
                    </Link>
                    <span className="mx-1.5">/</span>
                    <Link
                        href={`/category/${cat?.slug ?? encodeURIComponent(product.category ?? "")}`}
                        className="hover:text-accent hover:underline"
                    >
                        {product.category}
                    </Link>
                    <span className="mx-1.5">/</span>
                    <span className="line-clamp-1 font-semibold text-foreground">
                        {product.title}
                    </span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-12">
                    <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
                        <ProductGallery images={images} title={product.title} />
                    </div>

                    {/* Buy box column — everything needed to decide, nothing else */}
                    <div className="min-w-0">
                        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                            {product.title}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Rating value={averageRating || null} count={reviewCount} />
                            {reviewCount > 0 && (
                                <a
                                    href="#reviews"
                                    className="text-xs font-semibold text-accent hover:underline"
                                >
                                    Read reviews
                                </a>
                            )}
                        </div>

                        <div className="mt-5 border-y border-border py-5">
                            <Price
                                price={product.price}
                                compareAt={product.compare_at_price}
                                size="lg"
                            />
                            {saved !== null && (
                                <p className="mt-1.5 text-sm font-bold text-trust">
                                    You save {inr(saved)}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                                Inclusive of all taxes
                            </p>

                            <p
                                className={
                                    stock.tone === "urgent"
                                        ? "mt-3 text-sm font-bold text-urgent"
                                        : stock.tone === "trust"
                                          ? "mt-3 text-sm font-semibold text-trust"
                                          : "mt-3 text-sm font-semibold text-muted-foreground"
                                }
                            >
                                {stock.label}
                            </p>
                        </div>

                        {/* Delivery promise: a concrete date beats "3-5 business days",
                            because the shopper does not have to work it out. */}
                        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-trust-subtle p-3.5">
                            <Truck className="mt-0.5 size-4 shrink-0 text-trust" />
                            <div className="text-sm">
                                <p className="font-bold text-foreground">
                                    Delivery by {deliveryWindow()}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Free delivery on orders over ₹499 · Cash on delivery available
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <BuyBox product={product} max={product.inventory_count} />
                        </div>

                        <TrustChips className="mt-5 border-t border-border pt-5" />

                        {product.description && (
                            <div className="mt-6">
                                <h2 className="mb-2 font-display text-base font-extrabold">
                                    About this product
                                </h2>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {specs && Object.keys(specs).length > 0 && (
                            <div className="mt-6">
                                <h2 className="mb-3 font-display text-base font-extrabold">
                                    Specifications
                                </h2>
                                <dl className="overflow-hidden rounded-xl border border-border">
                                    {Object.entries(specs).map(([key, value], i) => (
                                        <div
                                            key={key}
                                            className={`grid grid-cols-[40%_60%] gap-2 px-4 py-2.5 text-sm ${
                                                i % 2 ? "bg-surface-sunken" : "bg-card"
                                            }`}
                                        >
                                            <dt className="capitalize text-muted-foreground">
                                                {key.replace(/_/g, " ")}
                                            </dt>
                                            <dd className="font-semibold">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TrustBar />

            {/* Reviews */}
            <section id="reviews" className="shell scroll-mt-24 py-12">
                <SectionHeader
                    eyebrow="Social proof"
                    title="Customer reviews"
                    subtitle={
                        reviewCount > 0
                            ? `${averageRating.toFixed(1)} out of 5 from ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
                            : "Be the first to review this product."
                    }
                />

                <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <AddReviewForm productId={product.id} userId={user?.id} />
                    </div>

                    <div className="space-y-3">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <article
                                    key={review.id}
                                    className="rounded-xl border border-border bg-card p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex" aria-hidden>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={
                                                            i < review.rating
                                                                ? "size-3.5 fill-star text-star"
                                                                : "size-3.5 fill-border text-border"
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="rounded bg-trust-subtle px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-trust">
                                                Verified purchase
                                            </span>
                                        </div>
                                        <time
                                            dateTime={review.created_at}
                                            className="shrink-0 text-xs text-muted-foreground"
                                        >
                                            {new Date(review.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </time>
                                    </div>
                                    <p className="mt-2.5 text-sm leading-relaxed text-card-foreground">
                                        {review.comment || review.content}
                                    </p>
                                </article>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-border p-10 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No reviews yet. Bought this? Share your experience and help
                                    the next shopper decide.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {related.length > 0 && (
                <section className="shell border-t border-border py-12">
                    <SectionHeader
                        eyebrow="Keep looking"
                        title="You might also like"
                        href={`/category/${cat?.slug ?? ""}`}
                        hrefLabel={`More ${product.category}`}
                    />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {related.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            <StickyBuyBar product={product} />
        </>
    )
}
