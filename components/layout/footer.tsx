import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="flex flex-col space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <Logo className="h-12" />
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Experience the next generation of e-commerce. Premium quality, curated for you.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Shop</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/products" className="hover:text-foreground">All Products</Link></li>
                            <li><Link href="/collections/new" className="hover:text-foreground">New Arrivals</Link></li>
                            <li><Link href="/collections/featured" className="hover:text-foreground">Featured</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Support</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-foreground">FAQs</Link></li>
                            <li><Link href="/shipping" className="hover:text-foreground">Shipping</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} APNA.SELECT. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
