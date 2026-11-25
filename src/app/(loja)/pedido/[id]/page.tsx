import { Banknote, CalendarDays, CheckCircle2, MapPin, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import QRCode from "qrcode";
import { CopyButton } from "@/components/copy-button";
import { PixIcon, WhatsAppIcon } from "@/components/icons";
import { OrderStatusBadge, PaymentBadge } from "@/components/order-status-badge";
import { ProductImage } from "@/components/product-image";
import { longDate } from "@/lib/dates";
import { brl } from "@/lib/format";
import { pixPayload } from "@/lib/pix";
import { getOrder } from "@/lib/server/orders";
import { getSettings } from "@/lib/server/settings";
import { getCurrentUser } from "@/lib/server/users";
import { ON_DELIVERY_LABEL } from "@/lib/types";
import { orderMessageForStore, waLink } from "@/lib/whatsapp";
import { ReorderButton } from "@/components/reorder-button";

export const metadata: Metadata = { title: "Pedido", robots: { index: false } };

export default async function OrderPage({ params }: PageProps<"/pedido/[id]">) {
  await connection();
  const { id } = await params;
  const order = /^[0-9a-f-]{36}$/.test(id) ? getOrder(id) : undefined;
  if (!order) notFound();

  // Pedido de cliente logado só aparece para o próprio cliente (ou para o lojista).
  // Pedido sem cadastro: o link tem um código aleatório impossível de adivinhar.
  if (order.userId) {
    const user = await getCurrentUser();
    if (user?.id !== order.userId && user?.role !== "admin") notFound();
  }

  const s = getSettings();
  const { totals, fulfillment, payment } = order;
  const pickup = fulfillment.type === "retirada";
  const showPix = payment.method === "pix" && order.paymentStatus === "pendente" && order.status !== "cancelado" && !!s.pixKey;
  const pixCode = showPix ? pixPayload({ key: s.pixKey, name: s.pixName || s.storeName, city: s.city, amount: totals.total, txid: `PED${order.number}` }) : "";
  const qrSvg = showPix ? await QRCode.toString(pixCode, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#1f2a22", light: "#ffffff" } }) : "";

  return (
    <div className="container-page py-6 lg:py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-3xl bg-white p-6 text-center shadow-card sm:p-8">
          <CheckCircle2 className="mx-auto mb-3 size-16 text-emerald-600" />
          <h1 className="text-2xl font-bold text-petrol sm:text-3xl">{order.status === "cancelado" ? "Pedido cancelado" : pickup ? "Pedido reservado! 🎉" : "Pedido recebido! 🎉"}</h1>
          <p className="mt-1 text-muted">
            Pedido <b className="text-petrol">#{order.number}</b> · {order.customer.name}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <OrderStatusBadge status={order.status} type={fulfillment.type} />
            <PaymentBadge status={order.paymentStatus} />
          </div>
          {order.status !== "cancelado" && (
            <div className="mx-auto mt-5 max-w-md">
              <a href={waLink(s.whatsapp, orderMessageForStore(order))} target="_blank" rel="noopener noreferrer" className="btn h-13 w-full bg-[#25D366] text-base text-white hover:bg-[#1ebe5a]">
                <WhatsAppIcon className="size-5" /> Avisar a loja no WhatsApp
              </a>
              <p className="mt-2 text-xs text-muted">Opcional: a loja já recebeu seu pedido. A mensagem vem pronta, é só enviar.</p>
            </div>
          )}
        </section>

        {showPix && (
          <section className="rounded-3xl border-2 border-teal-200 bg-white p-6 shadow-card">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-petrol">
              <PixIcon className="size-6 text-teal-600" /> Pague com Pix
            </h2>
            <p className="mb-4 text-sm text-muted">Abra o app do seu banco, escolha Pix &gt; Ler QR Code ou Pix Copia e Cola. O valor já vem preenchido.</p>
            <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
              <div className="mx-auto size-44 overflow-hidden rounded-xl border border-line [&_svg]:size-full" role="img" aria-label="QR Code do Pix" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              <div className="min-w-0">
                <p className="mb-2 font-display text-2xl font-bold text-petrol">{brl(totals.total)}</p>
                <code className="block max-h-20 overflow-y-auto rounded-xl bg-cream p-3 text-xs break-all">{pixCode}</code>
                <CopyButton text={pixCode} label="Copiar código Pix" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">
              Recebedor: <b>{s.pixName || s.storeName}</b>. A loja confirma o pagamento e atualiza o pedido.
            </p>
          </section>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 text-sm shadow-card">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-petrol">
              {pickup ? <Store className="size-5" /> : <Truck className="size-5" />} {pickup ? "Retirada na loja" : "Entrega"}
            </h2>
            <p className="flex items-center gap-2 font-semibold">
              <CalendarDays className="size-4 text-brand" /> {longDate(fulfillment.date)}
            </p>
            {pickup ? (
              <p className="mt-2 flex gap-2 text-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {s.address}, {s.city} – {s.state}
                  <br />
                  {s.hours}
                </span>
              </p>
            ) : (
              fulfillment.address && (
                <address className="mt-2 text-muted not-italic">
                  {fulfillment.zoneName}
                  <br />
                  {fulfillment.address.street}, {fulfillment.address.number} – {fulfillment.address.district}
                  {fulfillment.address.reference && (
                    <>
                      <br />
                      Ref.: {fulfillment.address.reference}
                    </>
                  )}
                </address>
              )
            )}
          </section>
          <section className="rounded-3xl bg-white p-6 text-sm shadow-card">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-petrol">
              <Banknote className="size-5" /> Pagamento
            </h2>
            {payment.method === "pix" ? (
              <p className="font-semibold">Pix pelo site</p>
            ) : (
              <>
                <p className="font-semibold">Na {pickup ? "retirada" : "entrega"}</p>
                {payment.onDelivery && <p className="text-muted">{ON_DELIVERY_LABEL[payment.onDelivery]}</p>}
                {payment.changeFor && <p className="text-muted">Troco para {brl(payment.changeFor)}</p>}
              </>
            )}
            {order.notes && <p className="mt-3 rounded-xl bg-cream p-3 text-muted">Obs.: {order.notes}</p>}
          </section>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="mb-3 text-lg font-bold text-petrol">Itens</h2>
          <ul className="divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.slug} className="flex items-center gap-3 py-3 text-sm">
                <ProductImage item={i} className="size-14 shrink-0 rounded-xl" emojiClassName="text-2xl" />
                <span className="flex-1">
                  {i.name}
                  <span className="block text-xs text-muted">
                    {i.qty} × {brl(i.unitPrice)} · {i.unit}
                  </span>
                </span>
                <b>{brl(i.lineTotal)}</b>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            <Line label="Subtotal" value={brl(totals.subtotal)} />
            {totals.couponDiscount > 0 && <Line label={`Cupom ${totals.couponCode}`} value={`−${brl(totals.couponDiscount)}`} />}
            <Line label={pickup ? "Retirada" : "Entrega"} value={totals.deliveryFee === 0 ? "Grátis" : brl(totals.deliveryFee)} />
            {totals.pixDiscount > 0 && <Line label="Desconto Pix" value={`−${brl(totals.pixDiscount)}`} />}
            <div className="flex justify-between pt-2 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-xl font-bold text-petrol">{brl(totals.total)}</dd>
            </div>
          </dl>
        </section>

        {(order.status === "concluido" || order.status === "cancelado") && <ReorderButton orderId={order.id} className="mx-auto w-full max-w-xs" />}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn btn-primary">
            Continuar comprando
          </Link>
          {order.userId && (
            <Link href="/conta" className="btn border-2 border-line bg-white text-petrol">
              Ver meus pedidos
            </Link>
          )}
        </div>
        <p className="text-center text-xs text-muted">Guarde este link para acompanhar o pedido.</p>
      </div>
    </div>
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
