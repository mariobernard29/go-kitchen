// src/store/cartStore.ts
import { create } from 'zustand';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartState {
    cart: CartItem[];
    currentTable: string | null; // Guardamos qué mesa estamos atendiendo

    setTable: (tableId: string | null) => void;
    setCart: (items: CartItem[]) => void; // Para cargar una orden existente
    addItem: (product: any) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: [],
    currentTable: null,

    setTable: (tableId) => set({ currentTable: tableId }),

    setCart: (items) => set({ cart: items }),

    addItem: (product) => {
        const { cart } = get();
        const exists = cart.find((item) => item.id === product.id);
        if (exists) {
            set({
                cart: cart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                ),
            });
        } else {
            set({
                cart: [...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }],
            });
        }
    },

    removeItem: (productId) => {
        const { cart } = get();
        const item = cart.find((i) => i.id === productId);
        if (item && item.quantity > 1) {
            set({
                cart: cart.map((i) =>
                    i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
                ),
            });
        } else {
            set({ cart: cart.filter((i) => i.id !== productId) });
        }
    },

    clearCart: () => set({ cart: [] }),

    total: () => {
        const { cart } = get();
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
}));