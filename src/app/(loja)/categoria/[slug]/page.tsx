import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SortableProducts } from "@/components/sortable-products";
import { collapseVariants, getCategoryBySlug, listProducts } from "@/lib/server/catalog";
import { getSettings, storeInfo } from "@/lib/server/settings";
import { tintClass } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  await connection();
  const c = getCategoryBySlug((await params).slug);
  return c ? { title: c.name, description: c.description, alternates: { canonical: `/categoria/${c.slug}` } } : {};
}

export default async function CategoryPage({ params }: PageProps<"/categoria/[slug]">) {
  await connection();
  const category = getCategoryBySlug((await params).slug);
  if (!category) notFound();

  return (
    <div className="container-page py-5 lg:py-8">
      <Breadcrumbs items={[{ label: category.name }]} />
      <header className={`mb-6 flex items-center gap-4 rounded-3xl p-5 lg:p-8 ${tintClass(category.tint)}`}>
        <span className="text-5xl lg:text-6xl" aria-hidden="true">
          {category.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-petrol lg:text-3xl">{category.name}</h1>
          <p className="text-sm text-muted lg:text-base">{category.description}</p>
        </div>
      </header>
      <SortableProducts products={collapseVariants(listProducts({ categoryId: category.id }))} store={storeInfo(getSettings())} />
    </div>
  );
}
