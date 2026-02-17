import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddressBookList } from '@/components/account/address-book-list'

export default async function AddressesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Address Book</h1>
                    <p className="text-muted-foreground">Manage your shipping addresses.</p>
                </div>
            </div>

            <AddressBookList initialAddresses={addresses || []} />
        </div>
    )
}
