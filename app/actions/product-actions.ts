'use server'

import { createClient } from "@/lib/supabase/server";
import { convertDriveLink } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
    const supabase = await createClient();

    // Verify Admin (Double protection)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) throw new Error("Forbidden");

    // Extract Data
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const compare_at_price = formData.get("compare_at_price") ? parseFloat(formData.get("compare_at_price") as string) : null;
    const image_input = formData.get("image_url") as string;
    const description = formData.get("description") as string;

    // Process Images
    const images = image_input
        ? image_input.split(/[\n,]/)
            .map(url => url.trim())
            .filter(Boolean)
            .map(url => convertDriveLink(url))
        : [];

    // Insert Product
    const { error } = await supabase.from("products").insert({
        title,
        category,
        price,
        compare_at_price,
        description,
        variants: [], // Default empty variants to prevent crash
        images: images,
    });

    if (error) {
        console.error("Error creating product:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/products");

    return { success: true };
}
