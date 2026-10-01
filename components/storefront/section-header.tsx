import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    href?: string;
    hrefLabel?: string;
}

/**
 * One heading pattern for every section. The old build gave each section its
 * own gradient-clipped uppercase heading plus a glowing underline bar, which
 * is why the page read as a collection of unrelated templates. Consistency is
 * what makes a store look professional — and professional is what converts.
 */
export function SectionHeader({
    eyebrow,
    title,
    subtitle,
    href,
    hrefLabel = "View all",
}: SectionHeaderProps) {
    return (
        <div className="mb-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
                {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
                <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                )}
            </div>
            {href && (
                <Link
                    href={href}
                    className="group flex shrink-0 items-center gap-1 text-sm font-bold text-accent hover:underline"
                >
                    {hrefLabel}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            )}
        </div>
    );
}
