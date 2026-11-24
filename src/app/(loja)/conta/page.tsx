import { Download, LayoutDashboard, LogOut, Package, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { DeleteAccount } from "@/components/auth/delete-account";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { ProductImage } from "@/components/product-image";
import { longDate } from "@/lib/dates";
import { brl, formatDate } from "@/lib/format";
import { listOrdersByUser } from "@/lib/server/orders";
import { requireUser } from "@/lib/server/users";
import { signOut } from "./actions";
import { adminUrl } from "@/lib/admin-path";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

export default async function AccountPage() {
  await connection();
  const user = await requireUser("/conta");
  const orders = listOrdersByUser(user.id);

  return (
    <div className="container-page py-6 lg:py-10">
      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-card">
          <div className="mb-4 grid size-16 place-items-center rounded-full bg-brand font-display text-2xl font-bold text-white">{user.firstName[0]?.toUpperCase()}</div>
          <h1 className="text-xl font-bold text-petrol">Olá, {user.firstName}!</h1>
          <dl className="mt-3 space-y-1 text-sm">
            <dt className="sr-only">Nome</dt>
            <dd>{user.name}</dd>
            <dt className="sr-only">E-mail</dt>
            <dd className="break-all text-muted">{user.email}</dd>
            {user.phone && (
              <>
                <dt className="sr-only">Celular</dt>
                <dd className="text-muted">{user.phone}</dd>
              </>
            )}
            <dd className="pt-1 text-xs text-muted">Cliente desde {formatDate(user.createdAt)}</dd>
          </dl>
          {user.role === "admin" && (
            <Link href={adminUrl()} className="btn btn-petrol mt-6 h-11 w-full">
              <LayoutDashboard className="size-4" /> Painel da loja
            </Link>
          )}
          <form action={signOut} className="mt-3">
            <button type="submit" className="btn h-11 w-full border-2 border-line text-petrol hover:border-red-300 hover:text-red-600">
              <LogOut className="size-4" /> Sair
            </button>
          </form>

          {user.role !== "admin" && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-petrol">
                <ShieldCheck className="size-4 text-brand" /> Seus dados
              </p>
              <p className="mb-3 text-xs text-muted">
                Pela LGPD, você pode baixar ou excluir seus dados a qualquer momento.{" "}
                <Link href="/ajuda/politica-de-privacidade" className="underline">
                  Saiba mais
                </Link>
              </p>
              <a href="/conta/meus-dados" download className="btn h-11 w-full border-2 border-line text-sm text-petrol hover:border-brand">
                <Download className="size-4" /> Baixar meus dados
              </a>
              <DeleteAccount />
            </div>
          )}
        </aside>

        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-petrol">
            <Package className="size-6 text-brand" /> Meus pedidos
          </h2>
          {orders.length === 0 ? (
            <div className="py-10 text-center">
              <p className="mb-2 text-5xl" aria-hidden="true">
                📦
              </p>
              <p className="mb-4 text-muted">Você ainda não fez nenhum pedido.</p>
              <Link href="/" className="btn btn-primary">
                Ver produtos
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/pedido/${o.id}`} className="-mx-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3 py-4 transition hover:bg-cream">
                    <div className="flex -space-x-3" aria-hidden="true">
                      {o.items.slice(0, 3).map((i) => (
                        <ProductImage key={i.slug} item={i} className="size-11 rounded-full border-2 border-white" emojiClassName="text-xl" />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold text-petrol">Pedido #{o.number}</p>
                      <p className="text-xs text-muted">
                        {o.fulfillment.type === "retirada" ? "Retirada" : "Entrega"} {longDate(o.fulfillment.date)} · {o.items.reduce((n, i) => n + i.qty, 0)} itens
                      </p>
                    </div>
                    <OrderStatusBadge status={o.status} type={o.fulfillment.type} />
                    <p className="w-24 text-right font-display font-bold text-petrol">{brl(o.totals.total)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
