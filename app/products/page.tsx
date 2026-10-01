import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/supabase";
import { ProductBrowser } from "@/components/storefront/product-browser";
import { CategoryRail } from "@/components/storefront/category-rail";
import { TrustBar } from "@/components/commerce/trust";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "All products",
    description:
        "Browse every gadget, tool and lifestyle pick on Apna Select. Free delivery over ₹499, cash on delivery, 7-day returns.",
};

export default async function ProductsPage() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    const products = (data || []) as Product[];
    const categoryNames = Array.from(
        new Set(products.map((p) => p.category).filter(Boolean))
    ) as string[];

    return (
        <>
            <div className="shell py-8">
                <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
                    <a href="/" className="hover:text-accent hover:underline">
                        Home
                    </a>
                    <span className="mx-1.5">/</span>
                    <span className="font-semibold text-foreground">All products</span>
                </nav>

                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                    All products
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Everything we stock, in one place.
                </p>

                <div className="mt-6">
                    <CategoryRail names={categoryNames} />
                </div>

                <div className="mt-8">
                    <ProductBrowser products={products} />
                </div>
            </div>

            <TrustBar />
        </>
    );
}
