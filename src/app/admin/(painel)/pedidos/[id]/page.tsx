import { ArrowLeft, Banknote, Phone, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { setOrderStatusAction, setPaymentStatusAction } from "@/app/admin/actions/orders";
import { ConfirmSubmit, PrintButton } from "@/components/admin/client-buttons";
import { Card } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/icons";
import { OrderStatusBadge, PaymentBadge } from "@/components/order-status-badge";
import { ProductImage } from "@/components/product-image";
import { dateLabel, longDate, todayISO } from "@/lib/dates";
import { brl, formatDateTime } from "@/lib/format";
import { getOrder } from "@/lib/server/orders";
import { getSettings } from "@/lib/server/settings";
import { ON_DELIVERY_LABEL, statusLabel, type Order, type OrderStatus } from "@/lib/types";
import { statusMessageForCustomer, waLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Pedido" };

/** Próximo passo sugerido para cada situação do pedido */
function nextStep(o: Order): { status: OrderStatus; label: string } | null {
  const pickup = o.fulfillment.type === "retirada";
  switch (o.status) {
    case "novo":
      return { status: "confirmado", label: "Confirmar pedido" };
    case "confirmado":
      return { status: "pronto", label: pickup ? "Pronto para retirada" : "Marcar como separado" };
    case "pronto":
      return pickup ? { status: "concluido", label: "Cliente retirou" } : { status: "em_rota", label: "Saiu para entrega" };
    case "em_rota":
      return { status: "concluido", label: "Entregue" };
    default:
      return null;
  }
}

export default async function AdminOrderPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  await connection();
  const { id } = await params;
  const order = /^[0-9a-f-]{36}$/.test(id) ? getOrder(id) : undefined;
  if (!order) notFound();
  const s = getSettings();
  const { fulfillment: f, payment, totals, customer } = order;
  const pickup = f.type === "retirada";
  const step = nextStep(order);
  const today = todayISO();
  const message = statusMessageForCustomer(order, s);
  const otherSteps: OrderStatus[] = pickup ? ["novo", "confirmado", "pronto", "concluido"] : ["novo", "confirmado", "pronto", "em_rota", "concluido"];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/pedidos" className="flex items-center gap-1.5 text-sm font-semibold text-petrol hover:underline print:hidden">
          <ArrowLeft className="size-4" /> Pedidos
        </Link>
        <PrintButton />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-petrol">Pedido #{order.number}</h1>
        <OrderStatusBadge status={order.status} type={f.type} />
        <PaymentBadge status={order.paymentStatus} />
        <span className="text-sm text-muted">feito em {formatDateTime(order.createdAt)}</span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card title="Itens para separar">
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3 py-3 text-sm">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-petrol font-display text-lg font-bold text-white">{i.qty}</span>
                  <ProductImage item={i} className="size-12 shrink-0 rounded-xl print:hidden" emojiClassName="text-2xl" />
                  <span className="min-w-0 flex-1">
                    <b className="block font-medium">{i.name}</b>
                    <span className="text-xs text-muted">
                      {i.unit} · {brl(i.unitPrice)} cada
                    </span>
                  </span>
                  <b>{brl(i.lineTotal)}</b>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
              <Line label="Subtotal" value={brl(totals.subtotal)} />
              {totals.couponDiscount > 0 && <Line label={`Cupom ${totals.couponCode}`} value={`−${brl(totals.couponDiscount)}`} />}
              <Line label={pickup ? "Retirada" : "Taxa de entrega"} value={totals.deliveryFee === 0 ? "Grátis" : brl(totals.deliveryFee)} />
              {totals.pixDiscount > 0 && <Line label="Desconto Pix" value={`−${brl(totals.pixDiscount)}`} />}
              <div className="flex justify-between pt-1 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-xl font-bold text-petrol">{brl(totals.total)}</dd>
              </div>
            </dl>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card title={pickup ? "Retirada na loja" : "Entrega"}>
              <p className="flex flex-wrap items-center gap-x-2 font-semibold">
                {pickup ? <Store className="size-4 text-brand" /> : <Truck className="size-4 text-brand" />}
                {dateLabel(f.date, today)} <span className="font-normal text-muted">({longDate(f.date)})</span>
              </p>
              {!pickup && f.address && (
                <address className="mt-2 text-sm not-italic">
                  <b>{f.zoneName}</b>
                  <br />
                  {f.address.street}, {f.address.number} – {f.address.district}
                  {f.address.reference && (
                    <>
                      <br />
                      <span className="text-muted">Ref.: {f.address.reference}</span>
                    </>
                  )}
                </address>
              )}
              {order.notes && <p className="mt-3 rounded-xl bg-sun-soft p-3 text-sm">📝 {order.notes}</p>}
            </Card>
            <Card title="Pagamento">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Banknote className="size-4 shrink-0 text-brand" />
                {payment.method === "pix" ? "Pix pelo site" : `Na ${pickup ? "retirada" : "entrega"}${payment.onDelivery ? ` – ${ON_DELIVERY_LABEL[payment.onDelivery]}` : ""}`}
              </p>
              {payment.changeFor && (
                <p className="mt-1 text-sm text-muted">
                  Troco para {brl(payment.changeFor)} (levar {brl(payment.changeFor - totals.total)})
                </p>
              )}
              <form action={setPaymentStatusAction} className="mt-3 print:hidden">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={order.paymentStatus === "pago" ? "pendente" : "pago"} />
                <button type="submit" className={`btn h-10 w-full px-4 text-sm ${order.paymentStatus === "pago" ? "border-2 border-line text-muted" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                  {order.paymentStatus === "pago" ? "Desfazer: não foi pago" : "Marcar como pago"}
                </button>
              </form>
            </Card>
          </div>
        </div>

        <div className="space-y-5 print:hidden">
          <Card title="Andamento">
            {step ? (
              <form action={setOrderStatusAction}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={step.status} />
                <button type="submit" className="btn btn-primary h-12 w-full">
                  {step.label}
                </button>
              </form>
            ) : (
              <p className="text-sm text-muted">{order.status === "cancelado" ? "Pedido cancelado. Os itens voltaram ao estoque." : "Pedido concluído. 🎉"}</p>
            )}
            {order.status !== "cancelado" && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-medium text-petrol">Mudar para outra etapa ou cancelar</summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {otherSteps
                    .filter((st) => st !== order.status)
                    .map((st) => (
                      <form key={st} action={setOrderStatusAction}>
                        <input type="hidden" name="id" value={order.id} />
                        <input type="hidden" name="status" value={st} />
                        <button type="submit" className="rounded-full border-2 border-line px-3 py-1.5 text-xs font-semibold text-petrol hover:border-brand">
                          {statusLabel(st, f.type)}
                        </button>
                      </form>
                    ))}
                </div>
                <form action={setOrderStatusAction} className="mt-4">
                  <input type="hidden" name="id" value={order.id} />
                  <input type="hidden" name="status" value="cancelado" />
                  <ConfirmSubmit message={`Cancelar o pedido #${order.number}? Os itens voltam para o estoque e não dá para desfazer.`} className="text-sm font-semibold text-red-600 hover:underline">
                    Cancelar pedido
                  </ConfirmSubmit>
                </form>
              </details>
            )}
          </Card>

          <Card title="Cliente">
            <p className="font-semibold">{customer.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Phone className="size-4" /> {customer.phone}
            </p>
            {customer.email && <p className="text-sm break-all text-muted">{customer.email}</p>}
            <a href={waLink(customer.phone, message)} target="_blank" rel="noopener noreferrer" className="btn mt-4 h-11 w-full bg-[#25D366] text-sm text-white hover:bg-[#1ebe5a]">
              <WhatsAppIcon className="size-5" /> Avisar no WhatsApp
            </a>
            <p className="mt-2 rounded-xl bg-cream p-3 text-xs text-muted">“{message}”</p>
          </Card>
        </div>
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
