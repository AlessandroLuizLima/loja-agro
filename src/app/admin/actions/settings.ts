"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import type { AdminState } from "@/components/admin/ui";
import { whatsappNumber } from "@/lib/format";
import { fieldErrorsOf, formText, uploadedFile } from "@/lib/server/form";
import { deleteImageIfUnused, storeUpload } from "@/lib/server/images";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { getSettings, saveSettings } from "@/lib/server/settings";
import { getPasswordHash, requireAdmin, updatePassword } from "@/lib/server/users";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida.");
const optionalUrl = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Use um endereço completo começando com https://");

const schema = z.object({
  storeName: z.string().trim().min(2, "Informe o nome da loja.").max(40, "Use até 40 caracteres."),
  tagline: z.string().trim().max(60),
  colorBrand: hex,
  colorPetrol: hex,
  announcement: z.string().trim().max(120),
  heroTitle: z.string().trim().min(5, "Escreva um título.").max(90),
  heroSubtitle: z.string().trim().max(200),
  about: z.string().trim().max(2000),
  whatsapp: z
    .string()
    .transform(whatsappNumber)
    .refine((v) => v.length >= 12 && v.length <= 13, "Informe o WhatsApp com DDD."),
  email: z.email("E-mail inválido.").max(120).or(z.literal("")),
  address: z.string().trim().min(5, "Informe o endereço da loja.").max(120),
  city: z.string().trim().min(2, "Informe a cidade.").max(60),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "UF com 2 letras."),
  hours: z.string().trim().max(120),
  instagram: optionalUrl,
  facebook: optionalUrl,
  legalName: z.string().trim().max(120),
  cnpj: z.string().trim().max(20),
  pixKey: z.string().trim().max(77),
  pixName: z.string().trim().max(25, "O banco aceita até 25 caracteres."),
  pixDiscountPercent: z.coerce.number().min(0).max(30, "Máximo 30%.").catch(0),
  siteUrl: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || /^https?:\/\/[a-z0-9.-]+(:\d+)?\/?$/i.test(v), "Use só o domínio, ex.: https://www.minhaloja.com.br")
    .transform((v) => v.replace(/\/+$/, "")),
});

export async function saveSettingsAction(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const raw = formText(fd);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: "Confira os campos destacados.", fieldErrors: fieldErrorsOf(parsed.error) };

  const before = getSettings();
  let logoImageId = before.logoImageId;
  const file = uploadedFile(fd, "logo");
  if (file) {
    const up = await storeUpload(file);
    if ("error" in up) return { error: up.error, fieldErrors: { logo: up.error } };
    logoImageId = up.id;
  } else if (raw.logoRemove === "1") {
    logoImageId = null;
  }

  saveSettings({ ...parsed.data, logoImageId });
  if (before.logoImageId && before.logoImageId !== logoImageId) deleteImageIfUnused(before.logoImageId);
  refresh();
  return { ok: "Configurações salvas. A loja já está atualizada." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Informe a senha atual."),
    password: z.string().min(8, "Mínimo de 8 caracteres.").max(72).regex(/[A-Za-z]/, "Use letras e números.").regex(/\d/, "Use letras e números."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não conferem." });

export async function changePasswordAction(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse(formText(fd));
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: fieldErrorsOf(parsed.error) };
  const hash = getPasswordHash(admin.id);
  if (!hash || !(await verifyPassword(parsed.data.current, hash))) return { error: "Senha atual incorreta.", fieldErrors: { current: "Senha incorreta." } };
  updatePassword(admin.id, await hashPassword(parsed.data.password));
  return { ok: "Senha alterada." };
}
