"use client";

import { ShoppingCart } from "lucide-react";
import type { CartSnapshot } from "@/lib/types";
import { useCart } from "./cart-provider";

export function AddToCartButton({ product }: { product: CartSnapshot }) {
  const { add } = useCart();
  return (
    <button type="button" onClick={() => add(product)} className="btn btn-primary mt-auto h-11 w-full px-3 text-sm">
      <ShoppingCart className="size-4" /> Adicionar
    </button>
  );
}
