import "server-only";
import { randomUUID } from "node:crypto";
import type { PaymentMethod } from "../pricing";
import { db } from "./db";

export type OrderStatus = "aguardando_pagamento" | "pago" | "enviado" | "entregue" | "cancelado";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pagamento aprovado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export type OrderPayload = {
  customer: { name: string; email: string; cpf: string; phone: string };
  address: { cep: string; street: string; number: string; complement: string; district: string; city: string; state: string };
  items: { slug: string; name: string; emoji: string; tint: string; qty: number; unitPrice: number; lineTotal: number }[];
  shipping: { id: string; name: string; deadline: string; price: number };
  payment: { method: PaymentMethod; installments: number; installmentValue: number; cardBrand?: string; cardLast4?: string; pixCode?: string; boletoLine?: string };
  totals: { subtotal: number; couponCode?: string; couponDiscount: number; pixDiscount: number; shipping: number; total: number };
};

export type Order = { id: string; number: number; userId: string | null; status: OrderStatus; createdAt: string } & OrderPayload;

type OrderRow = { id: string; number: number; user_id: string | null; email: string; status: OrderStatus; total: number; payload: string; created_at: string };

const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  number: r.number,
  userId: r.user_id,
  status: r.status,
  createdAt: r.created_at,
  ...(JSON.parse(r.payload) as OrderPayload),
});

export function createOrder(input: { userId: string | null; status: OrderStatus; payload: OrderPayload }) {
  const conn = db();
  const id = randomUUID();
  const { next } = conn.prepare("SELECT COALESCE(MAX(number), 10240) + 1 AS next FROM orders").get() as { next: number };
  conn
    .prepare("INSERT INTO orders (id, number, user_id, email, status, total, payload) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(id, next, input.userId, input.payload.customer.email, input.status, input.payload.totals.total, JSON.stringify(input.payload));
  return { id, number: next };
}

export function getOrder(id: string) {
  const row = db().prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? toOrder(row) : undefined;
}

export function listOrdersByUser(userId: string) {
  const rows = db().prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, number DESC").all(userId) as OrderRow[];
  return rows.map(toOrder);
}
