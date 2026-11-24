"use client";

import Link from "next/link";
import { brl } from "@/lib/format";
import { computeTotals } from "@/lib/pricing";
import { CartLine } from "./cart-line";
import { useCart } from "./cart-provider";
import { CouponField } from "./coupon-field";

export function CartPageView({ pixPercent }: { pixPercent: number }) {
  const { items, coupon, ready } = useCart();
  const totals = computeTotals({ lines: items, coupon });

  if (!ready) return <div className="h-64 animate-pulse rounded-3xl bg-white" />;

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-card">
        <p className="mb-2 text-6xl" aria-hidden="true">
          🧺
        </p>
        <p className="mb-1 font-display text-lg font-semibold text-petrol">Seu carrinho está vazio</p>
        <p className="mb-5 text-muted">Veja as ofertas da semana.</p>
        <Link href="/ofertas" className="btn btn-primary">
          Ver ofertas
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-3xl bg-white p-5 shadow-card">
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <CartLine key={i.slug} item={i} />
          ))}
        </ul>
        <Link href="/" className="mt-2 inline-block text-sm font-semibold text-brand-dark hover:underline">
          ← Continuar comprando
        </Link>
      </section>

      <aside className="space-y-4 rounded-3xl bg-white p-5 shadow-card lg:sticky lg:top-40">
        <h2 className="text-lg font-bold text-petrol">Resumo</h2>
        <CouponField />
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal ({totals.itemCount} itens)</dt>
            <dd>{brl(totals.subtotal)}</dd>
          </div>
          {totals.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Cupom {coupon?.code}</dt>
              <dd>−{brl(totals.couponDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Entrega</dt>
            <dd className="text-muted">retirada grátis ou taxa do bairro</dd>
          </div>
          <div className="flex items-end justify-between border-t border-line pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-2xl font-bold text-petrol">{brl(totals.merchandise)}</dd>
          </div>
          {pixPercent > 0 && <p className="text-right text-xs font-semibold text-emerald-700">ou {brl(totals.merchandise * (1 - pixPercent / 100))} no Pix</p>}
        </dl>
        <Link href="/checkout" className="btn btn-primary h-14 w-full text-lg">
          Finalizar pedido
        </Link>
      </aside>
    </div>
  );
}
