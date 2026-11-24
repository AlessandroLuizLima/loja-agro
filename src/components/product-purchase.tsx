"use client";

import { ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MAX_QTY_PER_ITEM } from "@/lib/pricing";
import type { CartSnapshot } from "@/lib/types";
import { useCart } from "./cart-provider";
import { QtyStepper } from "./qty-stepper";

export function ProductPurchase({ product }: { product: CartSnapshot }) {
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3">
      <QtyStepper value={qty} onChange={setQty} max={Math.min(product.stock, MAX_QTY_PER_ITEM)} label="este produto" />
      <button type="button" onClick={() => add(product, qty)} className="btn btn-primary h-12 flex-1 basis-52 text-base whitespace-nowrap">
        <ShoppingCart className="size-5" /> Adicionar ao carrinho
      </button>
      <button
        type="button"
        onClick={() => {
          add(product, qty, { openDrawer: false });
          router.push("/checkout");
        }}
        className="btn btn-petrol h-12 flex-1 basis-full text-base whitespace-nowrap sm:basis-52"
      >
        <Zap className="size-5" /> Reservar agora
      </button>
    </div>
  );
}
