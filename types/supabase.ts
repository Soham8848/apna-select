export interface Product {
    id: string;
    title: string;
    category: string;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    image_url: string | null; // Keeping for backward compat, but preference is images
    description: string | null;
    variants: any[] | null;
    created_at?: string;
    specifications: Record<string, string> | null;
    average_rating: number | null;
    review_count: number | null;
    is_featured?: boolean;
}
