import { Product } from "@/types/supabase";
import { ProductCard } from "@/components/ProductCard";

/**
 * Horizontal product rail. On phones a swipe rail shows more of the catalogue
 * per screen than a 2-up grid and signals "there is more over here", which is
 * why every large Indian store browses this way on mobile.
 */
export function ProductRail({ products }: { products: Product[] }) {
    if (!products.length) return null;

    return (
        <div className="rail -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {products.map((product, i) => (
                <div key={product.id} className="w-[160px] sm:w-[200px]">
                    <ProductCard product={product} priority={i < 3} />
                </div>
            ))}
        </div>
    );
}
