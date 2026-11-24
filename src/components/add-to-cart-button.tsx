"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";

export function AddToCartButton({ name }: { name: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(name);
        setAdded(true);
      }}
      className={`btn mt-auto h-11 w-full text-sm ${added ? "bg-emerald-600 text-white" : "btn-primary"}`}
    >
      {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      {added ? "Adicionado!" : "Adicionar ao carrinho"}
    </button>
  );
}
