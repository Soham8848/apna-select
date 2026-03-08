import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'

export default async function CategoryPage({ params }: { params: { slug: string } }) {
    const slug = (await params).slug;
    const decodedSlug = decodeURIComponent(slug);

    const supabase = await createClient();
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', decodedSlug);

    if (error) {
        console.error('Error fetching category products:', error);
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl pt-24 min-h-screen">
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold capitalize mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                    {decodedSlug}
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-teal-400 to-fuchsia-500 mx-auto rounded-full"></div>
            </div>

            {!products || products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-fuchsia-500/5"></div>
                    <p className="relative text-2xl md:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-fuchsia-500 text-center px-6">
                        We are dropping new <span className="capitalize text-white">{decodedSlug}</span> gear soon. Stay tuned!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
