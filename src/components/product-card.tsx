import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { brl, discountPercent } from "@/lib/format";
import { maxInstallments, PIX_DISCOUNT } from "@/lib/pricing";
import { AddToCartButton } from "./add-to-cart-button";
import { FavoriteButton } from "./favorite-button";
import { Rating } from "./rating";

export function ProductCard({ product, top = false }: { product: Product; top?: boolean }) {
  const off = discountPercent(product.price, product.oldPrice);
  const href = `/produto/${product.slug}`;
  const n = maxInstallments(product.price);

  return (
    <article className="reveal group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className={`relative grid aspect-square place-items-center ${product.tint}`}>
        {top ? <span className="badge bg-sun text-petrol">⭐ Top</span> : off > 0 && <span className="badge bg-red-500 text-white">-{off}%</span>}
        <FavoriteButton name={product.name} />
        <Link href={href} tabIndex={-1} aria-hidden="true" className="grid size-full place-items-center text-6xl transition duration-300 group-hover:scale-110 lg:text-7xl">
          {product.emoji}
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 lg:p-4">
        <h3 className="line-clamp-2 min-h-[2.7em] text-sm leading-snug font-medium text-ink lg:text-[0.95rem]">
          <Link href={href} className="hover:text-brand-dark">
            {product.name}
          </Link>
        </h3>

        <Rating value={product.rating} count={product.reviews} />

        <div>
          {product.oldPrice && <p className="text-xs text-muted line-through">{brl(product.oldPrice)}</p>}
          <p className="font-display text-xl font-bold text-petrol">{brl(product.price)}</p>
          <p className="text-xs font-semibold text-emerald-600">{brl(product.price * (1 - PIX_DISCOUNT))} no Pix</p>
          {n > 1 && (
            <p className="text-xs text-muted">
              ou {n}x de {brl(product.price / n)} sem juros
            </p>
          )}
        </div>

        <AddToCartButton slug={product.slug} disabled={product.stock === 0} />
      </div>
    </article>
  );
}
