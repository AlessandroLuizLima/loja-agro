import { STATUS_LABEL, type OrderStatus } from "@/lib/server/orders";

const tone: Record<OrderStatus, string> = {
  aguardando_pagamento: "bg-sun-soft text-amber-800",
  pago: "bg-emerald-50 text-emerald-800",
  enviado: "bg-petrol-soft text-petrol",
  entregue: "bg-emerald-100 text-emerald-900",
  cancelado: "bg-red-50 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[status]}`}>{STATUS_LABEL[status]}</span>;
}
