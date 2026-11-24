"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { brl } from "@/lib/format";
import type { PricedLine } from "@/lib/pricing";
import { useCart } from "./cart-provider";
import { QtyStepper } from "./qty-stepper";

export function CartLine({ line, compact = false, onNavigate }: { line: PricedLine; compact?: boolean; onNavigate?: () => void }) {
  const { setQty, remove } = useCart();
  const { product, qty, lineTotal } = line;
  const href = `/produto/${product.slug}`;

  return (
    <li className="flex gap-3 py-4">
      <Link href={href} onClick={onNavigate} className={`grid shrink-0 place-items-center rounded-xl ${product.tint} ${compact ? "size-18 text-3xl" : "size-22 text-4xl sm:size-24"}`}>
        <span aria-hidden="true">{product.emoji}</span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <Link href={href} onClick={onNavigate} className="line-clamp-2 flex-1 text-sm leading-snug font-medium hover:text-brand-dark">
            {product.name}
          </Link>
          <button type="button" onClick={() => remove(product.slug)} aria-label={`Remover ${product.name}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <QtyStepper value={qty} max={Math.min(10, product.stock)} onChange={(q) => setQty(product.slug, q)} label={product.name} size="sm" />
          <div className="text-right">
            {qty > 1 && <p className="text-xs text-muted">{qty}× {brl(product.price)}</p>}
            <p className="font-display font-bold text-petrol">{brl(lineTotal)}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
