import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CheckoutForm, type CheckoutConfig } from "@/components/checkout/checkout-form";
import { todayISO } from "@/lib/dates";
import { checkoutDates } from "@/lib/server/checkout";
import { listZones } from "@/lib/server/delivery";
import { getSettings } from "@/lib/server/settings";
import { getCurrentUser } from "@/lib/server/users";

export const metadata: Metadata = { title: "Finalizar pedido", robots: { index: false } };

export default async function CheckoutPage() {
  await connection();
  const s = getSettings();
  const today = todayISO();
  const user = await getCurrentUser();

  const config: CheckoutConfig = {
    today,
    pickup: { enabled: s.pickupEnabled, dates: checkoutDates.pickup(s, today), address: `${s.address}, ${s.city} – ${s.state}`, note: s.pickupNote },
    zones: listZones().map((z) => ({ id: z.id, name: z.name, areas: z.areas, fee: z.fee, freeAbove: z.freeAbove, dates: checkoutDates.delivery(z, today) })),
    pix: { enabled: !!s.pixKey, percent: s.pixDiscountPercent },
  };

  return (
    <div className="container-page py-5 lg:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-petrol lg:text-3xl">Finalizar pedido</h1>
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <ShieldCheck className="size-4" /> Sem cadastro de cartão no site
        </p>
      </div>
      <CheckoutForm config={config} user={user ? { name: user.name, email: user.email, phone: user.phone ?? "" } : null} />
    </div>
  );
}
