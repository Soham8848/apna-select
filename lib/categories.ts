/**
 * The category taxonomy — single source of truth.
 *
 * This same array was pasted into three components (FeaturedProducts,
 * category-carousel, curated-categories), so adding a category meant editing
 * it in three places and they had already drifted apart.
 *
 * The Hinglish names are kept deliberately: they are the most distinctive
 * thing about the brand and they outperform flat English labels with this
 * audience. English is retained as the data key, since that is what the
 * `products.category` column actually stores.
 */
export interface Category {
    /** Matches `products.category` in Supabase. Do not rename casually. */
    name: string;
    /** The catchy display label. */
    hinglish: string;
    slug: string;
    image: string;
}

export const CATEGORIES: Category[] = [
    { name: "Electronics", hinglish: "Gadget Gali", slug: "electronics", image: "/images/categories/electronics.jpg" },
    { name: "Audio", hinglish: "Shor Sharaba", slug: "audio", image: "/images/categories/audio.jpg" },
    { name: "Wearables", hinglish: "Wrist Pe Swag", slug: "wearables", image: "/images/categories/wearables.jpg" },
    { name: "Mobile Accs", hinglish: "Phone Ka Shringar", slug: "mobile-accs", image: "/images/categories/mobile-accs.jpg" },
    { name: "Gaming", hinglish: "Noob to Pro", slug: "gaming", image: "/images/categories/gaming.jpg" },
    { name: "Home & Gift", hinglish: "Ghar Ki Raunak", slug: "home-gift", image: "/images/categories/home-gift.jpg" },
    { name: "Kitchen", hinglish: "Kitchen Khazana", slug: "kitchen", image: "/images/categories/kitchen.jpg" },
    { name: "Accessories", hinglish: "Style Ka Tadka", slug: "accessories", image: "/images/categories/accessories.jpg" },
    { name: "Beauty", hinglish: "Sajna Sawarna", slug: "beauty", image: "/images/categories/beauty.jpg" },
    { name: "Tools", hinglish: "Jugaad Junction", slug: "tools", image: "/images/categories/tools.jpg" },
    { name: "Quirky Items", hinglish: "Khatarnak Collection", slug: "quirky-items", image: "/images/categories/quirky.jpg" },
    { name: "Health & Care", hinglish: "Apna Khayal", slug: "health-care", image: "/images/categories/health.jpg" },
    { name: "Kids & Baby", hinglish: "Chillar Party", slug: "kids-baby", image: "/images/categories/kids.jpg" },
    { name: "Travel", hinglish: "Safar Ka Sathi", slug: "travel", image: "/images/categories/travel.jpg" },
    { name: "Stationery", hinglish: "Likhai Padhai", slug: "stationery", image: "/images/categories/stationery.jpg" },
    { name: "Storage", hinglish: "Sab Set", slug: "storage", image: "/images/categories/storage.jpg" },
    { name: "Jewellery", hinglish: "Chamak Dhamak", slug: "jewellery", image: "/images/categories/jewellery.jpg" },
    { name: "Automotives", hinglish: "Gaadi Waadi", slug: "automotives", image: "/images/categories/auto.jpg" },
];

export function categoryByName(name: string | null | undefined): Category | undefined {
    if (!name) return undefined;
    return CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Resolve a URL slug to a category. Falls back to matching the raw category
 * name so legacy links like `/category/home%20&%20gift` keep working.
 */
export function categoryBySlug(slug: string | null | undefined): Category | undefined {
    if (!slug) return undefined;
    const needle = decodeURIComponent(slug).toLowerCase();
    return CATEGORIES.find(
        (c) => c.slug === needle || c.name.toLowerCase() === needle
    );
}
