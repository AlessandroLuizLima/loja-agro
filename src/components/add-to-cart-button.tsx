"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart-provider";

export function AddToCartButton({ slug, disabled = false }: { slug: string; disabled?: boolean }) {
  const { add } = useCart();
  return (
    <button type="button" disabled={disabled} onClick={() => add(slug)} className="btn btn-primary mt-auto h-11 w-full px-3 text-sm disabled:bg-muted disabled:shadow-none">
      <ShoppingCart className="size-4" />
      {disabled ? "Esgotado" : "Adicionar ao carrinho"}
    </button>
  );
}
