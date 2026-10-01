import Link from "next/link";
import { Quote, Star } from "lucide-react";

import { SectionHeader } from "./section-header";

export interface ReviewQuote {
    id: string | number;
    rating: number;
    comment: string | null;
    author: string | null;
    product_id: string | number | null;
    product_title?: string | null;
}

/**
 * Social proof, built strictly from real rows in the `reviews` table.
 *
 * Deliberately NOT seeded with invented testimonials. Fake reviews are the
 * single fastest way to lose a repeat customer (and in India they are also a
 * consumer-protection problem under the 2022 dark-pattern guidelines). If
 * there are no reviews yet this section renders nothing, and the trust bar
 * above it carries the weight until genuine reviews arrive.
 */
export function SocialProof({ reviews }: { reviews: ReviewQuote[] }) {
    const usable = reviews.filter((r) => r.comment && r.comment.trim().length > 20);
    if (usable.length < 2) return null;

    return (
        <section className="shell py-10">
            <SectionHeader
                eyebrow="Real reviews"
                title="What shoppers are saying"
                subtitle="Verified reviews from customers who bought on Apna Select."
            />

            <div className="rail -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0">
                {usable.slice(0, 6).map((review) => (
                    <figure
                        key={review.id}
                        className="w-[280px] rounded-xl border border-border bg-card p-5 shadow-tile lg:w-auto"
                    >
                        <Quote className="size-5 text-accent/40" />
                        <div className="mt-3 flex items-center gap-0.5" aria-hidden>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={
                                        i < Math.round(review.rating)
                                            ? "size-3.5 fill-star text-star"
                                            : "size-3.5 fill-border text-border"
                                    }
                                />
                            ))}
                        </div>
                        <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-card-foreground">
                            {review.comment}
                        </blockquote>
                        <figcaption className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs">
                            <span className="font-bold">{review.author || "Verified buyer"}</span>
                            {review.product_id && review.product_title && (
                                <Link
                                    href={`/products/${review.product_id}`}
                                    className="line-clamp-1 max-w-[55%] text-right text-muted-foreground hover:text-accent hover:underline"
                                >
                                    {review.product_title}
                                </Link>
                            )}
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
