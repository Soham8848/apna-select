import type { SupabaseClient } from "@supabase/supabase-js";

import { COD_FEE, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, PaymentMethod } from "@/lib/commerce";

export interface IncomingItem {
    id?: string | number;
    product_id?: string | number;
    quantity?: number;
}

export interface PricedLine {
    product_id: string | number;
    title: string;
    unit_price: number;
    quantity: number;
    line_total: number;
}

export interface PricedOrder {
    lines: PricedLine[];
    subtotal: number;
    shipping: number;
    codFee: number;
    total: number;
}

/**
 * Authoritative order pricing. Prices come from the database, never from the
 * request body.
 *
 * This closes a real hole: the Cashfree route used to build `order_amount`
 * straight from the client's `item.price`, so a crafted POST could buy any
 * product for ₹1 and still produce a valid, "paid" order. The COD route
 * already priced from the database; now both share one implementation, so the
 * two cannot drift apart again.
 *
 * Shipping and the COD fee are applied here too, so the amount charged always
 * equals the amount the shopper was shown in the cart and checkout summary.
 */
export async function priceOrder(
    supabase: SupabaseClient,
    items: IncomingItem[],
    method: PaymentMethod
): Promise<{ order: PricedOrder } | { error: string }> {
    if (!Array.isArray(items) || items.length === 0) {
        return { error: "Your cart is empty." };
    }

    // Normalise and collapse duplicate lines so a repeated id cannot be used
    // to confuse the quantity maths.
    const wanted = new Map<string, number>();
    for (const item of items) {
        const id = String(item.id ?? item.product_id ?? "").trim();
        if (!id) return { error: "A cart item is missing its product id." };

        const qty = Math.floor(Number(item.quantity));
        if (!Number.isFinite(qty) || qty <= 0) {
            return { error: "A cart item has an invalid quantity." };
        }
        if (qty > 10) {
            return { error: "Maximum 10 units per product per order." };
        }
        wanted.set(id, (wanted.get(id) ?? 0) + qty);
    }

    const ids = [...wanted.keys()];
    const { data: products, error } = await supabase
        .from("products")
        .select("id, title, price, inventory_count")
        .in("id", ids);

    if (error) return { error: "Could not verify product prices. Please try again." };
    if (!products || products.length !== ids.length) {
        return { error: "A product in your cart is no longer available." };
    }

    const lines: PricedLine[] = [];
    for (const product of products) {
        const quantity = wanted.get(String(product.id)) ?? 0;

        const unit_price = Number(product.price);
        if (!Number.isFinite(unit_price) || unit_price <= 0) {
            return { error: `${product.title} is not currently purchasable.` };
        }

        // Only enforce stock where it is actually tracked. A null count means
        // "not tracked", and must not silently block the sale.
        if (
            product.inventory_count !== null &&
            product.inventory_count !== undefined &&
            product.inventory_count < quantity
        ) {
            return {
                error: `Only ${product.inventory_count} left of ${product.title}. Please reduce the quantity.`,
            };
        }

        lines.push({
            product_id: product.id,
            title: product.title,
            unit_price,
            quantity,
            line_total: unit_price * quantity,
        });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.line_total, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const codFee = method === "cod" ? COD_FEE : 0;

    return {
        order: {
            lines,
            subtotal,
            shipping,
            codFee,
            // Rounded to paise to avoid floating-point dust reaching the gateway.
            total: Math.round((subtotal + shipping + codFee) * 100) / 100,
        },
    };
}
