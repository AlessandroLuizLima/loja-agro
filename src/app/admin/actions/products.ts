"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { AdminState } from "@/components/admin/ui";
import { deleteProduct, getProductById, listCategories, saveProduct, setStock } from "@/lib/server/catalog";
import { fieldErrorsOf, formText, isChecked, moneyField, optionalMoney, uploadedFile } from "@/lib/server/form";
import { deleteImageIfUnused, storeUpload } from "@/lib/server/images";
import { audit } from "@/lib/server/audit";
import { requireAdmin } from "@/lib/server/users";
import { TINT_NAMES } from "@/lib/types";
import { adminUrl } from "@/lib/admin-path";

const schema = z.object({
  name: z.string().trim().min(3, "Nome muito curto.").max(120, "Nome muito longo."),
  categoryId: z.string().min(1, "Escolha a categoria."),
  saleMode: z.enum(["online", "consulta"]),
  price: moneyField("Informe o preço (ex.: 159,90)."),
  oldPrice: optionalMoney("Preço antigo inválido."),
  unit: z.string().trim().min(1, "Informe a unidade (ex.: Saco 15 kg).").max(40),
  stock: z.coerce.number({ error: "Informe o estoque." }).int("Use um número inteiro.").min(0, "Estoque não pode ser negativo.").max(1_000_000),
  emoji: z.string().trim().max(16).transform((v) => v || "📦"),
  tint: z.enum(TINT_NAMES),
  description: z.string().trim().max(3000),
  highlights: z
    .string()
    .max(2000)
    .transform((v) =>
      v
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 10),
    ),
});

export async function saveProductAction(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  const raw = formText(fd);
  const parsed = schema.safeParse({ ...raw, price: raw.saleMode === "consulta" && !raw.price ? "0" : raw.price });
  if (!parsed.success) return { error: "Confira os campos destacados.", fieldErrors: fieldErrorsOf(parsed.error) };
  const d = parsed.data;

  if (!listCategories({ activeOnly: false }).some((c) => c.id === d.categoryId)) return { error: "Categoria inválida.", fieldErrors: { categoryId: "Escolha a categoria." } };
  if (d.saleMode === "online" && d.price <= 0) return { error: "Confira os campos destacados.", fieldErrors: { price: "Informe o preço de venda." } };
  if (d.oldPrice !== null && d.oldPrice <= d.price) return { error: "Confira os campos destacados.", fieldErrors: { oldPrice: "O preço antigo (\"de\") precisa ser maior que o preço atual." } };

  const id = raw.id || undefined;
  const existing = id ? getProductById(id) : undefined;
  if (id && !existing) return { error: "Produto não encontrado." };

  // Foto: nova, removida ou a mesma de antes
  let imageId = existing?.imageId ?? null;
  const file = uploadedFile(fd, "image");
  if (file) {
    const up = await storeUpload(file);
    if ("error" in up) return { error: up.error, fieldErrors: { image: up.error } };
    imageId = up.id;
  } else if (raw.imageRemove === "1") {
    imageId = null;
  }

  saveProduct({ ...d, imageId, featured: isChecked(fd, "featured"), active: isChecked(fd, "active") }, id);
  if (existing?.imageId && existing.imageId !== imageId) deleteImageIfUnused(existing.imageId);
  await audit(admin.email, "produto_salvo", d.name);

  redirect(adminUrl(`/produtos?salvo=${encodeURIComponent(d.name)}`));
}

export async function deleteProductAction(fd: FormData) {
  const admin = await requireAdmin();
  const product = getProductById(String(fd.get("id") ?? ""));
  if (product) {
    deleteProduct(product.id);
    deleteImageIfUnused(product.imageId);
    await audit(admin.email, "produto_apagado", product.name);
  }
  redirect(adminUrl("/produtos"));
}

/** Atualização rápida de estoque direto na lista de produtos */
export async function updateStockAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const stock = Number(fd.get("stock"));
  if (id && Number.isInteger(stock) && stock >= 0 && stock <= 1_000_000) {
    setStock(id, stock);
    await audit(admin.email, "estoque", `${getProductById(id)?.name ?? id}: ${stock}`);
  }
  refresh();
}
