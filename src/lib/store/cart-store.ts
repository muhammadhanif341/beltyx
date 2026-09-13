import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number;
  variantLabel: string | null;
  quantity: number;
  maxStock: number;
}

interface CartState {
  lines: CartLine[];
  couponCode: string | null;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  remove: (productId: string, variantId: string | null) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  applyCoupon: (code: string | null) => void;
  clear: () => void;
  hydrate: (lines: CartLine[]) => void;
  subtotal: () => number;
  itemCount: () => number;
}

function sameLine(a: { productId: string; variantId: string | null }, b: typeof a) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      couponCode: null,
      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => sameLine(l, line));
          if (existing) {
            const nextQty = Math.min(existing.quantity + quantity, existing.maxStock || 99);
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line) ? { ...l, quantity: nextQty } : l,
              ),
            };
          }
          return {
            lines: [...state.lines, { ...line, quantity: Math.min(quantity, line.maxStock || 99) }],
          };
        }),
      remove: (productId, variantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, { productId, variantId })),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              sameLine(l, { productId, variantId })
                ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxStock || 99)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      applyCoupon: (code) => set({ couponCode: code }),
      clear: () => set({ lines: [], couponCode: null }),
      hydrate: (lines) => set({ lines }),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "beltyx-cart" },
  ),
);
