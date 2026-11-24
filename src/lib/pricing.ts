import type { CouponInfo, DeliveryZone, PaymentMethod } from "./types";

/**
 * Regras de preço compartilhadas entre o carrinho (navegador) e o checkout (servidor).
 * O servidor sempre recalcula com os preços do banco: nunca confia em valores do navegador.
 */

export const MAX_QTY_PER_ITEM = 99;

export const round = (n: number) => Math.round(n * 100) / 100;

export function couponProblem(coupon: CouponInfo, subtotal: number) {
  if (subtotal < coupon.minSubtotal) return `Este cupom vale para compras a partir de R$ ${coupon.minSubtotal.toFixed(2).replace(".", ",")}.`;
  return undefined;
}

/** Taxa de entrega da zona, considerando o valor mínimo para entrega grátis. */
export function zoneFee(zone: Pick<DeliveryZone, "fee" | "freeAbove">, merchandise: number) {
  return zone.freeAbove != null && merchandise >= zone.freeAbove ? 0 : zone.fee;
}

export type Totals = {
  itemCount: number;
  subtotal: number;
  couponDiscount: number;
  couponError?: string;
  merchandise: number;
  deliveryFee: number;
  pixDiscount: number;
  total: number;
};

export function computeTotals(input: {
  lines: { price: number; qty: number }[];
  coupon?: CouponInfo | null;
  zone?: Pick<DeliveryZone, "fee" | "freeAbove"> | null;
  payment?: PaymentMethod;
  pixDiscountPercent?: number;
}): Totals {
  const subtotal = round(input.lines.reduce((s, l) => s + l.price * l.qty, 0));
  const itemCount = input.lines.reduce((n, l) => n + l.qty, 0);

  const couponError = input.coupon ? couponProblem(input.coupon, subtotal) : undefined;
  const couponDiscount = input.coupon && !couponError ? round(subtotal * (input.coupon.percent / 100)) : 0;
  const merchandise = round(subtotal - couponDiscount);

  const deliveryFee = input.zone ? zoneFee(input.zone, merchandise) : 0;
  const pixDiscount = input.payment === "pix" ? round(merchandise * ((input.pixDiscountPercent ?? 0) / 100)) : 0;

  return {
    itemCount,
    subtotal,
    couponDiscount,
    couponError,
    merchandise,
    deliveryFee,
    pixDiscount,
    total: round(merchandise - pixDiscount + deliveryFee),
  };
}
