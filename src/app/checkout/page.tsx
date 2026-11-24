import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCurrentUser } from "@/lib/server/users";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-page py-5 lg:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-petrol lg:text-3xl">Finalizar compra</h1>
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <Lock className="size-4" /> Ambiente 100% seguro
        </p>
      </div>
      <Suspense fallback={<div className="h-[600px] animate-pulse rounded-3xl bg-white" />}>
        <CheckoutLoader />
      </Suspense>
    </div>
  );
}

/** Lê a sessão (se houver) para preencher os dados do cliente. Compra como visitante também é permitida. */
async function CheckoutLoader() {
  const user = await getCurrentUser();
  return <CheckoutForm user={user ? { name: user.name, email: user.email, phone: user.phone ?? "" } : null} />;
}
