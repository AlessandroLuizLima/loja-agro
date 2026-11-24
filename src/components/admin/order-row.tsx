import { Store, Truck } from "lucide-react";
import Link from "next/link";
import { dateLabel } from "@/lib/dates";
import { brl } from "@/lib/format";
import type { Order } from "@/lib/types";
import { OrderStatusBadge, PaymentBadge } from "../order-status-badge";

export function OrderRow({ order: o, today }: { order: Order; today: string }) {
  const late = o.fulfillment.date < today && o.status !== "concluido" && o.status !== "cancelado";
  return (
    <li>
      <Link href={`/admin/pedidos/${o.id}`} className="block rounded-xl px-2 py-3 transition hover:bg-cream">
        <span className="flex items-baseline gap-2">
          <span className="font-display font-bold text-petrol">#{o.number}</span>
          <span className="min-w-0 flex-1 truncate font-medium">{o.customer.name}</span>
          <b className="font-display text-petrol">{brl(o.totals.total)}</b>
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className={`flex items-center gap-1.5 text-xs ${late ? "font-semibold text-red-600" : "text-muted"}`}>
            {o.fulfillment.type === "retirada" ? <Store className="size-4 shrink-0" /> : <Truck className="size-4 shrink-0" />}
            {o.fulfillment.type === "retirada" ? "Retirada" : o.fulfillment.zoneName} · {dateLabel(o.fulfillment.date, today)}
            {late && " (atrasado)"}
          </span>
          <span className="ml-auto flex flex-wrap gap-1.5">
            <OrderStatusBadge status={o.status} type={o.fulfillment.type} />
            <PaymentBadge status={o.paymentStatus} />
          </span>
        </span>
      </Link>
    </li>
  );
}
