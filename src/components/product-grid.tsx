import type { Product } from "@/lib/types";
import { ProductCard, type StoreInfo } from "./product-card";

export function ProductGrid({ products, store }: { products: readonly Product[]; store: StoreInfo }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} store={store} />
      ))}
    </div>
  );
}
