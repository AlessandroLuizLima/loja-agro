"use server";

import { z } from "zod";
import { getProductsBySlugs } from "@/lib/server/catalog";
import { findActiveCoupon } from "@/lib/server/coupons";
import { getOrder } from "@/lib/server/orders";
import { getCurrentUser } from "@/lib/server/users";
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

export type ReorderResult = { items: { product: CartSnapshot; qty: number }[]; missing: string[] } | { error: string };

/**
 * "Pedir de novo": os itens de um pedido antigo com preço e estoque de hoje.
 * Pedido de cliente cadastrado só pela própria conta; pedido sem cadastro, por quem tem o link (o id é o segredo).
 */
export async function reorder(orderId: unknown): Promise<ReorderResult> {
  const id = z.uuid().safeParse(orderId);
  const order = id.success ? getOrder(id.data) : undefined;
  if (!order) return { error: "Pedido não encontrado." };
  if (order.userId) {
    const user = await getCurrentUser();
    if (user?.id !== order.userId) return { error: "Entre na sua conta para repetir este pedido." };
  }
  const current = new Map(getProductsBySlugs(order.items.map((i) => i.slug)).map((p) => [p.slug, p]));
  const items: { product: CartSnapshot; qty: number }[] = [];
  const missing: string[] = [];
  for (const i of order.items) {
    const p = current.get(i.slug);
    if (!p || !p.active || p.saleMode !== "online" || p.stock <= 0) missing.push(i.name);
    else items.push({ product: toSnapshot(p), qty: Math.min(i.qty, p.stock) });
  }
  return { items, missing };
}
