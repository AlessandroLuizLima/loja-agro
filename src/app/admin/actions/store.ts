"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import type { AdminState } from "@/components/admin/ui";
import { deleteCategory, saveCategory } from "@/lib/server/catalog";
import { couponCodeExists, createCoupon, deleteCoupon, setCouponActive } from "@/lib/server/coupons";
import { deleteZone, saveZone } from "@/lib/server/delivery";
import { fieldErrorsOf, formText, isChecked, moneyField, optionalMoney, weekdays } from "@/lib/server/form";
import { saveSettings } from "@/lib/server/settings";
import { requireAdmin } from "@/lib/server/users";
import { TINT_NAMES } from "@/lib/types";

/* ===== Categorias ===== */

const categorySchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto.").max(40),
  emoji: z.string().trim().max(16).transform((v) => v || "🌱"),
  tint: z.enum(TINT_NAMES),
  description: z.string().trim().max(200),
  sort: z.coerce.number().int().min(0).max(999).catch(0),
});

export async function saveCategoryAction(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const raw = formText(fd);
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: fieldErrorsOf(parsed.error) };
  saveCategory({ ...parsed.data, active: isChecked(fd, "active") }, raw.id || undefined);
  refresh();
  return { ok: raw.id ? "Categoria salva." : "Categoria criada." };
}

export async function deleteCategoryAction(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const ok = deleteCategory(String(fd.get("id") ?? ""));
  if (!ok) return { error: "Esta categoria tem produtos. Mova-os para outra categoria ou desative a categoria." };
  refresh();
  return { ok: "Categoria apagada." };
}

/* ===== Retirada e entregas ===== */

export async function savePickupAction(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const days = weekdays(fd, "pickupDays");
  const enabled = isChecked(fd, "pickupEnabled");
  if (enabled && days.length === 0) return { error: "Marque pelo menos um dia de retirada." };
  saveSettings({ pickupEnabled: enabled, pickupDays: days, pickupNote: String(fd.get("pickupNote") ?? "").trim().slice(0, 200) });
  refresh();
  return { ok: "Retirada salva." };
}

const zoneSchema = z.object({
  name: z.string().trim().min(2, "Dê um nome para a região.").max(60),
  areas: z.string().trim().max(300),
  fee: moneyField("Informe a taxa (0 para grátis)."),
  freeAbove: optionalMoney("Valor inválido."),
  sort: z.coerce.number().int().min(0).max(999).catch(0),
});

export async function saveZoneAction(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const raw = formText(fd);
  const parsed = zoneSchema.safeParse(raw);
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: fieldErrorsOf(parsed.error) };
  const days = weekdays(fd, "days");
  if (days.length === 0) return { error: "Marque pelo menos um dia de entrega." };
  saveZone({ ...parsed.data, days, active: isChecked(fd, "active") }, raw.id || undefined);
  refresh();
  return { ok: raw.id ? "Região salva." : "Região criada." };
}

export async function deleteZoneAction(fd: FormData) {
  await requireAdmin();
  deleteZone(String(fd.get("id") ?? ""));
  refresh();
}

/* ===== Cupons ===== */

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,20}$/, "Use de 3 a 20 letras e números, sem espaço."),
  percent: z.coerce.number({ error: "Informe o desconto." }).int("Use um número inteiro.").min(1, "Mínimo 1%.").max(90, "Máximo 90%."),
  minSubtotal: optionalMoney().transform((v) => v ?? 0),
});

export async function createCouponAction(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(formText(fd));
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: fieldErrorsOf(parsed.error) };
  if (couponCodeExists(parsed.data.code)) return { error: "Já existe um cupom com esse código.", fieldErrors: { code: "Código já usado." } };
  createCoupon(parsed.data);
  refresh();
  return { ok: `Cupom ${parsed.data.code} criado.` };
}

export async function toggleCouponAction(fd: FormData) {
  await requireAdmin();
  setCouponActive(String(fd.get("id") ?? ""), fd.get("active") === "1");
  refresh();
}

export async function deleteCouponAction(fd: FormData) {
  await requireAdmin();
  deleteCoupon(String(fd.get("id") ?? ""));
  refresh();
}
