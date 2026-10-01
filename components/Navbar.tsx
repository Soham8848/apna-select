import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserNav } from '@/components/UserNav'
import { ThemeToggle } from './ui/ThemeToggle'
import { CartButton } from '@/components/layout/cart-button'
import { Logo } from '@/components/ui/logo'
import { SearchBar } from '@/components/ui/search-bar'
import { CATEGORIES } from '@/lib/categories'

/** A short, opinionated nav. Long menus defer the decision; these do not. */
const PRIMARY_LINKS = [
    { href: '/products', label: 'All products' },
    { href: '/category/electronics', label: 'Gadget Gali' },
    { href: '/category/home-gift', label: 'Ghar Ki Raunak' },
    { href: '/category/accessories', label: 'Style Ka Tadka' },
]

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
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="shell flex h-16 items-center gap-3">
                <Link href="/" className="shrink-0" aria-label="Apna Select home">
                    <Logo className="h-9" showText={true} />
                </Link>

                {/* Search is the highest-intent control on a catalogue site, so it
                    gets the centre of the bar on desktop and its own row on mobile. */}
                <div className="mx-auto hidden w-full max-w-xl md:block">
                    <SearchBar />
                </div>

                <div className="ml-auto flex items-center gap-1 md:ml-0">
                    <CartButton />
                    <UserNav user={user} isAdmin={isAdmin} />
                    <ThemeToggle />
                </div>
            </div>

            {/* Desktop category strip */}
            <nav
                aria-label="Categories"
                className="hidden border-t border-border md:block"
            >
                <div className="shell rail h-11 items-center gap-6 pb-0 text-sm">
                    {PRIMARY_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="font-semibold text-muted-foreground transition-colors hover:text-accent"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <span className="h-4 w-px bg-border" aria-hidden />
                    {CATEGORIES.slice(0, 8).map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/category/${cat.slug}`}
                            className="whitespace-nowrap text-muted-foreground transition-colors hover:text-accent"
                        >
                            {cat.hinglish}
                        </Link>
                    ))}
                </div>
            </nav>

            <div className="shell pb-3 md:hidden">
                <SearchBar />
            </div>
        </header>
    )
}
