"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { refreshCart } from "@/app/(loja)/cart-actions";
import { MAX_QTY_PER_ITEM } from "@/lib/pricing";
import type { CartItem, CartSnapshot, CouponInfo } from "@/lib/types";
import { CartDrawer } from "./cart-drawer";

type CartState = { items: CartItem[]; coupon: CouponInfo | null };

type CartContextValue = CartState & {
  /** false até ler o carrinho salvo no navegador (evita piscar "carrinho vazio") */
  ready: boolean;
  count: number;
  add: (product: CartSnapshot, qty?: number, opts?: { openDrawer?: boolean }) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setCoupon: (coupon: CouponInfo | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const STORAGE_KEY = "loja:carrinho:v2";
const empty: CartState = { items: [], coupon: null };

const CartContext = createContext<CartContextValue | null>(null);

const clampQty = (qty: number, stock: number) => Math.max(0, Math.min(Math.floor(qty), MAX_QTY_PER_ITEM, stock));

function readStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    const items = Array.isArray(parsed.items) ? parsed.items.filter((i) => typeof i?.slug === "string" && typeof i.price === "number" && i.qty > 0) : [];
    const coupon = parsed.coupon && typeof parsed.coupon.code === "string" ? parsed.coupon : null;
    return { items, coupon };
  } catch {
    return empty;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(empty);
  const [ready, setReady] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);

  // Carrega do navegador, atualiza preço/estoque com o servidor e sincroniza entre abas
  useEffect(() => {
    const saved = readStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage após a hidratação
    setState(saved);
    setReady(true);
    if (saved.items.length > 0) {
      refreshCart(saved.items.map((i) => i.slug))
        .then((fresh) => {
          const bySlug = new Map(fresh.map((p) => [p.slug, p]));
          setState((s) => ({
            ...s,
            items: s.items.flatMap((i) => {
              const p = bySlug.get(i.slug);
              const qty = p ? clampQty(i.qty, p.stock) : 0;
              return p && qty > 0 ? [{ ...p, qty }] : [];
            }),
          }));
        })
        .catch(() => {
          /* sem conexão: segue com a cópia salva; o checkout confere tudo no servidor */
        });
    }
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setState(readStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* modo privado ou armazenamento cheio: o carrinho segue só na memória */
    }
  }, [state, ready]);

  const openDrawer = useCallback(() => drawer.current?.showModal(), []);
  const closeDrawer = useCallback(() => drawer.current?.close(), []);

  const add = useCallback<CartContextValue["add"]>((product, qty = 1, opts) => {
    setState((s) => {
      const existing = s.items.find((i) => i.slug === product.slug);
      const nextQty = clampQty((existing?.qty ?? 0) + qty, product.stock);
      if (nextQty === 0) return s;
      const items = existing ? s.items.map((i) => (i.slug === product.slug ? { ...product, qty: nextQty } : i)) : [...s.items, { ...product, qty: nextQty }];
      return { ...s, items };
    });
    if (opts?.openDrawer !== false) drawer.current?.showModal();
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setState((s) => ({
      ...s,
      items: qty <= 0 ? s.items.filter((i) => i.slug !== slug) : s.items.map((i) => (i.slug === slug ? { ...i, qty: clampQty(qty, i.stock) || 1 } : i)),
    }));
  }, []);

  const remove = useCallback((slug: string) => setState((s) => ({ ...s, items: s.items.filter((i) => i.slug !== slug) })), []);
  const clear = useCallback(() => setState(empty), []);
  const setCoupon = useCallback((coupon: CouponInfo | null) => setState((s) => ({ ...s, coupon })), []);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      ready,
      count: state.items.reduce((n, i) => n + i.qty, 0),
      add,
      setQty,
      remove,
      clear,
      setCoupon,
      openDrawer,
      closeDrawer,
    }),
    [state, ready, add, setQty, remove, clear, setCoupon, openDrawer, closeDrawer],
  );

  return (
    <CartContext value={value}>
      {children}
      <CartDrawer ref={drawer} />
    </CartContext>
  );
}

export function useCart() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
