/**
 * Money, savings and delivery helpers.
 *
 * Every rupee shown anywhere on the storefront goes through `inr()`. Before
 * this existed the same `Intl.NumberFormat` call was pasted into six
 * components and one of them had drifted to a `$`, so an Indian COD shopper
 * could see a dollar sign on their own order total. One function, one format.
 */

const INR = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const INR_PAISE = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/**
 * Format rupees for display. Whole rupees by default — "₹1,299" scans faster
 * than "₹1,299.00" in a grid, and catalogue prices are whole numbers anyway.
 * Pass `paise` where an exact payable amount matters (checkout, invoices).
 */
export function inr(amount: number | null | undefined, opts?: { paise?: boolean }): string {
    const value = Number(amount);
    if (!Number.isFinite(value)) return "—";
    return opts?.paise ? INR_PAISE.format(value) : INR.format(value);
}

/** Discount as a whole percentage, or null when there is no genuine saving. */
export function discountPercent(
    price: number | null | undefined,
    compareAt: number | null | undefined
): number | null {
    const p = Number(price);
    const c = Number(compareAt);
    if (!Number.isFinite(p) || !Number.isFinite(c)) return null;
    if (c <= p || c <= 0) return null;
    const pct = Math.round(((c - p) / c) * 100);
    return pct > 0 ? pct : null;
}

/** Absolute rupees saved, or null when there is no genuine saving. */
export function savings(
    price: number | null | undefined,
    compareAt: number | null | undefined
): number | null {
    const p = Number(price);
    const c = Number(compareAt);
    if (!Number.isFinite(p) || !Number.isFinite(c) || c <= p) return null;
    return c - p;
}

/** Order value at or above which delivery is free. */
export const FREE_SHIPPING_THRESHOLD = 499;

/** Flat delivery fee charged below the threshold. */
export const SHIPPING_FEE = 49;

/** Extra fee for cash on delivery, charged to offset COD handling + RTO risk. */
export const COD_FEE = 29;

/**
 * Minimum order value for cash on delivery.
 *
 * A refused ₹49 COD parcel costs more in two-way shipping than the order was
 * ever worth, so very small baskets must be prepaid. Nudging these orders to
 * prepaid is one of the few levers that improves margin without raising a
 * single price.
 */
export const COD_MINIMUM = 299;

/** Whether cash on delivery is available for a given subtotal. */
export function codAvailable(subtotal: number): boolean {
    return subtotal >= COD_MINIMUM;
}

export type PaymentMethod = "prepaid" | "cod";

export interface OrderTotals {
    subtotal: number;
    mrpTotal: number;
    productDiscount: number;
    shipping: number;
    codFee: number;
    total: number;
    freeShippingShortfall: number;
    qualifiesFreeShipping: boolean;
}

/**
 * Single calculation for every total shown to the shopper. The cart drawer,
 * the checkout summary and the server order route all read from this, so the
 * number in the drawer cannot disagree with the number that gets charged.
 */
export function orderTotals(
    items: { price: number; compare_at_price?: number | null; quantity: number }[],
    method: PaymentMethod = "prepaid"
): OrderTotals {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const mrpTotal = items.reduce(
        (sum, i) => sum + (i.compare_at_price && i.compare_at_price > i.price ? i.compare_at_price : i.price) * i.quantity,
        0
    );

    const qualifiesFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shipping = items.length === 0 || qualifiesFreeShipping ? 0 : SHIPPING_FEE;
    const codFee = method === "cod" && items.length > 0 ? COD_FEE : 0;

    return {
        subtotal,
        mrpTotal,
        productDiscount: Math.max(0, mrpTotal - subtotal),
        shipping,
        codFee,
        total: subtotal + shipping + codFee,
        freeShippingShortfall: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
        qualifiesFreeShipping,
    };
}

/**
 * Human delivery window. Concrete dates convert better than "3-5 days"
 * because the shopper does not have to do the arithmetic themselves.
 */
export function deliveryWindow(from: Date = new Date()): string {
    const fmt = (d: Date) =>
        d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    const start = new Date(from);
    start.setDate(start.getDate() + 3);
    const end = new Date(from);
    end.setDate(end.getDate() + 6);
    return `${fmt(start)} – ${fmt(end)}`;
}

/**
 * Stock urgency. Real scarcity only — we never invent a number, because a
 * fake "2 left" that never changes is the fastest way to lose repeat buyers.
 */
export function stockState(count: number | null | undefined): {
    label: string;
    tone: "trust" | "urgent" | "muted";
    inStock: boolean;
} {
    if (count === null || count === undefined) {
        return { label: "In stock", tone: "trust", inStock: true };
    }
    if (count <= 0) return { label: "Out of stock", tone: "muted", inStock: false };
    if (count <= 5) return { label: `Only ${count} left`, tone: "urgent", inStock: true };
    return { label: "In stock", tone: "trust", inStock: true };
}
