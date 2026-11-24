import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, top = false }: { products: readonly Product[]; top?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} top={top} />
      ))}
    </div>
  );
}
