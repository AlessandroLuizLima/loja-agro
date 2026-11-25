import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { signOut } from "@/app/(loja)/conta/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { adminUrl } from "@/lib/admin-path";
import { NewOrderAlert } from "@/components/admin/new-order-alert";
import { countOrdersByStatus, latestOrder } from "@/lib/server/orders";
import { runRetentionIfDue } from "@/lib/server/privacy";
import { getSettings } from "@/lib/server/settings";
import { requireAdmin } from "@/lib/server/users";

export const metadata: Metadata = { title: { default: "Painel", template: "%s | Painel" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await connection();
  const admin = await requireAdmin();
  const settings = getSettings();
  // LGPD: remove os dados pessoais de pedidos antigos (no máximo a cada 6 horas)
  runRetentionIfDue(settings.retentionMonths);
  const newOrders = countOrdersByStatus().novo ?? 0;

  return (
    <div className="min-h-dvh bg-[#f5f3ee] lg:grid lg:grid-cols-[240px_minmax(0,1fr)] print:block print:bg-white">
      <aside className="sticky top-0 z-30 bg-petrol-dark text-white lg:h-dvh lg:overflow-y-auto print:hidden">
        <div className="flex items-center justify-between gap-3 px-4 pt-3 lg:block lg:px-4 lg:pt-6">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">{settings.storeName}</p>
            <p className="text-xs text-white/60">Painel da loja</p>
          </div>
          <div className="flex shrink-0 gap-1 lg:mt-4">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10" aria-label="Ver a loja (abre em nova aba)">
              <ExternalLink className="size-4" /> <span className="hidden sm:inline">Ver loja</span>
            </Link>
            <form action={signOut}>
              <button type="submit" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10" aria-label="Sair do painel">
                <LogOut className="size-4" /> <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
        <div className="px-2 py-2 lg:mt-4 lg:px-3">
          <AdminNav newOrders={newOrders} base={adminUrl()} />
        </div>
        <div className="px-2 pb-2 lg:mt-2 lg:px-3">
          <NewOrderAlert base={adminUrl()} initialLatest={latestOrder()?.number ?? 0} />
        </div>
        <p className="hidden px-4 pt-6 pb-4 text-xs text-white/50 lg:block">Logado como {admin.email}</p>
      </aside>
      <main className="mx-auto w-full max-w-6xl min-w-0 p-4 pb-16 lg:p-8">{children}</main>
    </div>
  );
}
