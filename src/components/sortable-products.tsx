"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard, type StoreInfo } from "./product-card";

type P = Product;
const available = (p: P) => (p.saleMode === "online" && p.stock > 0 ? 1 : 0);

const sorters = {
  relevancia: { label: "Disponíveis primeiro", fn: (a: P, b: P) => available(b) - available(a) },
  "menor-preco": { label: "Menor preço", fn: (a: P, b: P) => a.price - b.price },
  "maior-preco": { label: "Maior preço", fn: (a: P, b: P) => b.price - a.price },
  desconto: { label: "Maior desconto", fn: (a: P, b: P) => (b.oldPrice ? 1 - b.price / b.oldPrice : 0) - (a.oldPrice ? 1 - a.price / a.oldPrice : 0) },
  nome: { label: "Nome (A–Z)", fn: (a: P, b: P) => a.name.localeCompare(b.name, "pt-BR") },
} as const;

type SortKey = keyof typeof sorters;

export function SortableProducts({ products, store }: { products: readonly Product[]; store: StoreInfo }) {
  const [sort, setSort] = useState<SortKey>("relevancia");
  const sorted = [...products].sort(sorters[sort].fn);

  if (products.length === 0) {
    return <p className="rounded-2xl bg-white p-8 text-center text-muted shadow-card">Nenhum produto por aqui ainda. 🌱</p>;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-full border-2 border-line bg-white px-3 font-medium text-petrol outline-none focus:border-brand">
            {Object.entries(sorters).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} store={store} />
        ))}
      </div>
    </>
  );
}
