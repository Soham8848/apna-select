import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const defaultCategories = [
    { id: 6, english: "Electronics", slug: "electronics" },
    { id: 4, english: "Beauty", slug: "beauty" },
    { id: 8, english: "Accessories", slug: "accessories" },
    { id: 7, english: "Home & Gift", slug: "home-gift" },
    { id: 11, english: "Kitchen", slug: "kitchen" },
];

export function Footer() {
    return (
        <footer className="w-full bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col space-y-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <Logo className="h-12" />
                    </Link>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        India's finest curated dropshipping store. Premium quality, best prices.
                    </p>
                    <div className="flex items-center space-x-4 pt-2">
                        <Link href="#" aria-label="Facebook">
                            <Facebook className="w-5 h-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" />
                        </Link>
                        <Link href="#" aria-label="Twitter">
                            <Twitter className="w-5 h-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" />
                        </Link>
                        <Link href="#" aria-label="Instagram">
                            <Instagram className="w-5 h-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" />
                        </Link>
                        <Link href="#" aria-label="Youtube">
                            <Youtube className="w-5 h-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" />
                        </Link>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Quick Links</h3>
                    <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <li><Link href="/products" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Shop All</Link></li>
                        <li><Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About Us</Link></li>
                        <li><Link href="/track-order" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Track Order</Link></li>
                        <li><Link href="/faq" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">FAQs</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Categories</h3>
                    <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {defaultCategories.map((cat) => (
                            <li key={cat.id}>
                                <Link 
                                    href={`/category/${encodeURIComponent(cat.english.toLowerCase())}`} 
                                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                >
                                    {cat.english}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Legal & Contact</h3>
                    <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <li><a href="mailto:support@apnaselect.com" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">support@apnaselect.com</a></li>
                        <li><Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            <div className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-600 dark:text-zinc-400">
                &copy; {new Date().getFullYear()} APNA.SELECT. All rights reserved.
            </div>
        </footer>
    )
}
