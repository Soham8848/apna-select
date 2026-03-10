import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OrderCard } from "@/components/orders/order-card"
import { PackageOpen } from "lucide-react"

export const metadata = {
    title: 'Order History - APNA.SELECT',
    description: 'View your past orders',
}

export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch orders with items and product details
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching orders:", error)
        return (
            <div className="p-8 text-center text-red-500">
                Failed to load orders. Please try again later.
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
                <p className="text-muted-foreground">Check the status of your recent orders.</p>
            </div>

            {orders && orders.length > 0 ? (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-dashed">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full">
                        <PackageOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">No orders yet</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                            You haven't placed any orders yet. Start shopping to fill this page!
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
