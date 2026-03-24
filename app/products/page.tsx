import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/supabase";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const supabase = await createClient();
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    const productList = (products || []) as Product[];

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-20 overflow-x-hidden w-full max-w-[100vw]">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-center mb-2 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
                        All Products
                    </h1>
                    <div className="w-24 h-1 bg-amber-500 rounded-full shadow-[0_0_15px_#F59E0B]" />
                </div>

                {productList.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full">
                        {productList.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-zinc-500">
                        No products found.
                    </div>
                )}
            </div>
        </main>
    );
}
