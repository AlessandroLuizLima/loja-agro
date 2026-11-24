import { Check, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductGrid } from "@/components/product-grid";
import { ProductPurchase } from "@/components/product-purchase";
import { Rating } from "@/components/rating";
import { SectionHeading } from "@/components/section-heading";
import { allProducts, getCollection, getProduct, relatedProducts } from "@/lib/catalog";
import { brl, discountPercent } from "@/lib/format";
import { maxInstallments, PIX_DISCOUNT } from "@/lib/pricing";

export function generateStaticParams() {
  return allProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: { title: product.name, description: product.description, type: "website" },
  };
}

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const off = discountPercent(product.price, product.oldPrice);
  const category = getCollection(product.category)!;
  const n = maxInstallments(product.price);
  const pix = product.price * (1 - PIX_DISCOUNT);

  // Dados estruturados para o Google mostrar preço e estrelas no resultado da busca
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    brand: { "@type": "Brand", name: "PetHouse" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-page py-5 lg:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs items={[{ label: category.name, href: `/categoria/${category.slug}` }, { label: product.name }]} />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className={`relative grid aspect-square place-items-center rounded-3xl ${product.tint}`}>
          {off > 0 && <span className="badge top-4 left-4 bg-red-500 px-3 py-1.5 text-sm text-white">-{off}%</span>}
          <FavoriteButton name={product.name} />
          <span role="img" aria-label={product.name} className="text-[9rem] lg:text-[13rem]">
            {product.emoji}
          </span>
        </div>

        <div>
          <h1 className="mb-2 text-2xl leading-tight font-bold text-petrol lg:text-3xl">{product.name}</h1>
          <Rating value={product.rating} count={product.reviews} size="md" />

          <div className="my-5 rounded-2xl bg-white p-5 shadow-card">
            {product.oldPrice && <p className="text-sm text-muted line-through">{brl(product.oldPrice)}</p>}
            <p className="font-display text-4xl font-bold text-petrol">{brl(product.price)}</p>
            <p className="mt-1 font-semibold text-emerald-700">
              {brl(pix)} no Pix <span className="font-normal text-muted">(5% de desconto)</span>
            </p>
            {n > 1 && (
              <p className="text-sm text-muted">
                ou em até {n}x de {brl(product.price / n)} sem juros
              </p>
            )}
            <p className={`mt-3 text-sm font-medium ${product.stock > 0 ? (product.stock < 20 ? "text-brand-dark" : "text-emerald-700") : "text-red-600"}`}>
              {product.stock === 0 ? "Produto esgotado" : product.stock < 20 ? `Restam só ${product.stock} unidades!` : "Em estoque · envio imediato"}
            </p>
          </div>

          <ProductPurchase slug={product.slug} stock={product.stock} />

          <ul className="mt-5 grid gap-2 text-sm text-muted sm:grid-cols-3">
            <li className="flex items-center gap-2"><Truck className="size-4 text-brand" /> Frete grátis acima de R$ 199</li>
            <li className="flex items-center gap-2"><RefreshCw className="size-4 text-brand" /> Troca grátis em 30 dias</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand" /> Compra 100% segura</li>
          </ul>

          <section className="mt-8">
            <h2 className="mb-2 text-lg font-bold text-petrol">Descrição</h2>
            <p className="mb-4 leading-relaxed">{product.description}</p>
            <ul className="space-y-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  {h}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              Dúvidas sobre este produto?{" "}
              <Link href="/ajuda/fale-conosco" className="font-semibold text-brand-dark hover:underline">
                Fale com a gente
              </Link>
            </p>
          </section>
        </div>
      </div>

      <section className="mt-12">
        <SectionHeading title="Você também pode gostar" />
        <ProductGrid products={relatedProducts(product)} />
      </section>
    </div>
  );
}
