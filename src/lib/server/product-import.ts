import "server-only";
import { csvMoney, parseCsv, toCsv } from "../csv";
import { normalizeText, slugify } from "../format";
import { parseMoney } from "../masks";
import type { Product, SaleMode } from "../types";
import { listAllProducts, listCategories, saveCategory, saveProduct } from "./catalog";
import { db, transaction } from "./db";

/**
 * Planilha de produtos: exportar tudo, editar no Excel e importar de volta (ou subir a planilha do sistema da loja).
 * Cada linha com "id" atualiza aquele produto; sem "id", atualiza o produto de mesmo nome ou cria um novo.
 * Fotos não entram na planilha: continuam sendo enviadas pelo painel.
 */

export const COLUMNS = ["id", "nome", "categoria", "preco", "preco_de", "unidade", "estoque", "venda", "destaque", "ativo", "grupo", "opcao", "descricao"] as const;
type Column = (typeof COLUMNS)[number];

export const MAX_ROWS = 5000;

const yes = (b: boolean) => (b ? "sim" : "não");

export function exportProductsCsv() {
  const rows = listAllProducts().map((p) => [
    p.id,
    p.name,
    p.categoryName,
    csvMoney(p.price),
    csvMoney(p.oldPrice),
    p.unit,
    p.stock,
    p.saleMode,
    yes(p.featured),
    yes(p.active),
    p.variantGroup ?? "",
    p.variantLabel ?? "",
    p.description,
  ]);
  return toCsv([[...COLUMNS], ...rows]);
}

export function templateCsv() {
  return toCsv([
    [...COLUMNS],
    ["", "Ração para cães filhotes 3 kg", "Cães e gatos", "49,90", "", "Pacote 3 kg", 20, "online", "não", "sim", "racao-filhotes", "3 kg", "Ração completa para filhotes."],
    ["", "Ração para cães filhotes 10 kg", "Cães e gatos", "129,90", "", "Saco 10 kg", 12, "online", "não", "sim", "racao-filhotes", "10 kg", "Ração completa para filhotes."],
    ["", "Sal mineral 30 kg", "Bovinos", "159,90", "179,90", "Saco 30 kg", 8, "online", "sim", "sim", "", "", ""],
  ]);
}

export type ImportLine = {
  line: number;
  action: "criar" | "atualizar";
  name: string;
  id?: string;
  data: Partial<Pick<Product, "name" | "price" | "oldPrice" | "unit" | "stock" | "saleMode" | "featured" | "active" | "description" | "variantGroup" | "variantLabel">> & {
    category?: string;
  };
};

export type ImportPlan = { lines: ImportLine[]; errors: { line: number; message: string }[]; newCategories: string[] };

/** Cabeçalho tolerante: "Preço", "preco", "PRECO DE" e "preço_de" valem. */
const headerKey = (h: string) => normalizeText(h).replace(/[\s-]+/g, "_").replace(/[^a-z_]/g, "");
const HEADER_ALIASES: Record<string, Column> = { produto: "nome", descricao: "descricao", preco_antigo: "preco_de", quantidade: "estoque", codigo: "id" };

function parseBool(v: string): boolean | null {
  const n = normalizeText(v.trim());
  if (["sim", "s", "1", "true", "x"].includes(n)) return true;
  if (["nao", "n", "0", "false", ""].includes(n)) return false;
  return null;
}

/** Confere a planilha sem gravar nada: o que será criado, atualizado e quais linhas têm erro. */
export function planImport(text: string): ImportPlan {
  const rows = parseCsv(text);
  const errors: ImportPlan["errors"] = [];
  if (rows.length < 2) return { lines: [], errors: [{ line: 1, message: "A planilha está vazia." }], newCategories: [] };
  if (rows.length - 1 > MAX_ROWS) return { lines: [], errors: [{ line: 1, message: `Envie no máximo ${MAX_ROWS} produtos por vez.` }], newCategories: [] };

  const header = rows[0].map((h) => {
    const k = headerKey(h);
    return (HEADER_ALIASES[k] ?? k) as Column;
  });
  const col = (name: Column) => header.indexOf(name);
  for (const required of ["nome", "categoria", "preco", "estoque"] as const) {
    if (col(required) < 0) errors.push({ line: 1, message: `Falta a coluna "${required}". Baixe o modelo para ver o formato.` });
  }
  if (errors.length) return { lines: [], errors, newCategories: [] };

  const existing = listAllProducts();
  const byId = new Map(existing.map((p) => [p.id, p]));
  const byName = new Map(existing.map((p) => [normalizeText(p.name), p]));
  const categories = new Set(listCategories({ activeOnly: false }).map((c) => normalizeText(c.name)));
  const newCategories = new Map<string, string>();
  const seenNames = new Set<string>();
  const lines: ImportLine[] = [];

  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const get = (name: Column) => (col(name) >= 0 ? (r[col(name)] ?? "").trim() : undefined);
    const problems: string[] = [];

    const name = get("nome") ?? "";
    if (name.length < 2 || name.length > 120) problems.push("nome vazio ou muito longo");
    const key = normalizeText(name);
    if (key && seenNames.has(key)) problems.push("produto repetido na planilha");
    seenNames.add(key);

    const id = get("id") || undefined;
    if (id && !byId.has(id)) problems.push("id não encontrado (apague a coluna id para criar um produto novo)");
    const target = id ? byId.get(id) : byName.get(key);

    const category = get("categoria") ?? "";
    if (!category) problems.push("categoria vazia");
    else if (!categories.has(normalizeText(category))) newCategories.set(normalizeText(category), category);

    const venda = (get("venda") ?? "").toLowerCase();
    const saleMode: SaleMode | undefined = venda === "" ? undefined : venda === "consulta" ? "consulta" : venda === "online" ? "online" : undefined;
    if (venda !== "" && !saleMode) problems.push('venda deve ser "online" ou "consulta"');

    const priceText = get("preco") ?? "";
    const price = priceText === "" ? NaN : parseMoney(priceText);
    const consulta = (saleMode ?? target?.saleMode) === "consulta";
    if (!consulta && !(price > 0)) problems.push("preço inválido");
    if (consulta && priceText !== "" && !(price >= 0)) problems.push("preço inválido");

    const oldText = get("preco_de");
    const oldPrice = oldText ? parseMoney(oldText) : null;
    if (oldText && !(oldPrice! > 0)) problems.push("preço de inválido");
    if (oldPrice && price > 0 && oldPrice <= price) problems.push('"preço de" precisa ser maior que o preço');

    const stockText = (get("estoque") ?? "").replace(/\./g, "");
    const stock = Number(stockText);
    if (stockText === "" || !Number.isInteger(stock) || stock < 0 || stock > 1_000_000) problems.push("estoque deve ser um número inteiro");

    const featured = get("destaque") !== undefined ? parseBool(get("destaque")!) : undefined;
    const active = get("ativo") !== undefined && get("ativo") !== "" ? parseBool(get("ativo")!) : undefined;
    if (featured === null) problems.push('destaque deve ser "sim" ou "não"');
    if (active === null) problems.push('ativo deve ser "sim" ou "não"');

    const groupText = get("grupo");
    const variantGroup = groupText === undefined ? undefined : slugify(groupText) || null;
    const variantLabel = get("opcao");
    if (variantGroup && !variantLabel) problems.push('preencha "opcao" (ex.: 15 kg) para usar "grupo"');
    if (variantLabel && variantLabel.length > 30) problems.push("opção muito longa");

    const unit = get("unidade");
    const description = get("descricao");
    if (description && description.length > 2000) problems.push("descrição muito longa");

    if (problems.length) {
      errors.push({ line, message: problems.join("; ") });
      return;
    }
    lines.push({
      line,
      action: target ? "atualizar" : "criar",
      name,
      id: target?.id,
      data: {
        name,
        category,
        price: Number.isNaN(price) ? 0 : price,
        oldPrice,
        stock,
        ...(unit !== undefined && unit !== "" && { unit: unit.slice(0, 40) }),
        ...(saleMode && { saleMode }),
        ...(featured !== undefined && featured !== null && { featured }),
        ...(active !== undefined && active !== null && { active }),
        ...(description !== undefined && { description }),
        ...(variantGroup !== undefined && { variantGroup, variantLabel: variantGroup ? variantLabel : null }),
      },
    });
  });

  return { lines, errors, newCategories: [...newCategories.values()] };
}

/** Grava a planilha conferida (tudo ou nada). Devolve quantos foram criados e atualizados. */
export function applyImport(plan: ImportPlan) {
  const conn = db();
  return transaction(conn, () => {
    const catId = new Map(listCategories({ activeOnly: false }).map((c) => [normalizeText(c.name), c.id]));
    for (const name of plan.newCategories) {
      catId.set(normalizeText(name), saveCategory({ name: name.slice(0, 40), emoji: "📦", tint: "verde", description: "", sort: 99, active: true }));
    }
    const current = new Map(listAllProducts().map((p) => [p.id, p]));
    let created = 0;
    let updated = 0;
    for (const l of plan.lines) {
      const before = l.id ? current.get(l.id) : undefined;
      const d = l.data;
      saveProduct(
        {
          name: d.name!,
          categoryId: catId.get(normalizeText(d.category!))!,
          price: d.price!,
          oldPrice: d.oldPrice ?? null,
          unit: d.unit ?? before?.unit ?? "Unidade",
          stock: d.stock!,
          imageId: before?.imageId ?? null,
          emoji: before?.emoji ?? "📦",
          tint: before?.tint ?? "verde",
          description: d.description ?? before?.description ?? "",
          highlights: before?.highlights ?? [],
          saleMode: d.saleMode ?? before?.saleMode ?? "online",
          featured: d.featured ?? before?.featured ?? false,
          active: d.active ?? before?.active ?? true,
          variantGroup: d.variantGroup !== undefined ? d.variantGroup : (before?.variantGroup ?? null),
          variantLabel: d.variantGroup !== undefined ? (d.variantLabel ?? null) : (before?.variantLabel ?? null),
        },
        before?.id,
      );
      if (before) updated++;
      else created++;
    }
    return { created, updated, categories: plan.newCategories.length };
  });
}
