"use client";

import { Loader2, Tag, X } from "lucide-react";
import { useState, useTransition } from "react";
import { checkCoupon } from "@/app/(loja)/cart-actions";
import { couponProblem } from "@/lib/pricing";
import { useCart } from "./cart-provider";

export function CouponField() {
  const { items, coupon, setCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  if (coupon) {
    const problem = couponProblem(coupon, subtotal);
    return (
      <div>
        <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 px-3 py-2 text-sm">
          <span className="flex items-center gap-2 font-semibold text-emerald-800">
            <Tag className="size-4" /> {coupon.code} · {coupon.percent}% OFF
          </span>
          <button type="button" onClick={() => setCoupon(null)} aria-label="Remover cupom" className="rounded-lg p-1 text-emerald-800 hover:bg-emerald-100">
            <X className="size-4" />
          </button>
        </div>
        {problem && <p className="mt-1 text-xs text-red-600">{problem}</p>}
      </div>
    );
  }

  const apply = () =>
    startTransition(async () => {
      const result = await checkCoupon(code);
      if ("coupon" in result) {
        setCoupon(result.coupon);
        setError(null);
        setCode("");
      } else {
        setError(result.error);
      }
    });

  // Sem <form>: este campo também aparece dentro do formulário do checkout (forms aninhados são inválidos)
  return (
    <div role="group" aria-labelledby="coupon-label">
      <label id="coupon-label" htmlFor="coupon" className="mb-1 block text-sm font-medium">
        Cupom de desconto
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          placeholder="Digite o código"
          aria-invalid={!!error}
          aria-describedby="coupon-msg"
          className="h-11 min-w-0 flex-1 rounded-full border-2 border-line px-4 uppercase outline-none focus:border-brand aria-invalid:border-red-400"
        />
        <button type="button" onClick={apply} disabled={pending || !code.trim()} className="btn btn-petrol h-11 px-5 text-sm disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Aplicar"}
        </button>
      </div>
      <p id="coupon-msg" className="mt-1 text-xs text-red-600" aria-live="polite">
        {error}
      </p>
    </div>
  );
}
