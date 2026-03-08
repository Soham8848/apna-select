import { Hero } from "@/components/home/Hero";
import { MarqueeBar } from "@/components/home/MarqueeBar";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  const uniqueCategories = Array.from(
    new Set((products || []).map((p) => p.category).filter(Boolean))
  ).map((cat) => ({ name: cat, slug: cat.toLowerCase() }));

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <MarqueeBar />
      <CategoryCarousel categories={uniqueCategories} />
      <Hero />

      <div id="latest-drops">
        <FeaturedProducts initialProducts={products || []} />
      </div>
    </main>
  );
}
