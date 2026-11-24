import { Star } from "lucide-react";
import { brl, discountPercent } from "@/lib/format";
import { MAX_INSTALLMENTS, PIX_DISCOUNT, type Product } from "@/lib/products";
import { AddToCartButton } from "./add-to-cart-button";
import { FavoriteButton } from "./favorite-button";

export function ProductCard({ product, top = false }: { product: Product; top?: boolean }) {
  const off = discountPercent(product.price, product.oldPrice);

  return (
    <article className="reveal group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className={`relative grid aspect-square place-items-center ${product.tint}`}>
        {top ? (
          <span className="badge bg-sun text-petrol">⭐ Top</span>
        ) : (
          off > 0 && <span className="badge bg-red-500 text-white">-{off}%</span>
        )}
        <FavoriteButton name={product.name} />
        <span role="img" aria-label={product.name} className="text-6xl transition duration-300 group-hover:scale-110 lg:text-7xl">
          {product.emoji}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 lg:p-4">
        <h3 className="line-clamp-2 min-h-[2.7em] text-sm leading-snug font-medium text-ink lg:text-[0.95rem]">{product.name}</h3>

        <div className="flex items-center gap-1 text-xs text-muted">
          <span className="flex text-amber-400" aria-label={`Nota ${product.rating} de 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="size-3.5 fill-current" />
            ))}
          </span>
          {product.rating.toLocaleString("pt-BR")} ({product.reviews})
        </div>

        <div>
          {product.oldPrice && <p className="text-xs text-muted line-through">{brl(product.oldPrice)}</p>}
          <p className="font-display text-xl font-bold text-petrol">{brl(product.price)}</p>
          <p className="text-xs font-semibold text-emerald-600">{brl(product.price * (1 - PIX_DISCOUNT))} no Pix</p>
          <p className="text-xs text-muted">
            ou {MAX_INSTALLMENTS}x de {brl(product.price / MAX_INSTALLMENTS)} sem juros
          </p>
        </div>

        <AddToCartButton name={product.name} />
      </div>
    </article>
  );
}
