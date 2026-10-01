import Image from "next/image";
import Link from "next/link";

import { CATEGORIES } from "@/lib/categories";

/**
 * Swipeable category entry points. Shows the Hinglish label as the headline
 * with the English name underneath, so the personality lands first but nobody
 * is left guessing what "Jugaad Junction" actually sells.
 */
export function CategoryRail({ names }: { names?: string[] }) {
    // Only surface categories that actually have stock behind them, so we never
    // send a shopper to an empty shelf.
    const list = names?.length
        ? CATEGORIES.filter((c) =>
              names.some((n) => n?.toLowerCase() === c.name.toLowerCase())
          )
        : CATEGORIES;

    const shown = list.length ? list : CATEGORIES;

    return (
        <div className="rail -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {shown.map((cat) => (
                <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="group w-[88px] shrink-0 text-center sm:w-[104px]"
                >
                    <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full border-2 border-border bg-surface-sunken transition-colors group-hover:border-accent">
                        <Image
                            src={cat.image}
                            alt=""
                            fill
                            sizes="104px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[11px] font-bold leading-tight sm:text-xs">
                        {cat.hinglish}
                    </p>
                    <p className="line-clamp-1 text-[10px] text-muted-foreground">{cat.name}</p>
                </Link>
            ))}
        </div>
    );
}
