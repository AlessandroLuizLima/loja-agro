import "server-only";
import { randomUUID } from "node:crypto";
import { normalizeText, slugify } from "../format";
import type { Category, Product, SaleMode, Tint } from "../types";
import { bool, db } from "./db";

/* ===== Categorias ===== */

type CategoryRow = { id: string; slug: string; name: string; emoji: string; tint: Tint; description: string; sort: number; active: number; product_count: number };

const toCategory = (r: CategoryRow): Category => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  emoji: r.emoji,
  tint: r.tint,
  description: r.description,
  sort: r.sort,
  active: bool(r.active),
  productCount: r.product_count,
});

export function listCategories({ activeOnly = true } = {}) {
  const rows = db()
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.active = 1) AS product_count
       FROM categories c ${activeOnly ? "WHERE c.active = 1" : ""} ORDER BY c.sort, c.name`,
    )
    .all() as CategoryRow[];
  return rows.map(toCategory);
}

export function getCategoryBySlug(slug: string) {
  return listCategories().find((c) => c.slug === slug);
}

export type CategoryInput = { name: string; emoji: string; tint: Tint; description: string; sort: number; active: boolean };

export function saveCategory(input: CategoryInput, id?: string) {
  const conn = db();
  if (id) {
    conn
      .prepare("UPDATE categories SET name = ?, emoji = ?, tint = ?, description = ?, sort = ?, active = ? WHERE id = ?")
      .run(input.name, input.emoji, input.tint, input.description, input.sort, input.active ? 1 : 0, id);
    return id;
  }
  const newId = randomUUID();
  conn
    .prepare("INSERT INTO categories (id, slug, name, emoji, tint, description, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(newId, uniqueSlug("categories", input.name), input.name, input.emoji, input.tint, input.description, input.sort, input.active ? 1 : 0);
  return newId;
}

/** Só apaga categorias sem produtos (inclusive inativos). */
export function deleteCategory(id: string) {
  const conn = db();
  const { n } = conn.prepare("SELECT COUNT(*) AS n FROM products WHERE category_id = ?").get(id) as { n: number };
  if (n > 0) return false;
  conn.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return true;
}

/* ===== Produtos ===== */

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  price: number;
  old_price: number | null;
  unit: string;
  stock: number;
  image_id: string | null;
  emoji: string;
  tint: Tint;
  description: string;
  highlights: string;
  sale_mode: SaleMode;
  featured: number;
  active: number;
  updated_at: string;
};

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  categoryId: r.category_id,
  categorySlug: r.category_slug,
  categoryName: r.category_name,
  price: r.price,
  oldPrice: r.old_price,
  unit: r.unit,
  stock: r.stock,
  imageId: r.image_id,
  emoji: r.emoji,
  tint: r.tint,
  description: r.description,
  highlights: JSON.parse(r.highlights) as string[],
  saleMode: r.sale_mode,
  featured: bool(r.featured),
  active: bool(r.active),
  updatedAt: r.updated_at,
});

const BASE = `SELECT p.*, c.slug AS category_slug, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id`;
/** Visível na loja: produto ativo numa categoria ativa */
const VISIBLE = `p.active = 1 AND c.active = 1`;
/** Na vitrine, primeiro o que tem estoque */
const ORDER = `ORDER BY (p.sale_mode = 'online' AND p.stock > 0) DESC, p.featured DESC, p.name`;

export function listProducts(opts: { categoryId?: string; featured?: boolean; onSale?: boolean; limit?: number } = {}) {
  const where = [VISIBLE];
  const params: (string | number)[] = [];
  if (opts.categoryId) {
    where.push("p.category_id = ?");
    params.push(opts.categoryId);
  }
  if (opts.featured) where.push("p.featured = 1");
  if (opts.onSale) where.push("p.old_price > p.price");
  const sql = `${BASE} WHERE ${where.join(" AND ")} ${ORDER} ${opts.limit ? `LIMIT ${Math.floor(opts.limit)}` : ""}`;
  return (db().prepare(sql).all(...params) as ProductRow[]).map(toProduct);
}

/** Lista do painel: inclui inativos, com filtro por texto e categoria. */
export function listAllProducts(opts: { q?: string; categoryId?: string } = {}) {
  const rows = (db().prepare(`${BASE} ORDER BY p.name`).all() as ProductRow[]).map(toProduct);
  const q = opts.q ? normalizeText(opts.q.trim()) : "";
  return rows.filter((p) => (!opts.categoryId || p.categoryId === opts.categoryId) && (!q || normalizeText(p.name).includes(q)));
}

/** Busca sem acento e sem diferenciar maiúsculas (o catálogo de uma loja cabe tranquilo na memória). */
export function searchProducts(query: string) {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return listProducts().filter((p) => {
    const hay = normalizeText(`${p.name} ${p.categoryName} ${p.description}`);
    return terms.every((t) => hay.includes(t));
  });
}

export function getProductBySlug(slug: string, { visibleOnly = true } = {}) {
  const row = db()
    .prepare(`${BASE} WHERE p.slug = ? ${visibleOnly ? `AND ${VISIBLE}` : ""}`)
    .get(slug) as ProductRow | undefined;
  return row ? toProduct(row) : undefined;
}

export function getProductById(id: string) {
  const row = db().prepare(`${BASE} WHERE p.id = ?`).get(id) as ProductRow | undefined;
  return row ? toProduct(row) : undefined;
}

export function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const marks = slugs.map(() => "?").join(",");
  return (db().prepare(`${BASE} WHERE ${VISIBLE} AND p.slug IN (${marks})`).all(...slugs) as ProductRow[]).map(toProduct);
}

export function relatedProducts(product: Product, limit = 4) {
  return listProducts({ categoryId: product.categoryId })
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

export function lowStockProducts(threshold = 5) {
  return (
    db()
      .prepare(`${BASE} WHERE p.active = 1 AND p.sale_mode = 'online' AND p.stock <= ? ORDER BY p.stock, p.name`)
      .all(threshold) as ProductRow[]
  ).map(toProduct);
}

export type ProductInput = {
  name: string;
  categoryId: string;
  price: number;
  oldPrice: number | null;
  unit: string;
  stock: number;
  imageId: string | null;
  emoji: string;
  tint: Tint;
  description: string;
  highlights: string[];
  saleMode: SaleMode;
  featured: boolean;
  active: boolean;
};

export function saveProduct(input: ProductInput, id?: string) {
  const conn = db();
  const values = [
    input.name,
    input.categoryId,
    input.price,
    input.oldPrice,
    input.unit,
    input.stock,
    input.imageId,
    input.emoji,
    input.tint,
    input.description,
    JSON.stringify(input.highlights),
    input.saleMode,
    input.featured ? 1 : 0,
    input.active ? 1 : 0,
  ];
  if (id) {
    conn
      .prepare(
        `UPDATE products SET name = ?, category_id = ?, price = ?, old_price = ?, unit = ?, stock = ?, image_id = ?, emoji = ?, tint = ?,
         description = ?, highlights = ?, sale_mode = ?, featured = ?, active = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .run(...values, id);
    return id;
  }
  const newId = randomUUID();
  conn
    .prepare(
      `INSERT INTO products (name, category_id, price, old_price, unit, stock, image_id, emoji, tint, description, highlights, sale_mode, featured, active, id, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(...values, newId, uniqueSlug("products", input.name));
  return newId;
}

export function setStock(id: string, stock: number) {
  db().prepare("UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?").run(stock, id);
}

export function deleteProduct(id: string) {
  db().prepare("DELETE FROM products WHERE id = ?").run(id);
}

/** Endereço amigável único: "racao-15-kg", "racao-15-kg-2"… (não muda depois, para não quebrar links). */
function uniqueSlug(table: "products" | "categories", name: string) {
  const base = slugify(name) || "item";
  const exists = db().prepare(`SELECT 1 FROM ${table} WHERE slug = ?`);
  let slug = base;
  for (let i = 2; exists.get(slug); i++) slug = `${base}-${i}`;
  return slug;
}
