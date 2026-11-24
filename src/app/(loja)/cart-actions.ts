"use server";

import { z } from "zod";
import { getProductsBySlugs } from "@/lib/server/catalog";
import { findActiveCoupon } from "@/lib/server/coupons";
import { toSnapshot, type CartSnapshot, type CouponInfo } from "@/lib/types";

/** Preço e estoque atuais dos itens do carrinho (o navegador guarda só uma cópia). */
export async function refreshCart(slugs: unknown): Promise<CartSnapshot[]> {
  const parsed = z.array(z.string().max(100)).max(100).safeParse(slugs);
  if (!parsed.success) return [];
  return getProductsBySlugs(parsed.data)
    .filter((p) => p.saleMode === "online")
    .map(toSnapshot);
}

export async function checkCoupon(code: unknown): Promise<{ coupon: CouponInfo } | { error: string }> {
  const parsed = z.string().trim().min(1).max(30).safeParse(code);
  if (!parsed.success) return { error: "Digite o código do cupom." };
  const coupon = findActiveCoupon(parsed.data);
  return coupon ? { coupon } : { error: "Cupom inválido ou expirado." };
}
