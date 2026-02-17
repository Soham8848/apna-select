import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountSidebar } from '@/components/account/account-sidebar'

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] gap-8">
                {/* Sidebar */}
                <AccountSidebar profile={profile} />

                {/* Main Content */}
                <main className="min-w-0 min-h-[500px]">
                    {children}
                </main>
            </div>
        </div>
    )
}
