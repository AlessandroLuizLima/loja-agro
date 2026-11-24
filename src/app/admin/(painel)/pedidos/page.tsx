import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { OrderRow } from "@/components/admin/order-row";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { todayISO } from "@/lib/dates";
import { countOrdersByStatus, listOrders, type OrderFilter } from "@/lib/server/orders";
import { ORDER_STATUSES, statusLabel } from "@/lib/types";
import { adminUrl } from "@/lib/admin-path";

export const metadata: Metadata = { title: "Pedidos" };

const FILTERS: OrderFilter[] = ["abertos", ...ORDER_STATUSES, "todos"];
const filterLabel = (f: OrderFilter) => (f === "abertos" ? "Em aberto" : f === "todos" ? "Todos" : f === "pronto" ? "Pronto / separado" : f === "concluido" ? "Concluído" : statusLabel(f, "entrega"));

export default async function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  await connection();
  const { status } = await searchParams;
  const filter = FILTERS.includes(status as OrderFilter) ? (status as OrderFilter) : "abertos";
  const orders = listOrders(filter);
  const counts = countOrdersByStatus();
  const today = todayISO();

  return (
    <>
      <PageHeader title="Pedidos" subtitle={filter === "abertos" ? "Em aberto, pela data de retirada/entrega." : undefined} />
      <nav aria-label="Filtrar pedidos" className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4">
        <ul className="flex gap-2">
          {FILTERS.map((f) => {
            const n = f === "abertos" ? (counts.novo ?? 0) + (counts.confirmado ?? 0) + (counts.pronto ?? 0) + (counts.em_rota ?? 0) : f === "todos" ? undefined : counts[f];
            return (
              <li key={f}>
                <Link
                  href={f === "abertos" ? adminUrl("/pedidos") : adminUrl(`/pedidos?status=${f}`)}
                  aria-current={f === filter ? "page" : undefined}
                  className="flex items-center gap-1.5 rounded-full border-2 border-line bg-white px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-petrol aria-[current=page]:border-petrol aria-[current=page]:bg-petrol aria-[current=page]:text-white"
                >
                  {filterLabel(f)}
                  {n ? <span className="text-xs opacity-70">{n}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {orders.length === 0 ? (
        <EmptyState emoji="📭" text="Nenhum pedido aqui." />
      ) : (
        <ul className="divide-y divide-line rounded-2xl bg-white p-2 shadow-card">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} today={today} />
          ))}
        </ul>
      )}
    </>
  );
}
