"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import type { CartSnapshot } from "@/lib/types";
import { useCart } from "./cart-provider";

export function AddToCartButton({ product }: { product: CartSnapshot }) {
  const { add } = useCart();
  const [added, setAdded] = useState(0);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(0), 1400);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        add(product);
        setAdded(Date.now());
      }}
      className={`btn mt-auto h-11 w-full px-3 text-sm ${added ? "bg-emerald-600 text-white hover:bg-emerald-700" : "btn-primary"}`}
    >
      {added ? (
        <span key={added} className="pop flex items-center gap-2">
          <Check className="size-4" strokeWidth={3} /> Adicionado
        </span>
      ) : (
        <>
          <ShoppingCart className="size-4" /> Adicionar
        </>
      )}
    </button>
  );
}
