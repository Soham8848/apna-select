import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, PlusCircle, Package, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Check Authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Check Authorization (is_admin)
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile || !profile.is_admin) {
        redirect("/"); // Kick non-admins back to home
    }

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 flex-shrink-0 border-r bg-muted/40 hidden md:block">
                <div className="h-full flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
                    <div className="p-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800">
                        <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-bold text-lg tracking-tight">Admin Console</span>
                    </div>

                    <nav className="p-4 space-y-2 flex-1">
                        <Button variant="ghost" asChild className="w-full justify-start gap-2">
                            <Link href="/admin/dashboard">
                                <LayoutDashboard className="w-4 h-4" />
                                Overview
                            </Link>
                        </Button>
                        <Button variant="ghost" asChild className="w-full justify-start gap-2">
                            <Link href="/admin/products">
                                <Package className="w-4 h-4" />
                                Products
                            </Link>
                        </Button>
                        <Button variant="default" asChild className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Link href="/admin/products/new">
                                <PlusCircle className="w-4 h-4" />
                                Add Product
                            </Link>
                        </Button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
