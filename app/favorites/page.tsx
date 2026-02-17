import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types/supabase'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AccountSidebar } from '@/components/account/account-sidebar'

// Since this is a root page /favorites/page.tsx, it won't automatically use the account layout
// The user asked to "Create Missing Favorites Page (app/favorites/page.tsx)"
// And sidebar link is /favorites.
// To keep consistency, we should probably wrap it in a similar layout or just a standard page with container.
// User requirement: "Route Group: Create a layout at app/(user)/account/layout.tsx to persist the sidebar navigation."
// "Wishlist: Link to /favorites."
// Since /favorites is OUTSIDE /account, it won't have the sidebar by default unless we wrap it or duplicate layout logic.
// However, typically "My Account" sidebar is present on all "My *" pages.
// I will render the page with the container. If the user wants the sidebar here too, they might need to move this route or I add sidebar here.
// Given "Wishlist: Link to /favorites", and it's part of the sidebar items, users expect to see the sidebar.
// But /favorites implies it might be top-level.
// Let's implement it as a standalone page first as per "Create app/favorites/page.tsx".
// If I use AccountSidebar here it helps UX.
// Let's assume standalone for now but with consistent spacing.
// Wait, the user prompt says: "Update the navigation links ... Wishlist: Link to /favorites." 
// And "Task 4: Create Missing Favorites Page (app/favorites/page.tsx)".
// I will build it as a standalone page.

export default async function FavoritesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch favorites with products
    const { data: favorites } = await supabase
        .from('favorites')
        .select(`
            id,
            product_id,
            products (*)
        `)
        .eq('user_id', user.id)

    // Transform data to match ProductCard expectations
    // favorites array contains objects with { products: { ... } }
    // We need to extract 'products' and cast to Product type
    const favoriteProducts = favorites?.map(f => f.products) as unknown as Product[] || []

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
                My Wishlist
            </h1>

            {favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favoriteProducts.map((product) => (
                        <div key={product.id} className="h-[400px]">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
                    <p className="text-muted-foreground mb-6">Start exploring and save items you love!</p>
                    <Button asChild>
                        <Link href="/products">Start Exploring</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
