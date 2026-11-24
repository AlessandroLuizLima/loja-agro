import "server-only";
import { randomUUID } from "node:crypto";
import type { DeliveryZone } from "../types";
import { bool, db } from "./db";

type ZoneRow = { id: string; name: string; areas: string; fee: number; free_above: number | null; days: string; active: number; sort: number };

const toZone = (r: ZoneRow): DeliveryZone => ({
  id: r.id,
  name: r.name,
  areas: r.areas,
  fee: r.fee,
  freeAbove: r.free_above,
  days: JSON.parse(r.days) as number[],
  active: bool(r.active),
  sort: r.sort,
});

export function listZones({ activeOnly = true } = {}) {
  const rows = db()
    .prepare(`SELECT * FROM delivery_zones ${activeOnly ? "WHERE active = 1" : ""} ORDER BY sort, name`)
    .all() as ZoneRow[];
  return rows.map(toZone).filter((z) => !activeOnly || z.days.length > 0);
}

export function getZone(id: string) {
  const row = db().prepare("SELECT * FROM delivery_zones WHERE id = ?").get(id) as ZoneRow | undefined;
  return row ? toZone(row) : undefined;
}

export type ZoneInput = Omit<DeliveryZone, "id">;

export function saveZone(input: ZoneInput, id?: string) {
  const values = [input.name, input.areas, input.fee, input.freeAbove, JSON.stringify(input.days), input.active ? 1 : 0, input.sort];
  if (id) {
    db().prepare("UPDATE delivery_zones SET name = ?, areas = ?, fee = ?, free_above = ?, days = ?, active = ?, sort = ? WHERE id = ?").run(...values, id);
    return id;
  }
  const newId = randomUUID();
  db().prepare("INSERT INTO delivery_zones (name, areas, fee, free_above, days, active, sort, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(...values, newId);
  return newId;
}

export function deleteZone(id: string) {
  db().prepare("DELETE FROM delivery_zones WHERE id = ?").run(id);
}
