import { Hero } from "@/components/home/Hero";
import { MarqueeBar } from "@/components/home/MarqueeBar";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <MarqueeBar />
      <Hero />

      <div id="latest-drops">
        <FeaturedProducts initialProducts={products || []} />
      </div>
    </main>
  );
}
