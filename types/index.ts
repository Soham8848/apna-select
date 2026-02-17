export interface Address {
    id: string;
    user_id: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    email?: string;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    compare_at_price?: number | null;
    images: string[];
    category: string;
    stock: number;
}

export interface CartItem extends Product {
    quantity: number;
}
