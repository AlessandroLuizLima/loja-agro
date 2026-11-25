import type { Metadata } from "next";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SortableProducts } from "@/components/sortable-products";
import { collapseVariants, listProducts } from "@/lib/server/catalog";
import { getSettings, storeInfo } from "@/lib/server/settings";

export const metadata: Metadata = { title: "Ofertas", alternates: { canonical: "/ofertas" } };

export default async function OffersPage() {
  await connection();
  return (
    <div className="container-page py-5 lg:py-8">
      <Breadcrumbs items={[{ label: "Ofertas" }]} />
      <header className="mb-6 flex items-center gap-4 rounded-3xl bg-brand-soft p-5 lg:p-8">
        <span className="text-5xl lg:text-6xl" aria-hidden="true">
          🔥
        </span>
        <div>
          <h1 className="text-2xl font-bold text-petrol lg:text-3xl">Ofertas</h1>
          <p className="text-sm text-muted lg:text-base">Preços especiais enquanto durar o estoque.</p>
        </div>
      </header>
      <SortableProducts products={collapseVariants(listProducts({ onSale: true }))} store={storeInfo(getSettings())} />
    </div>
  );
}
