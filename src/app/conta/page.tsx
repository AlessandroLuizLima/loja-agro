import { LogOut, Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { brl } from "@/lib/format";
import { listOrdersByUser } from "@/lib/server/orders";
import { requireUser } from "@/lib/server/users";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="container-page py-6 lg:py-10">
      <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-white" />}>
        <Account />
      </Suspense>
    </div>
  );
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Sao_Paulo" });
const parseDb = (s: string) => new Date(s.replace(" ", "T") + "Z");

async function Account() {
  const user = await requireUser("/conta");
  const orders = listOrdersByUser(user.id);

  return (
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
          <dd className="pt-1 text-xs text-muted">Cliente desde {dateFmt.format(parseDb(user.createdAt))}</dd>
        </dl>
        <form action={signOut} className="mt-6">
          <button type="submit" className="btn h-11 w-full border-2 border-line text-petrol hover:border-red-300 hover:text-red-600">
            <LogOut className="size-4" /> Sair
          </button>
        </form>
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
            <Link href="/categoria/promocoes" className="btn btn-primary">
              Aproveitar ofertas
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/pedido/${o.id}`} className="-mx-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3 py-4 transition hover:bg-cream">
                  <div className="flex -space-x-3" aria-hidden="true">
                    {o.items.slice(0, 3).map((i) => (
                      <span key={i.slug} className={`grid size-11 place-items-center rounded-full border-2 border-white text-xl ${i.tint}`}>
                        {i.emoji}
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-petrol">Pedido #{o.number}</p>
                    <p className="text-xs text-muted">
                      {dateFmt.format(parseDb(o.createdAt))} · {o.items.reduce((n, i) => n + i.qty, 0)} itens
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                  <p className="w-24 text-right font-display font-bold text-petrol">{brl(o.totals.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
