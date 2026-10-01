import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    id: string
    title: string
    price: number
    /** MRP, carried so the cart can show total savings without refetching. */
    compare_at_price?: number | null
    image: string
    quantity: number
    category?: string
    variantId?: string
}

interface CartStore {
    items: CartItem[]
    isOpen: boolean
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    onOpen: () => void
    onClose: () => void
    totalItems: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            /**
             * Adding no longer force-opens the drawer. Interrupting a shopper
             * mid-scroll with a full-height sheet is the fastest way to end a
             * browsing session; the header badge animates and a toast confirms
             * instead, so they keep adding. Callers that genuinely want the
             * drawer (the product page's Buy now) call `onOpen` themselves.
             */
            addItem: (data, quantity = 1) => {
                const qty = Math.max(1, Math.floor(quantity))
                const currentItems = get().items
                const existingItem = currentItems.find((item) => item.id === data.id)

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === data.id
                                ? { ...item, quantity: item.quantity + qty }
                                : item
                        ),
                    })
                } else {
                    set({ items: [...currentItems, { ...data, quantity: qty }] })
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) })
            },
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    set({ items: get().items.filter((item) => item.id !== id) })
                    return
                }
                set({
                    items: get().items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    ),
                })
            },
            clearCart: () => set({ items: [] }),
            onOpen: () => set({ isOpen: true }),
            onClose: () => set({ isOpen: false }),
            /** Units, not line count — the badge should read 3 for 3 of one item. */
            totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            // Never persist UI state: a drawer that reopens on page load is a bug.
            partialize: (state) => ({ items: state.items }) as unknown as CartStore,
        }
    )
)
