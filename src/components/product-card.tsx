import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { brl, discountPercent } from "@/lib/format";
import { toSnapshot, type Product } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";

/** Informações da loja que os cards precisam: WhatsApp para consultas e desconto do Pix. */
export type StoreInfo = { whatsapp: string; pixPercent: number };

export function stockText(p: Pick<Product, "stock" | "saleMode">) {
  if (p.saleMode === "consulta") return { text: "Sob consulta", tone: "text-petrol" };
  if (p.stock <= 0) return { text: "Sem estoque no momento", tone: "text-red-600" };
  if (p.stock === 1) return { text: "Última unidade", tone: "text-brand-dark" };
  if (p.stock <= 5) return { text: `Últimas ${p.stock} unidades`, tone: "text-brand-dark" };
  return { text: `${p.stock} em estoque`, tone: "text-emerald-700" };
}

export function ProductCard({ product, store }: { product: Product; store: StoreInfo }) {
  const off = discountPercent(product.price, product.oldPrice);
  const href = `/produto/${product.slug}`;
  const consulta = product.saleMode === "consulta";
  const available = !consulta && product.stock > 0;
  const stock = stockText(product);

  return (
    <article className="reveal group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-1.5 hover:shadow-lift hover:ring-brand/40">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block">
        {off > 0 && <span className="badge bg-red-500 text-white">-{off}%</span>}
        <div className="overflow-hidden">
          <ProductImage item={product} className="aspect-square transition duration-500 ease-out group-hover:scale-108" emojiClassName="text-6xl transition duration-500 group-hover:-rotate-6 lg:text-7xl" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 lg:p-4">
        <h3 className="line-clamp-2 min-h-[2.7em] text-sm leading-snug font-medium text-ink lg:text-[0.95rem]">
          <Link href={href} className="hover:text-brand-dark">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-muted">{product.unit}</p>

        {!consulta && (
          <div>
            {off > 0 && <p className="text-xs text-muted line-through">{brl(product.oldPrice!)}</p>}
            <p className="font-display text-xl font-bold text-petrol">{brl(product.price)}</p>
            {store.pixPercent > 0 && <p className="text-xs font-semibold text-emerald-700">{brl(product.price * (1 - store.pixPercent / 100))} no Pix</p>}
          </div>
        )}
        <p className={`flex items-center gap-1.5 text-xs font-semibold ${stock.tone}`}>
          <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
          {stock.text}
        </p>

        {available ? (
          <AddToCartButton product={toSnapshot(product)} />
        ) : (
          <a
            href={waLink(store.whatsapp, consulta ? `Olá! Quero saber sobre: ${product.name}` : `Olá! Vocês vão ter de novo: ${product.name}?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-auto h-11 w-full border-2 border-[#25D366] px-3 text-sm text-[#128C7E] hover:bg-[#25D366]/10"
          >
            <MessageCircle className="size-4" /> {consulta ? "Consultar" : "Avisar quando chegar"}
          </a>
        )}
      </div>
    </article>
  );
}
