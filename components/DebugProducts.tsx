import { createClient } from "@/lib/supabase/server";

export async function DebugProducts() {
    const supabase = await createClient();
    const { data: products, error } = await supabase.from('products').select('*');

    if (error) {
        return (
            <div className="p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <h3 className="font-bold">Error Fetching Products</h3>
                <pre className="text-sm mt-2 whitespace-pre-wrap">
                    {JSON.stringify(error, null, 2)}
                </pre>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="p-4 m-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                <h3 className="font-bold">Success, but DATA IS EMPTY array</h3>
                <p>No products found in the database.</p>
            </div>
        );
    }

    return (
        <div className="p-4 m-4 bg-green-100 border border-green-400 text-green-700 rounded overflow-auto">
            <h3 className="font-bold">Success: {products.length} Products Found</h3>
            <div className="mt-2">
                <p className="font-semibold">First Product Dump:</p>
                <pre className="text-xs mt-1 bg-white p-2 rounded border border-green-200 whitespace-pre-wrap">
                    {JSON.stringify(products[0], null, 2)}
                </pre>
            </div>
        </div>
    );
}
