import { createHmac, timingSafeEqual } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"

/* ------------------------------------------------------------------ */
/* Contact validation                                                  */
/* ------------------------------------------------------------------ */

export interface Contact {
    name: string
    phone: string
    email: string | null
}

/**
 * Validates the shopper's contact details. Replaces the old fallbacks that
 * silently sent "9999999999" / "test@example.com" to the payment gateway,
 * which left orders with no way to reach the customer.
 */
export function validateContact(input: {
    name?: unknown
    phone?: unknown
    email?: unknown
    fallbackEmail?: string | null
}): { contact: Contact } | { error: string } {
    const name = String(input.name ?? "").trim().slice(0, 100)
    if (!name) return { error: "Please add your full name to the delivery address." }

    // Accept "+91 98765-43210", "098765 43210" etc. and keep the last 10 digits.
    const digits = String(input.phone ?? "").replace(/\D/g, "")
    const phone = digits.slice(-10)
    if (!/^[6-9]\d{9}$/.test(phone)) {
        return { error: "Please add a valid 10-digit mobile number to the delivery address." }
    }

    const rawEmail = String(input.email ?? input.fallbackEmail ?? "").trim().toLowerCase()
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail) ? rawEmail : null

    return { contact: { name, phone, email } }
}

export function validateAddress(snapshot: unknown): string | null {
    if (!snapshot || typeof snapshot !== "object") return "Please choose a delivery address."
    const a = snapshot as Record<string, unknown>
    if (!a.line_1 || !a.city || !a.pincode) return "The delivery address is incomplete."
    return null
}

/* ------------------------------------------------------------------ */
/* Cashfree                                                            */
/* ------------------------------------------------------------------ */

export function cashfreeConfig() {
    const isProd =
        process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT?.trim().toUpperCase() === "PRODUCTION"
    return {
        isProd,
        baseUrl: isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
        appId: process.env.NEXT_PUBLIC_CASHFREE_APP_ID?.trim() || "",
        secretKey: process.env.CASHFREE_SECRET_KEY?.trim() || "",
    }
}

export function cashfreeHeaders() {
    const { appId, secretKey } = cashfreeConfig()
    return {
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
    }
}

/** Fetches the order straight from Cashfree — the only trustworthy payment status. */
export async function fetchCashfreeOrder(orderId: string) {
    const { baseUrl } = cashfreeConfig()
    const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
        headers: cashfreeHeaders(),
        cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as { order_id: string; order_status: string; order_amount: number }
}

/**
 * Verifies a Cashfree webhook: base64(HMAC-SHA256(timestamp + rawBody, secret)).
 */
export function verifyCashfreeSignature(rawBody: string, timestamp: string, signature: string) {
    const { secretKey } = cashfreeConfig()
    if (!secretKey || !timestamp || !signature) return false
    const expected = createHmac("sha256", secretKey).update(timestamp + rawBody).digest("base64")
    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Marks an order paid after Cashfree confirms it. Idempotent, so the browser
 * redirect and the webhook can both call it safely. Refuses if the amount
 * Cashfree collected does not match what we stored for the order.
 */
export async function markOrderPaid(
    db: SupabaseClient,
    cfOrder: { order_id: string; order_status: string; order_amount: number }
): Promise<"paid" | "already_paid" | "not_paid" | "amount_mismatch" | "not_found"> {
    if (cfOrder.order_status !== "PAID") return "not_paid"

    const { data: order } = await db
        .from("orders")
        .select("id, total_amount, is_paid")
        .eq("payment_intent_id", cfOrder.order_id)
        .maybeSingle()

    if (!order) return "not_found"
    if (order.is_paid) return "already_paid"

    if (Math.abs(Number(order.total_amount) - Number(cfOrder.order_amount)) > 0.01) {
        console.error(
            `Cashfree amount mismatch for ${cfOrder.order_id}: stored ${order.total_amount}, paid ${cfOrder.order_amount}`
        )
        return "amount_mismatch"
    }

    const { error } = await db
        .from("orders")
        .update({ status: "paid", is_paid: true })
        .eq("id", order.id)
        .eq("is_paid", false)

    if (error) {
        console.error("Could not mark order paid:", error.message)
        return "not_found"
    }
    return "paid"
}
