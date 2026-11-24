import "server-only";
import { randomUUID } from "node:crypto";
import type { Order, OrderPayload, OrderStatus, PaymentStatus } from "../types";
import { db, transaction } from "./db";

type OrderRow = {
  id: string;
  number: number;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payload: string;
  stock_restored: number;
  created_at: string;
  updated_at: string;
};

const toOrder = (r: OrderRow): Order => ({
  ...(JSON.parse(r.payload) as OrderPayload),
  id: r.id,
  number: r.number,
  userId: r.user_id,
  status: r.status,
  paymentStatus: r.payment_status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export class OutOfStockError extends Error {
  constructor(public productName: string) {
    super(`Estoque insuficiente: ${productName}`);
  }
}

/**
 * Cria o pedido e baixa o estoque na mesma transação.
 * Se algum item não tiver estoque suficiente, nada é gravado.
 */
export function createOrder(input: { userId: string | null; payload: OrderPayload }) {
  const conn = db();
  return transaction(conn, () => {
    const takeStock = conn.prepare("UPDATE products SET stock = stock - ?, updated_at = datetime('now') WHERE id = ? AND stock >= ?");
    for (const item of input.payload.items) {
      const { changes } = takeStock.run(item.qty, item.productId, item.qty);
      if (changes === 0) throw new OutOfStockError(item.name);
    }
    const id = randomUUID();
    const { next } = conn.prepare("SELECT COALESCE(MAX(number), 1000) + 1 AS next FROM orders").get() as { next: number };
    const p = input.payload;
    conn
      .prepare(
        `INSERT INTO orders (id, number, user_id, status, payment_status, fulfillment, scheduled_date, customer_name, customer_phone, coupon_code, total, payload, privacy_accepted_at)
         VALUES (?, ?, ?, 'novo', 'pendente', ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .run(id, next, input.userId, p.fulfillment.type, p.fulfillment.date, p.customer.name, p.customer.phone, p.totals.couponCode ?? null, p.totals.total, JSON.stringify(p));
    return { id, number: next };
  });
}

export function getOrder(id: string) {
  const row = db().prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? toOrder(row) : undefined;
}

export function listOrdersByUser(userId: string) {
  return (db().prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, number DESC").all(userId) as OrderRow[]).map(toOrder);
}

/** "abertos" = tudo que ainda não foi concluído nem cancelado */
export type OrderFilter = OrderStatus | "abertos" | "todos";

export function listOrders(filter: OrderFilter = "abertos", limit = 200) {
  const where = filter === "todos" ? "" : filter === "abertos" ? "WHERE status NOT IN ('concluido', 'cancelado')" : "WHERE status = ?";
  const order = filter === "abertos" ? "ORDER BY scheduled_date, number" : "ORDER BY number DESC";
  const stmt = db().prepare(`SELECT * FROM orders ${where} ${order} LIMIT ${limit}`);
  const rows = (filter === "todos" || filter === "abertos" ? stmt.all() : stmt.all(filter)) as OrderRow[];
  return rows.map(toOrder);
}

export function countOrdersByStatus() {
  const rows = db().prepare("SELECT status, COUNT(*) AS n FROM orders GROUP BY status").all() as { status: OrderStatus; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Partial<Record<OrderStatus, number>>;
}

/**
 * Muda o andamento do pedido. Cancelar devolve os itens ao estoque (uma única vez).
 * Um pedido cancelado não volta a ficar ativo: faça um novo pedido.
 */
export function updateOrderStatus(id: string, status: OrderStatus) {
  const conn = db();
  return transaction(conn, () => {
    const row = conn.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
    if (!row || row.status === "cancelado") return false;
    if (status === "cancelado" && !row.stock_restored) {
      const order = toOrder(row);
      const give = conn.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
      for (const item of order.items) give.run(item.qty, item.productId);
      conn.prepare("UPDATE orders SET stock_restored = 1 WHERE id = ?").run(id);
    }
    conn.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
    return true;
  });
}

export function setPaymentStatus(id: string, status: PaymentStatus) {
  db().prepare("UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
}

export function salesSummary() {
  const conn = db();
  const sum = (sinceDays: number) =>
    conn
      .prepare(
        `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders
         WHERE status <> 'cancelado' AND created_at >= datetime('now', ?)`,
      )
      .get(`-${sinceDays} days`) as { orders: number; revenue: number };
  return { today: sum(1), week: sum(7), month: sum(30) };
}
