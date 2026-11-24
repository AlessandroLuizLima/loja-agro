import { statusLabel, type FulfillmentType, type OrderStatus, type PaymentStatus } from "@/lib/types";

const tone: Record<OrderStatus, string> = {
  novo: "bg-sun-soft text-amber-800",
  confirmado: "bg-sky text-blue-800",
  pronto: "bg-petrol-soft text-petrol",
  em_rota: "bg-brand-soft text-brand-dark",
  concluido: "bg-emerald-100 text-emerald-900",
  cancelado: "bg-red-50 text-red-700",
};

export function OrderStatusBadge({ status, type }: { status: OrderStatus; type: FulfillmentType }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${tone[status]}`}>{statusLabel(status, type)}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return status === "pago" ? (
    <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold whitespace-nowrap text-emerald-800">Pago</span>
  ) : (
    <span className="inline-block rounded-full bg-line/60 px-3 py-1 text-xs font-semibold whitespace-nowrap text-muted">A receber</span>
  );
}
