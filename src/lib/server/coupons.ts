import "server-only";
import { randomUUID } from "node:crypto";
import type { Coupon, CouponInfo } from "../types";
import { bool, db } from "./db";

type CouponRow = { id: string; code: string; percent: number; min_subtotal: number; active: number; uses: number };

export function listCoupons(): Coupon[] {
  const rows = db()
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.coupon_code = c.code AND o.status <> 'cancelado') AS uses
       FROM coupons c ORDER BY c.active DESC, c.created_at DESC`,
    )
    .all() as CouponRow[];
  return rows.map((r) => ({ id: r.id, code: r.code, percent: r.percent, minSubtotal: r.min_subtotal, active: bool(r.active), uses: r.uses }));
}

export function findActiveCoupon(code: string): CouponInfo | undefined {
  const row = db()
    .prepare("SELECT code, percent, min_subtotal FROM coupons WHERE code = ? AND active = 1")
    .get(code.trim().toUpperCase()) as { code: string; percent: number; min_subtotal: number } | undefined;
  return row ? { code: row.code, percent: row.percent, minSubtotal: row.min_subtotal } : undefined;
}

export function couponCodeExists(code: string) {
  return !!db().prepare("SELECT 1 FROM coupons WHERE code = ?").get(code);
}

export function createCoupon(input: CouponInfo) {
  db().prepare("INSERT INTO coupons (id, code, percent, min_subtotal) VALUES (?, ?, ?, ?)").run(randomUUID(), input.code, input.percent, input.minSubtotal);
}

export function setCouponActive(id: string, active: boolean) {
  db().prepare("UPDATE coupons SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
}

export function deleteCoupon(id: string) {
  db().prepare("DELETE FROM coupons WHERE id = ?").run(id);
}
