import type { Metadata } from "next";
import { connection } from "next/server";
import { deleteCouponAction, toggleCouponAction } from "@/app/admin/actions/store";
import { ConfirmSubmit } from "@/components/admin/client-buttons";
import { CouponForm } from "@/components/admin/store-forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { brl } from "@/lib/format";
import { listCoupons } from "@/lib/server/coupons";

export const metadata: Metadata = { title: "Cupons" };

export default async function CouponsPage() {
  await connection();
  const coupons = listCoupons();
  return (
    <>
      <PageHeader title="Cupons de desconto" subtitle="Divulgue no Instagram, no grupo do WhatsApp ou no balcão." />
      <Card title="Novo cupom" className="mb-5">
        <CouponForm />
      </Card>
      {coupons.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl bg-white shadow-card">
          {coupons.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className={`rounded-lg border-2 border-dashed px-3 py-1 font-display font-bold tracking-wider ${c.active ? "border-brand text-brand-dark" : "border-line text-muted line-through"}`}>{c.code}</span>
              <span className="flex-1 text-sm">
                <b>{c.percent}% OFF</b>
                <span className="text-muted">
                  {c.minSubtotal > 0 ? ` · compras a partir de ${brl(c.minSubtotal)}` : " · sem valor mínimo"} · usado {c.uses}×
                </span>
              </span>
              <form action={toggleCouponAction}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="active" value={c.active ? "0" : "1"} />
                <button type="submit" className="rounded-full border-2 border-line px-3 py-1.5 text-xs font-semibold text-petrol hover:border-brand">
                  {c.active ? "Pausar" : "Reativar"}
                </button>
              </form>
              <form action={deleteCouponAction}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmSubmit message={`Apagar o cupom ${c.code}?`} className="text-xs font-semibold text-red-600 hover:underline">
                  Apagar
                </ConfirmSubmit>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
