import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OrdersTable } from "@/components/admin/orders-table"

export const metadata = {
    title: 'Admin Orders - APNA.SELECT',
    description: 'Manage all orders',
}

export default async function AdminOrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        redirect("/")
    }

    // Fetch all orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id,
                quantity,
                price_at_purchase,
                products (
                    title,
                    images
                )
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching admin orders:", error)
        return <div className="p-8 text-red-500">Error loading orders.</div>
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Order Management</h1>
                <p className="text-muted-foreground">View and manage customer orders.</p>
            </div>

            <OrdersTable orders={orders || []} />
        </div>
    )
}
