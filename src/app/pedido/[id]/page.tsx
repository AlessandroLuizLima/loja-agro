import { CheckCircle2, Clock, CreditCard, MapPin, Receipt, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CopyButton } from "@/components/copy-button";
import { PixIcon } from "@/components/icons";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { brl } from "@/lib/format";
import { getOrder } from "@/lib/server/orders";
import { getCurrentUser } from "@/lib/server/users";

export const metadata: Metadata = { title: "Pedido", robots: { index: false } };

export default function OrderPage({ params }: PageProps<"/pedido/[id]">) {
  return (
    <div className="container-page py-6 lg:py-10">
      <Suspense fallback={<div className="h-[500px] animate-pulse rounded-3xl bg-white" />}>
        <OrderView params={params} />
      </Suspense>
    </div>
  );
}

async function OrderView({ params }: { params: PageProps<"/pedido/[id]">["params"] }) {
  const { id } = await params;
  const order = /^[0-9a-f-]{36}$/.test(id) ? getOrder(id) : undefined;
  if (!order) notFound();

  // Pedido de cliente logado só é visível para o próprio cliente. Pedido de visitante: link com ID aleatório (UUID).
  if (order.userId) {
    const user = await getCurrentUser();
    if (user?.id !== order.userId) notFound();
  }

  const { payment, totals, address, customer, shipping } = order;
  const paid = order.status === "pago";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-3xl bg-white p-6 text-center shadow-card sm:p-8">
        {paid ? <CheckCircle2 className="mx-auto mb-3 size-16 text-emerald-600" /> : <Clock className="mx-auto mb-3 size-16 text-brand" />}
        <h1 className="text-2xl font-bold text-petrol sm:text-3xl">{paid ? "Pedido confirmado! 🎉" : "Pedido recebido!"}</h1>
        <p className="mt-1 text-muted">
          Pedido <b className="text-petrol">#{order.number}</b> · enviamos os detalhes para <b>{customer.email}</b>
        </p>
        <div className="mt-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </section>

      {payment.method === "pix" && payment.pixCode && order.status === "aguardando_pagamento" && (
        <section className="rounded-3xl border-2 border-teal-200 bg-white p-6 shadow-card">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-petrol">
            <PixIcon className="size-6 text-teal-600" /> Pague com Pix para confirmar
          </h2>
          <p className="mb-4 text-sm text-muted">Abra o app do seu banco, escolha Pix copia-e-cola e cole o código abaixo. Ele vale por 30 minutos.</p>
          <div className="grid items-center gap-4 sm:grid-cols-[160px_1fr]">
            <FakeQr seed={payment.pixCode} />
            <div className="min-w-0">
              <p className="mb-2 font-display text-2xl font-bold text-petrol">{brl(totals.total)}</p>
              <code className="block max-h-20 overflow-y-auto rounded-xl bg-cream p-3 text-xs break-all">{payment.pixCode}</code>
              <CopyButton text={payment.pixCode} label="Copiar código Pix" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Demonstração: o código é fictício. Na loja real ele vem do gateway de pagamento.</p>
        </section>
      )}

      {payment.method === "boleto" && payment.boletoLine && (
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-petrol">
            <Receipt className="size-6" /> Boleto bancário
          </h2>
          <p className="mb-3 text-sm text-muted">Vence em 3 dias. A compensação pode levar até 2 dias úteis.</p>
          <code className="block rounded-xl bg-cream p-3 text-sm break-all">{payment.boletoLine}</code>
          <CopyButton text={payment.boletoLine.replace(/\D/g, "")} label="Copiar linha digitável" />
        </section>
      )}

      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="mb-3 text-lg font-bold text-petrol">Itens</h2>
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.slug} className="flex items-center gap-3 py-3 text-sm">
              <span className={`grid size-14 shrink-0 place-items-center rounded-xl text-2xl ${i.tint}`}>{i.emoji}</span>
              <Link href={`/produto/${i.slug}`} className="flex-1 hover:text-brand-dark">
                {i.name}
                <span className="block text-xs text-muted">
                  {i.qty} × {brl(i.unitPrice)}
                </span>
              </Link>
              <b>{brl(i.lineTotal)}</b>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <Line label="Subtotal" value={brl(totals.subtotal)} />
          {totals.couponDiscount > 0 && <Line label={`Cupom ${totals.couponCode}`} value={`−${brl(totals.couponDiscount)}`} />}
          <Line label={`Frete (${shipping.name})`} value={totals.shipping === 0 ? "Grátis" : brl(totals.shipping)} />
          {totals.pixDiscount > 0 && <Line label="Desconto Pix" value={`−${brl(totals.pixDiscount)}`} />}
          <div className="flex justify-between pt-2 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-xl font-bold text-petrol">{brl(totals.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 text-sm shadow-card">
          <h2 className="mb-2 flex items-center gap-2 font-bold text-petrol">
            {shipping.id === "retirada" ? <MapPin className="size-5" /> : <Truck className="size-5" />} Entrega
          </h2>
          <p className="font-semibold">{shipping.name}</p>
          <p className="mb-2 text-muted">{shipping.deadline}</p>
          {shipping.id !== "retirada" && (
            <address className="not-italic">
              {customer.name}
              <br />
              {address.street}, {address.number}
              {address.complement && ` – ${address.complement}`}
              <br />
              {address.district} · {address.city}/{address.state}
              <br />
              CEP {address.cep}
            </address>
          )}
        </section>
        <section className="rounded-3xl bg-white p-6 text-sm shadow-card">
          <h2 className="mb-2 flex items-center gap-2 font-bold text-petrol">
            <CreditCard className="size-5" /> Pagamento
          </h2>
          <p className="font-semibold">
            {payment.method === "pix" && "Pix"}
            {payment.method === "boleto" && "Boleto bancário"}
            {payment.method === "cartao" && `${payment.cardBrand} final ${payment.cardLast4}`}
          </p>
          {payment.method === "cartao" && (
            <p className="text-muted">
              {payment.installments}x de {brl(payment.installmentValue)} sem juros
            </p>
          )}
        </section>
      </div>

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

/** QR ilustrativo gerado a partir do código (não é um QR Code real). */
function FakeQr({ seed }: { seed: string }) {
  const size = 21;
  let h = 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 31 + seed.charCodeAt(i % seed.length) + i) >>> 0;
    cells.push((h >> 7) % 2 === 0);
  }
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    for (const [ox, oy] of [[0, 0], [size - 7, 0], [0, size - 7]]) {
      if (inBox(ox, oy)) {
        const dx = x - ox, dy = y - oy;
        return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
      }
    }
    return null;
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto size-40 rounded-xl border-4 border-white bg-white shadow-card" role="img" aria-label="QR Code Pix ilustrativo" shapeRendering="crispEdges">
      {cells.map((on, i) => {
        const x = i % size, y = Math.floor(i / size);
        const f = finder(x, y);
        return (f ?? on) ? <rect key={i} x={x} y={y} width="1" height="1" fill="#1d2b30" /> : null;
      })}
    </svg>
  );
}
