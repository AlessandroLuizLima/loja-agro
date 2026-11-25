"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { reorder } from "@/app/(loja)/cart-actions";
import { useCart } from "./cart-provider";

/** Põe no carrinho os itens de um pedido antigo, com preço e estoque de hoje. */
export function ReorderButton({ orderId, className = "" }: { orderId: string; className?: string }) {
  const { add, openDrawer } = useCart();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");

  function run() {
    start(async () => {
      const res = await reorder(orderId);
      if ("error" in res) return setMessage(res.error);
      for (const { product, qty } of res.items) add(product, qty, { openDrawer: false });
      if (res.items.length > 0) openDrawer();
      setMessage(
        res.missing.length === 0
          ? ""
          : res.items.length === 0
            ? "Nenhum item deste pedido está disponível agora."
            : `Sem estoque agora: ${res.missing.join(", ")}.`,
      );
    });
  }

  return (
    <div className={className}>
      <button type="button" onClick={run} disabled={pending} className="btn h-10 w-full border-2 border-brand px-4 text-sm text-brand-dark hover:bg-brand-soft disabled:opacity-70">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} Pedir de novo
      </button>
      {message && <p className="mt-1.5 text-xs font-medium text-amber-800">{message}</p>}
    </div>
  );
}
