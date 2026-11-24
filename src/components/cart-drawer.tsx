"use client";

import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import type { Ref } from "react";
import { brl } from "@/lib/format";
import { computeTotals } from "@/lib/pricing";
import { useCart } from "./cart-provider";
import { CartLine } from "./cart-line";
import { FreeShippingBar } from "./free-shipping-bar";

export function CartDrawer({ ref }: { ref: Ref<HTMLDialogElement> }) {
  const { items, coupon, closeDrawer } = useCart();
  const totals = computeTotals({ items, couponCode: coupon });

  return (
    <dialog
      ref={ref}
      aria-label="Seu carrinho"
      onClick={(e) => e.target === e.currentTarget && closeDrawer()}
      className="drawer drawer-right m-0 h-dvh max-h-none w-[min(92vw,420px)] bg-white p-0 backdrop:bg-petrol-dark/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-petrol">
            <ShoppingBag className="size-5" /> Seu carrinho ({totals.itemCount})
          </h2>
          <button type="button" onClick={closeDrawer} aria-label="Fechar carrinho" className="icon-btn">
            <X className="size-6" />
          </button>
        </div>

        {totals.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="text-6xl" aria-hidden="true">🐾</span>
            <p className="font-display font-semibold text-petrol">Seu carrinho está vazio</p>
            <p className="text-sm text-muted">Que tal dar uma olhada nas ofertas da semana?</p>
            <Link href="/categoria/promocoes" onClick={closeDrawer} className="btn btn-primary mt-2">
              Ver ofertas
            </Link>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <FreeShippingBar missing={totals.missingForFreeShipping} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {totals.lines.map((l) => (
                <CartLine key={l.product.slug} line={l} compact onNavigate={closeDrawer} />
              ))}
            </ul>
            <div className="space-y-3 border-t border-line bg-cream px-5 py-4">
              {totals.couponDiscount > 0 && (
                <p className="flex justify-between text-sm text-emerald-700">
                  <span>Cupom {totals.coupon?.code}</span>
                  <span>−{brl(totals.couponDiscount)}</span>
                </p>
              )}
              <p className="flex items-end justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="font-display text-2xl font-bold text-petrol">{brl(totals.subtotal - totals.couponDiscount)}</span>
              </p>
              <Link href="/checkout" onClick={closeDrawer} className="btn btn-primary h-13 w-full text-base">
                Finalizar compra
              </Link>
              <Link href="/carrinho" onClick={closeDrawer} className="btn h-11 w-full border-2 border-line bg-white text-petrol">
                Ver carrinho completo
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
