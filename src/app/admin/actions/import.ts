"use server";

import { refresh } from "next/cache";
import { audit } from "@/lib/server/audit";
import { uploadedFile } from "@/lib/server/form";
import { applyImport, planImport, type ImportPlan } from "@/lib/server/product-import";
import { requireAdmin } from "@/lib/server/users";

export type ImportState = {
  error?: string;
  plan?: { create: number; update: number; newCategories: string[]; errors: ImportPlan["errors"]; sample: { line: number; action: string; name: string }[] };
  done?: { created: number; updated: number; categories: number };
};

const MAX_BYTES = 3 * 1024 * 1024;

/** "conferir" mostra o que vai acontecer; "importar" grava (só se a planilha não tiver erro). */
export async function importProductsAction(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const admin = await requireAdmin();
  const file = uploadedFile(fd, "arquivo");
  if (!file) return { error: "Escolha a planilha (arquivo .csv)." };
  if (file.size > MAX_BYTES) return { error: "Planilha muito grande (máximo 3 MB)." };
  if (!/\.csv$/i.test(file.name) && !file.type.includes("csv") && file.type !== "text/plain") {
    return { error: 'Envie a planilha em formato CSV. No Excel: Arquivo > Salvar como > "CSV UTF-8 (separado por vírgulas)".' };
  }

  const plan = planImport(await file.text());
  const summary: ImportState["plan"] = {
    create: plan.lines.filter((l) => l.action === "criar").length,
    update: plan.lines.filter((l) => l.action === "atualizar").length,
    newCategories: plan.newCategories,
    errors: plan.errors.slice(0, 50),
    sample: plan.lines.slice(0, 8).map((l) => ({ line: l.line, action: l.action, name: l.name })),
  };
  if (fd.get("modo") !== "importar" || plan.errors.length > 0) return { plan: summary };

  const done = applyImport(plan);
  await audit(admin.email, "produtos_importados", `${done.created} novo(s), ${done.updated} atualizado(s)`);
  refresh();
  return { done };
}
