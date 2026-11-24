"use client";

import { ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MAX_QTY_PER_ITEM } from "@/lib/pricing";
import { useCart } from "./cart-provider";
import { QtyStepper } from "./qty-stepper";

export function ProductPurchase({ slug, stock }: { slug: string; stock: number }) {
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const router = useRouter();
  const soldOut = stock === 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {!soldOut && <QtyStepper value={qty} onChange={setQty} max={Math.min(stock, MAX_QTY_PER_ITEM)} label="este produto" />}
      <button type="button" disabled={soldOut} onClick={() => add(slug, qty)} className="btn btn-primary h-12 flex-1 text-base disabled:bg-muted disabled:shadow-none">
        <ShoppingCart className="size-5" /> {soldOut ? "Esgotado" : "Adicionar ao carrinho"}
      </button>
      {!soldOut && (
        <button
          type="button"
          onClick={() => {
            add(slug, qty, { openDrawer: false });
            router.push("/checkout");
          }}
          className="btn btn-petrol h-12 flex-1 text-base"
        >
          <Zap className="size-5" /> Comprar agora
        </button>
      )}
    </div>
  );
}
