"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    Package,
    MapPin,
    Settings,
    LogOut,
    Heart,
    User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface AccountSidebarProps {
    profile: {
        full_name: string | null
        email: string | null
    } | null
}

export function AccountSidebar({ profile }: AccountSidebarProps) {
    const pathname = usePathname()

    const navItems = [
        { href: '/account', label: 'Overview', icon: Home, exact: true },
        { href: '/orders', label: 'My Orders', icon: Package }, // Global /orders
        { href: '/favorites', label: 'Wishlist', icon: Heart }, // Global /favorites
        { href: '/account/addresses', label: 'Addresses', icon: MapPin },
        { href: '/account/settings', label: 'Profile & Security', icon: Settings },
    ]

    return (
        <aside className="w-full h-full">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border shadow-sm sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-medium truncate">Hello, {profile?.full_name?.split(' ')[0] || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                    </div>
                </div>

                <Separator className="my-4" />

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href) && item.href !== '/account'

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-zinc-200 dark:bg-zinc-800 text-foreground"
                                        : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}

                    <form action="/auth/signout" method="post" className="pt-2 mt-2 border-t">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 px-3"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </nav>
            </div>
        </aside>
    )
}
