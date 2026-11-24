"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { brl } from "@/lib/format";
import { MAX_QTY_PER_ITEM } from "@/lib/pricing";
import type { CartItem } from "@/lib/types";
import { useCart } from "./cart-provider";
import { ProductImage } from "./product-image";
import { QtyStepper } from "./qty-stepper";

export function CartLine({ item, compact = false, onNavigate }: { item: CartItem; compact?: boolean; onNavigate?: () => void }) {
  const { setQty, remove } = useCart();
  const href = `/produto/${item.slug}`;

  return (
    <li className="flex gap-3 py-4">
      <Link href={href} onClick={onNavigate} className="shrink-0">
        <ProductImage item={item} className={`rounded-xl ${compact ? "size-18" : "size-22 sm:size-24"}`} emojiClassName={compact ? "text-3xl" : "text-4xl"} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <Link href={href} onClick={onNavigate} className="flex-1 text-sm leading-snug font-medium hover:text-brand-dark">
            <span className="line-clamp-2">{item.name}</span>
            <span className="text-xs font-normal text-muted">{item.unit}</span>
          </Link>
          <button type="button" onClick={() => remove(item.slug)} aria-label={`Remover ${item.name}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <QtyStepper value={item.qty} max={Math.min(MAX_QTY_PER_ITEM, item.stock)} onChange={(q) => setQty(item.slug, q)} label={item.name} size="sm" />
          <div className="text-right">
            {item.qty > 1 && (
              <p className="text-xs text-muted">
                {item.qty}× {brl(item.price)}
              </p>
            )}
            <p className="font-display font-bold text-petrol">{brl(item.price * item.qty)}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
