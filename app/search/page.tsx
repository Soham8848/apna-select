import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  // If there is no query, return an empty array. Otherwise, search.
  let products: any[] = [];
  if (query) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("title", `%${query}%`); // Using 'title' as per ProductCard

    if (!error && data) {
      products = data;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {query ? `Search results for "${query}"` : "Search Our Store"}
      </h1>

      {products.length === 0 && query ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No products found matching "{query}".</p>
          <p className="text-sm mt-2">
            Try checking your spelling or using different keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
