import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    id: string
    title: string
    price: number
    image: string
    quantity: number
    category?: string
    variantId?: string
}

interface CartStore {
    items: CartItem[]
    isOpen: boolean
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    onOpen: () => void
    onClose: () => void
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (data) => {
                const currentItems = get().items
                const existingItem = currentItems.find((item) => item.id === data.id)

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === data.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true,
                    })
                } else {
                    set({
                        items: [...currentItems, { ...data, quantity: 1 }],
                        isOpen: true,
                    })
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
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
