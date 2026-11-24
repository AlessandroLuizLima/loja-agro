import type { Metadata } from "next";
import { connection } from "next/server";
import { CategoryEditor } from "@/components/admin/store-forms";
import { PageHeader } from "@/components/admin/ui";
import { listCategories } from "@/lib/server/catalog";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  await connection();
  const categories = listCategories({ activeOnly: false });
  return (
    <>
      <PageHeader title="Categorias" subtitle="Aparecem no menu da loja, na ordem definida aqui." />
      <div className="space-y-3">
        {categories.map((c) => (
          <CategoryEditor key={c.id} category={c} />
        ))}
      </div>
      <h2 className="mt-8 mb-3 font-display text-lg font-bold text-petrol">Nova categoria</h2>
      <CategoryEditor key={categories.length} nextSort={categories.length} />
    </>
  );
}
