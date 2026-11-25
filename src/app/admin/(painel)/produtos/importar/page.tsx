import { ArrowLeft, Download, FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ImportForm } from "@/components/admin/import-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { adminUrl } from "@/lib/admin-path";

export const metadata: Metadata = { title: "Planilha de produtos" };

export default async function ImportPage() {
  await connection();
  return (
    <>
      <Link href={adminUrl("/produtos")} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-petrol hover:underline">
        <ArrowLeft className="size-4" /> Produtos
      </Link>
      <PageHeader title="Planilha de produtos" subtitle="Cadastre ou atualize muitos produtos de uma vez pelo Excel ou Google Planilhas." />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card title="Importar planilha">
          <div className="mt-4">
            <ImportForm productsHref={adminUrl("/produtos")} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card title="Baixar">
            <div className="mt-3 grid gap-2">
              <a href={adminUrl("/produtos/planilha")} download className="btn h-11 border-2 border-line text-sm text-petrol hover:border-brand">
                <Download className="size-4" /> Todos os produtos
              </a>
              <a href={adminUrl("/produtos/planilha?modelo=1")} download className="btn h-11 border-2 border-line text-sm text-petrol hover:border-brand">
                <FileDown className="size-4" /> Modelo em branco
              </a>
            </div>
          </Card>
          <Card title="Como funciona">
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted">
              <li>
                Para <b>atualizar preços e estoque</b>: baixe “Todos os produtos”, altere no Excel e importe de volta.
              </li>
              <li>
                Para <b>cadastrar produtos novos</b>: use o modelo, ou deixe a coluna <code>id</code> em branco.
              </li>
              <li>
                No Excel, salve em <b>Arquivo &gt; Salvar como &gt; CSV UTF-8</b>.
              </li>
              <li>Clique em “Conferir planilha”: nada é gravado até você confirmar.</li>
            </ol>
            <p className="mt-3 text-xs text-muted">
              Colunas: nome, categoria, preco, estoque (obrigatórias), preco_de, unidade, venda (online ou consulta), destaque e ativo (sim ou não), descricao. Categorias
              que não existem são criadas. Fotos continuam sendo enviadas pelo painel.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
