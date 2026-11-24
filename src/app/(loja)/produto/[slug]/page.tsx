import { Check, MessageCircle, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { stockText } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { ProductImage } from "@/components/product-image";
import { ProductPurchase } from "@/components/product-purchase";
import { SectionHeading } from "@/components/section-heading";
import { brl, discountPercent } from "@/lib/format";
import { getProductBySlug, relatedProducts } from "@/lib/server/catalog";
import { getSettings, siteUrl, storeInfo } from "@/lib/server/settings";
import { imageUrl, toSnapshot } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  await connection();
  const product = getProductBySlug((await params).slug);
  if (!product) return {};
  const image = imageUrl(product.imageId);
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: { title: product.name, description: product.description, type: "website", images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  await connection();
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();

  const s = getSettings();
  const store = storeInfo(s);
  const off = discountPercent(product.price, product.oldPrice);
  const consulta = product.saleMode === "consulta";
  const available = !consulta && product.stock > 0;
  const stock = stockText(product);
  const image = imageUrl(product.imageId);

  // Dados estruturados para o Google mostrar preço e disponibilidade no resultado da busca
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    ...(image && { image: `${siteUrl(s)}${image}` }),
    ...(!consulta && {
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: product.price.toFixed(2),
        availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: s.storeName },
      },
    }),
  };

  return (
    <div className="container-page py-5 lg:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs items={[{ label: product.categoryName, href: `/categoria/${product.categorySlug}` }, { label: product.name }]} />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative">
          {off > 0 && <span className="badge top-4 left-4 bg-red-500 px-3 py-1.5 text-sm text-white">-{off}%</span>}
          <ProductImage item={product} eager className="aspect-square rounded-3xl" emojiClassName="text-[9rem] lg:text-[13rem]" />
        </div>

        <div>
          <h1 className="mb-1 text-2xl leading-tight font-bold text-petrol lg:text-3xl">{product.name}</h1>
          <p className="text-muted">{product.unit}</p>

          <div className="my-5 rounded-2xl bg-white p-5 shadow-card">
            {consulta ? (
              <p className="font-display text-2xl font-bold text-petrol">Preço sob consulta</p>
            ) : (
              <>
                {off > 0 && <p className="text-sm text-muted line-through">{brl(product.oldPrice!)}</p>}
                <p className="font-display text-4xl font-bold text-petrol">{brl(product.price)}</p>
                {store.pixPercent > 0 && (
                  <p className="mt-1 font-semibold text-emerald-700">
                    {brl(product.price * (1 - store.pixPercent / 100))} no Pix <span className="font-normal text-muted">({store.pixPercent}% de desconto pagando pelo site)</span>
                  </p>
                )}
              </>
            )}
            <p className={`mt-3 text-sm font-semibold ${stock.tone}`}>{stock.text}</p>
          </div>

          {available ? (
            <ProductPurchase product={toSnapshot(product)} />
          ) : (
            <a
              href={waLink(s.whatsapp, consulta ? `Olá! Quero saber sobre: ${product.name}` : `Olá! Vocês vão ter de novo: ${product.name}?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn h-13 w-full bg-[#25D366] text-base text-white hover:bg-[#1ebe5a] sm:w-auto sm:px-10"
            >
              <MessageCircle className="size-5" /> {consulta ? "Consultar pelo WhatsApp" : "Avise-me quando chegar"}
            </a>
          )}

          <ul className="mt-5 grid gap-2 text-sm text-muted sm:grid-cols-2">
            {s.pickupEnabled && (
              <li className="flex items-center gap-2">
                <Store className="size-4 text-brand" /> Retire grátis na loja
              </li>
            )}
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-brand" /> Entrega na sua região em dia fixo
            </li>
          </ul>

          <section className="mt-8">
            <h2 className="mb-2 text-lg font-bold text-petrol">Descrição</h2>
            <p className="mb-4 leading-relaxed whitespace-pre-line">{product.description}</p>
            {product.highlights.length > 0 && (
              <ul className="space-y-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-sm text-muted">
              Dúvidas sobre este produto?{" "}
              <a href={waLink(s.whatsapp, `Olá! Tenho uma dúvida sobre: ${product.name}`)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-dark hover:underline">
                Pergunte no WhatsApp
              </a>
            </p>
          </section>
        </div>
      </div>

      {relatedProducts(product).length > 0 && (
        <section className="mt-12">
          <SectionHeading title="Você também pode precisar" />
          <ProductGrid products={relatedProducts(product)} store={store} />
        </section>
      )}
    </div>
  );
}
