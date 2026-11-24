import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/product-form";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { listCategories } from "@/lib/server/catalog";
import { adminUrl } from "@/lib/admin-path";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  await connection();
  const categories = listCategories({ activeOnly: false });
  return (
    <>
      <Link href={adminUrl("/produtos")} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-petrol hover:underline">
        <ArrowLeft className="size-4" /> Produtos
      </Link>
      <PageHeader title="Novo produto" />
      {categories.length === 0 ? (
        <EmptyState emoji="🏷️" text="Crie uma categoria antes de cadastrar produtos." action={<Link href={adminUrl("/categorias")} className="btn btn-primary">Criar categoria</Link>} />
      ) : (
        <ProductForm categories={categories} />
      )}
    </>
  );
}
