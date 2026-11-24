"use client";

import { Tag, X } from "lucide-react";
import { useState } from "react";
import { computeTotals } from "@/lib/pricing";
import { useCart } from "./cart-provider";

export function CouponField() {
  const { items, coupon, setCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const applied = coupon ? computeTotals({ items, couponCode: coupon }) : null;

  if (coupon && applied?.coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 px-3 py-2 text-sm">
        <span className="flex items-center gap-2 font-semibold text-emerald-800">
          <Tag className="size-4" /> {applied.coupon.code} · {applied.coupon.percent}% OFF
        </span>
        <button type="button" onClick={() => setCoupon(null)} aria-label="Remover cupom" className="rounded-lg p-1 text-emerald-800 hover:bg-emerald-100">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  const apply = () => {
    const result = computeTotals({ items, couponCode: code });
    if (result.coupon) {
      setCoupon(result.coupon.code);
      setError(null);
      setCode("");
    } else {
      setError(result.couponError ?? "Cupom inválido.");
    }
  };

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
          placeholder="Ex.: BEMVINDO10"
          aria-invalid={!!error}
          aria-describedby="coupon-msg"
          className="h-11 min-w-0 flex-1 rounded-full border-2 border-line px-4 uppercase outline-none focus:border-brand aria-invalid:border-red-400"
        />
        <button type="button" onClick={apply} className="btn btn-petrol h-11 px-5 text-sm">
          Aplicar
        </button>
      </div>
      <p id="coupon-msg" className="mt-1 text-xs text-red-600" aria-live="polite">
        {error ?? (coupon ? computeTotals({ items, couponCode: coupon }).couponError : "")}
      </p>
    </div>
  );
}
