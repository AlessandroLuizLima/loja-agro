import { AlertTriangle, ArrowRight, CalendarDays, Package, ShoppingBag, Wallet } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { OrderRow } from "@/components/admin/order-row";
import { Card, PageHeader } from "@/components/admin/ui";
import { addDays, todayISO } from "@/lib/dates";
import { brl } from "@/lib/format";
import { lowStockProducts } from "@/lib/server/catalog";
import { listOrders, salesSummary } from "@/lib/server/orders";
import { getSettings } from "@/lib/server/settings";
import { adminUrl } from "@/lib/admin-path";

export default async function Dashboard() {
  await connection();
  const settings = getSettings();
  const open = listOrders("abertos");
  const today = todayISO();
  const forToday = open.filter((o) => o.fulfillment.date <= today);
  const tomorrow = open.filter((o) => o.fulfillment.date === addDays(today, 1));
  const sales = salesSummary();
  const lowStock = lowStockProducts(5);
  const setupMissing = [!settings.pixKey && "chave Pix", settings.whatsapp === "5511900000000" && "WhatsApp da loja", !settings.logoImageId && "logo"].filter(Boolean);

  const stats = [
    { label: "Pedidos novos", value: open.filter((o) => o.status === "novo").length, Icon: ShoppingBag, tone: "bg-brand-soft text-brand-dark" },
    { label: "Para hoje", value: forToday.length, Icon: CalendarDays, tone: "bg-petrol-soft text-petrol" },
    { label: "Vendas (7 dias)", value: brl(sales.week.revenue), Icon: Wallet, tone: "bg-mint text-emerald-700" },
    { label: "Estoque baixo", value: lowStock.length, Icon: Package, tone: "bg-sun-soft text-amber-700" },
  ];

  return (
    <>
      <PageHeader title="Início" subtitle={`Resumo da ${settings.storeName}`} />

      {setupMissing.length > 0 && (
        <Link href={adminUrl("/configuracoes")} className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-sun bg-sun-soft p-4 text-sm">
          <AlertTriangle className="size-5 shrink-0 text-amber-700" />
          <span className="flex-1">
            Falta configurar: <b>{setupMissing.join(", ")}</b>.
          </span>
          <ArrowRight className="size-4" />
        </Link>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-bold text-petrol">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Para separar hoje" description={forToday.length === 0 ? "Nenhum pedido para hoje." : "Pedidos de hoje (e atrasados) ainda em aberto."}>
          {forToday.length > 0 && (
            <ul className="-mx-2 divide-y divide-line">
              {forToday.map((o) => (
                <OrderRow key={o.id} order={o} today={today} />
              ))}
            </ul>
          )}
          {tomorrow.length > 0 && (
            <>
              <h3 className="mt-5 mb-1 text-sm font-semibold text-petrol">Amanhã</h3>
              <ul className="-mx-2 divide-y divide-line">
                {tomorrow.map((o) => (
                  <OrderRow key={o.id} order={o} today={today} />
                ))}
              </ul>
            </>
          )}
          <Link href={adminUrl("/pedidos")} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark hover:underline">
            Ver todos os pedidos <ArrowRight className="size-4" />
          </Link>
        </Card>

        <div className="space-y-5">
          <Card title="Vendas" description="Pedidos não cancelados.">
            <dl className="space-y-2 text-sm">
              {(
                [
                  ["Últimas 24 horas", sales.today],
                  ["Últimos 7 dias", sales.week],
                  ["Últimos 30 dias", sales.month],
                ] as const
              ).map(([label, s]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-muted">{label}</dt>
                  <dd>
                    <b className="text-petrol">{brl(s.revenue)}</b> <span className="text-muted">· {s.orders} pedidos</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Estoque baixo" description={lowStock.length === 0 ? "Tudo certo por aqui." : "Produtos com 5 unidades ou menos."}>
            <ul className="space-y-2 text-sm">
              {lowStock.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link href={adminUrl(`/produtos/${p.id}`)} className="flex justify-between gap-3 hover:text-brand-dark">
                    <span className="truncate">{p.name}</span>
                    <b className={p.stock === 0 ? "text-red-600" : "text-brand-dark"}>{p.stock}</b>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
