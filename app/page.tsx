import { MarqueeBar } from "@/components/home/MarqueeBar";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { createClient } from "@/lib/supabase/server";
import { HeroCarousel } from "@/components/ui/hero-carousel";

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
      
      <div className="my-6 px-4 md:px-8">
        <HeroCarousel />
      </div>

      <div id="latest-drops">
        <FeaturedProducts initialProducts={products || []} />
      </div>
    </main>
  );
}
