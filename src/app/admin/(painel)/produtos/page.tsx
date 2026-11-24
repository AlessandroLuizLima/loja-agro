import { CheckCircle2, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { updateStockAction } from "@/app/admin/actions/products";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { ProductImage } from "@/components/product-image";
import { brl } from "@/lib/format";
import { listAllProducts, listCategories } from "@/lib/server/catalog";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/produtos">) {
  await connection();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 60) : "";
  const categoryId = typeof sp.categoria === "string" ? sp.categoria : "";
  const saved = typeof sp.salvo === "string" ? sp.salvo : "";
  const categories = listCategories({ activeOnly: false });
  const products = listAllProducts({ q, categoryId });

  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} ${products.length === 1 ? "produto" : "produtos"}`}
        action={
          <Link href="/admin/produtos/novo" className="btn btn-primary h-11 px-5 text-sm">
            <Plus className="size-4" /> Novo produto
          </Link>
        }
      />

      {saved && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="size-4" /> “{saved}” salvo. A loja já mostra a alteração.
        </p>
      )}

      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute top-3 left-3 size-5 text-muted" />
          <input name="q" defaultValue={q} placeholder="Buscar pelo nome" aria-label="Buscar pelo nome" className="h-11 w-full rounded-xl border-2 border-line bg-white pr-3 pl-10 outline-none focus:border-brand" />
        </div>
        <select name="categoria" defaultValue={categoryId} aria-label="Categoria" className="h-11 rounded-xl border-2 border-line bg-white px-3 outline-none focus:border-brand">
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-petrol h-11 px-5 text-sm">
          Filtrar
        </button>
      </form>

      {products.length === 0 ? (
        <EmptyState emoji="📦" text={q || categoryId ? "Nenhum produto com esse filtro." : "Nenhum produto cadastrado ainda."} />
      ) : (
        <ul className="divide-y divide-line rounded-2xl bg-white shadow-card">
          {products.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
              <Link href={`/admin/produtos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <ProductImage item={p} className="size-14 shrink-0 rounded-xl" emojiClassName="text-2xl" />
                <span className="min-w-0">
                  <b className="block truncate font-medium text-ink hover:text-brand-dark">{p.name}</b>
                  <span className="text-xs text-muted">
                    {p.categoryName} · {p.saleMode === "consulta" ? "Sob consulta" : brl(p.price)}
                    {!p.active && <span className="ml-1.5 rounded-full bg-line px-2 py-0.5 font-semibold text-muted">Oculto</span>}
                    {p.featured && <span className="ml-1.5 rounded-full bg-sun-soft px-2 py-0.5 font-semibold text-amber-800">Destaque</span>}
                  </span>
                </span>
              </Link>
              {p.saleMode === "online" && (
                <form action={updateStockAction} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={p.id} />
                  <label className="text-xs text-muted" htmlFor={`stock-${p.id}`}>
                    Estoque
                  </label>
                  <input
                    id={`stock-${p.id}`}
                    name="stock"
                    type="number"
                    min={0}
                    defaultValue={p.stock}
                    key={p.stock}
                    className={`h-10 w-20 rounded-lg border-2 px-2 text-center font-semibold outline-none focus:border-brand ${p.stock === 0 ? "border-red-300 text-red-600" : p.stock <= 5 ? "border-sun text-amber-700" : "border-line"}`}
                  />
                  <button type="submit" className="h-10 rounded-lg bg-petrol px-3 text-xs font-semibold text-white hover:bg-petrol-dark">
                    Salvar
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
