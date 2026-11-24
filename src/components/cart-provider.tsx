"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProduct } from "@/lib/catalog";
import { MAX_QTY_PER_ITEM, type CartItem } from "@/lib/pricing";
import { CartDrawer } from "./cart-drawer";

type CartState = { items: CartItem[]; coupon: string | null };

type CartContextValue = CartState & {
  /** false até ler o carrinho salvo no navegador (evita piscar "carrinho vazio") */
  ready: boolean;
  count: number;
  add: (slug: string, qty?: number, opts?: { openDrawer?: boolean }) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const STORAGE_KEY = "pethouse:cart:v1";
const empty: CartState = { items: [], coupon: null };

const CartContext = createContext<CartContextValue | null>(null);

function clampQty(slug: string, qty: number) {
  const stock = getProduct(slug)?.stock ?? MAX_QTY_PER_ITEM;
  return Math.max(0, Math.min(Math.floor(qty), MAX_QTY_PER_ITEM, stock));
}

function readStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as CartState;
    return {
      coupon: typeof parsed.coupon === "string" ? parsed.coupon : null,
      items: Array.isArray(parsed.items)
        ? parsed.items.filter((i) => getProduct(i.slug) && i.qty > 0).map((i) => ({ slug: i.slug, qty: clampQty(i.slug, i.qty) }))
        : [],
    };
  } catch {
    return empty;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(empty);
  const [ready, setReady] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);

  // Carrega do navegador e sincroniza entre abas
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage após a hidratação
    setState(readStorage());
    setReady(true);
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

  const add = useCallback<CartContextValue["add"]>((slug, qty = 1, opts) => {
    setState((s) => {
      const existing = s.items.find((i) => i.slug === slug);
      const items = existing
        ? s.items.map((i) => (i.slug === slug ? { ...i, qty: clampQty(slug, i.qty + qty) } : i))
        : [...s.items, { slug, qty: clampQty(slug, qty) }];
      return { ...s, items };
    });
    if (opts?.openDrawer !== false) drawer.current?.showModal();
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setState((s) => ({
      ...s,
      items: qty <= 0 ? s.items.filter((i) => i.slug !== slug) : s.items.map((i) => (i.slug === slug ? { ...i, qty: clampQty(slug, qty) } : i)),
    }));
  }, []);

  const remove = useCallback((slug: string) => setState((s) => ({ ...s, items: s.items.filter((i) => i.slug !== slug) })), []);
  const clear = useCallback(() => setState(empty), []);
  const setCoupon = useCallback((coupon: string | null) => setState((s) => ({ ...s, coupon })), []);

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
