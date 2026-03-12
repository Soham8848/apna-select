import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserNav } from '@/components/UserNav'
import { ShoppingBag } from 'lucide-react'
import { ThemeToggle } from './ui/ThemeToggle'
import { CartButton } from '@/components/layout/cart-button'
import { Logo } from '@/components/ui/logo'
import { SearchBar } from '@/components/ui/search-bar'

export default async function Navbar() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let isAdmin = false
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()
        isAdmin = profile?.is_admin || false
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-black/80 backdrop-blur-md border-gray-100 dark:border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Logo className="h-10" showText={true} />
                </Link>

                <div className="hidden md:flex flex-1 max-w-md mx-4">
                    <SearchBar />
                </div>

                <div className="flex items-center space-x-4">
                    <CartButton />
                    <UserNav user={user} isAdmin={isAdmin} />
                    <ThemeToggle />
                </div>
            </div>
            <div className="md:hidden px-4 pb-3 w-full">
                <SearchBar />
            </div>
        </header>
    )
}
