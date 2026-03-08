"use client"

import { createProduct } from "@/app/actions/product-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { convertDriveLink } from "@/lib/utils"

export default function NewProductPage() {
    const router = useRouter();
    const [images, setImages] = useState<string[]>([]);
    const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);

    async function handleSubmit(formData: FormData) {
        const result = await createProduct(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Product launched successfully!");
            // Reset form or redirect? 
            // For "Rapid Add", maybe just clear the form to add another?
            // Let's redirect to list for now, user can click "Add Product" again.
            router.refresh();
            router.push("/admin/products");
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">New Drop</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Launch a new product to the store.</p>
            </div>

            <form action={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">

                {/* Product Name */}
                <div className="space-y-2">
                    <Label htmlFor="title">Product Name</Label>
                    <Input id="title" name="title" placeholder="e.g. Cyberpunk Powerbank" required />
                </div>

                {/* Category & Price Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            name={isCustomCategory ? "category_placeholder" : "category"}
                            required={!isCustomCategory}
                            onValueChange={(val) => {
                                if (val === "custom") {
                                    setIsCustomCategory(true);
                                } else {
                                    setIsCustomCategory(false);
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Tools">Tools</SelectItem>
                                <SelectItem value="Home & Gift">Home & Gift</SelectItem>
                                <SelectItem value="Accessories">Accessories</SelectItem>
                                <SelectItem value="custom" className="font-semibold text-primary">+ Add Custom Category</SelectItem>
                            </SelectContent>
                        </Select>
                        {isCustomCategory && (
                            <Input
                                className="mt-2"
                                name="category"
                                placeholder="Enter custom category"
                                autoFocus
                                required
                            />
                        )}
                    </div>
                </div>

                {/* Pricing Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="49.99" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compare_at_price">Compare At ($) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Input id="compare_at_price" name="compare_at_price" type="number" step="0.01" placeholder="89.99" />
                    </div>
                </div>

                {/* Image URLs */}
                <div className="space-y-2">
                    <Label htmlFor="image_url">Image URLs</Label>
                    <div className="space-y-4">
                        <Textarea
                            id="image_url"
                            name="image_url"
                            placeholder="https://... (one per line)"
                            className="min-h-[100px] font-mono text-xs"
                            required
                            defaultValue={images.join('\n')}
                            onBlur={(e) => {
                                const val = e.target.value;
                                const lines = val.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
                                const converted = lines.map(url => convertDriveLink(url));
                                setImages(converted);
                                e.target.value = converted.join('\n');
                            }}
                        />

                        {/* Previews */}
                        {images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative h-20 w-20 flex-shrink-0 rounded-md border border-zinc-200 overflow-hidden bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700">
                                        <img
                                            src={url}
                                            alt={`Preview ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">Paste direct links or Google Drive share links. One per line.</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Product details..." className="min-h-[100px]" />
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full font-semibold">
                        🚀 Launch Product
                    </Button>
                </div>
            </form>
        </div>
    )
}
