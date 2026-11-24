import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SortableProducts } from "@/components/sortable-products";
import { collections, getCollection, productsIn } from "@/lib/catalog";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const c = getCollection((await params).slug);
  return c ? { title: c.name, description: c.description, alternates: { canonical: `/categoria/${c.slug}` } } : {};
}

export default async function CategoryPage({ params }: PageProps<"/categoria/[slug]">) {
  const collection = getCollection((await params).slug);
  if (!collection) notFound();
  const products = productsIn(collection.slug);

  return (
    <div className="container-page py-5 lg:py-8">
      <Breadcrumbs items={[{ label: collection.name }]} />
      <header className={`mb-6 flex items-center gap-4 rounded-3xl p-5 lg:p-8 ${collection.tint}`}>
        <span className="text-5xl lg:text-6xl" aria-hidden="true">
          {collection.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-petrol lg:text-3xl">{collection.name}</h1>
          <p className="text-sm text-muted lg:text-base">{collection.description}</p>
        </div>
      </header>
      <SortableProducts products={products} />
    </div>
  );
}
