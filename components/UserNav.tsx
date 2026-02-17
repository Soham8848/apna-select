'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, Settings, LogOut, PackageOpen } from 'lucide-react'
import { toast } from 'sonner'
import { type User as SupabaseUser } from '@supabase/supabase-js'

interface UserNavProps {
    user: SupabaseUser | null
    isAdmin: boolean
}

export function UserNav({ user, isAdmin }: UserNavProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            router.refresh()
            toast.success('Logged out successfully')
        } catch (error) {
            toast.error('Error logging out')
        }
    }

    if (!user) {
        return (
            <Button asChild variant="default" className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                <Link href="/login">Login</Link>
            </Button>
        )
    }

    // Get initials or fallback
    const initials = user.email?.substring(0, 2).toUpperCase() || 'U'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-800">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Favorites</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                        <PackageOpen className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/products/new" className="w-full cursor-pointer font-medium">
                                Admin Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/orders" className="w-full cursor-pointer font-medium">
                                Manage Orders
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
