"use client";

import { createContext, use, useCallback, useRef, useState, type ReactNode } from "react";

type CartContextValue = {
  count: number;
  addItem: (name: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Carrinho simulado do protótipo. Na loja real, troque `addItem`
 * por uma chamada ao carrinho da Nuvemshop (ex.: Server Action que usa a API).
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const addItem = useCallback((name: string) => {
    setCount((c) => c + 1);
    setToast(`${name} foi adicionado ao carrinho 🐾`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  return (
    <CartContext value={{ count, addItem }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-2xl bg-petrol px-5 py-3 text-center text-sm font-semibold text-white shadow-lift transition-all duration-300 sm:bottom-6 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        {toast}
      </div>
    </CartContext>
  );
}

export function useCart() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
