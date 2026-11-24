import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { deleteProductAction } from "@/app/admin/actions/products";
import { ConfirmSubmit } from "@/components/admin/client-buttons";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { getProductById, listCategories } from "@/lib/server/catalog";
import { adminUrl } from "@/lib/admin-path";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  await connection();
  const product = getProductById((await params).id);
  if (!product) notFound();

  return (
    <>
      <Link href={adminUrl("/produtos")} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-petrol hover:underline">
        <ArrowLeft className="size-4" /> Produtos
      </Link>
      <PageHeader
        title={product.name}
        subtitle={`Atualizado em ${formatDateTime(product.updatedAt)}`}
        action={
          product.active && (
            <Link href={`/produto/${product.slug}`} target="_blank" className="flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:underline">
              Ver na loja <ExternalLink className="size-4" />
            </Link>
          )
        }
      />
      <ProductForm product={product} categories={listCategories({ activeOnly: false })} />
      <form action={deleteProductAction} className="mt-8 border-t border-line pt-5">
        <input type="hidden" name="id" value={product.id} />
        <ConfirmSubmit message={`Apagar "${product.name}"? Pedidos antigos continuam com o registro do item.`} className="text-sm font-semibold text-red-600 hover:underline">
          Apagar produto
        </ConfirmSubmit>
        <p className="mt-1 text-xs text-muted">Para tirar da loja só por um tempo, desmarque “Mostrar na loja”.</p>
      </form>
    </>
  );
}
