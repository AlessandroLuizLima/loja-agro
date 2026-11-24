import type { Metadata } from "next";
import { connection } from "next/server";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/icons";
import { brl, formatDate } from "@/lib/format";
import { listCustomers } from "@/lib/server/users";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Clientes" };

export default async function CustomersPage() {
  await connection();
  const customers = listCustomers();
  return (
    <>
      <PageHeader title="Clientes cadastrados" subtitle="Quem criou conta no site. Pedidos sem cadastro aparecem só em Pedidos." />
      {customers.length === 0 ? (
        <EmptyState emoji="👥" text="Nenhum cliente cadastrado ainda." />
      ) : (
        <ul className="divide-y divide-line rounded-2xl bg-white shadow-card">
          {customers.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand font-display font-bold text-white">{c.name[0]?.toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <b className="block truncate font-medium">{c.name}</b>
                <span className="block truncate text-xs text-muted">
                  {c.email} · desde {formatDate(c.createdAt)}
                </span>
              </span>
              <span className="text-right text-sm">
                <b className="text-petrol">{c.orders} pedidos</b>
                <span className="block text-xs text-muted">{brl(c.spent)}</span>
              </span>
              {c.phone && (
                <a href={waLink(c.phone)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${c.name}`} className="grid size-10 place-items-center rounded-xl bg-[#25D366] text-white">
                  <WhatsAppIcon className="size-5" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
