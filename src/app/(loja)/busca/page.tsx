import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SortableProducts } from "@/components/sortable-products";
import { collapseVariants, listCategories, searchProducts } from "@/lib/server/catalog";
import { getSettings, storeInfo } from "@/lib/server/settings";

export const metadata: Metadata = { title: "Busca", robots: { index: false } };

export default async function SearchPage({ searchParams }: PageProps<"/busca">) {
  await connection();
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : (raw ?? "")).trim().slice(0, 80);
  const results = collapseVariants(searchProducts(q));

  return (
    <div className="container-page py-5 lg:py-8">
      <Breadcrumbs items={[{ label: "Busca" }]} />
      <h1 className="mb-5 text-2xl font-bold text-petrol">{q ? <>Resultados para &ldquo;{q}&rdquo;</> : "O que você procura?"}</h1>
      {results.length > 0 ? (
        <SortableProducts products={results} store={storeInfo(getSettings())} />
      ) : (
        <div className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="mb-1 text-5xl" aria-hidden="true">
            🔍
          </p>
          <p className="mb-4 font-display font-semibold text-petrol">{q ? "Não encontramos nada com esse termo." : "Digite algo na busca acima."}</p>
          <p className="mb-3 text-sm text-muted">Que tal navegar pelas categorias?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {listCategories().map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="rounded-full bg-petrol-soft px-4 py-2 text-sm font-semibold text-petrol hover:bg-brand-soft">
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
