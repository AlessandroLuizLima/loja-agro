import type { Metadata } from "next";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CartPageView } from "@/components/cart-page-view";
import { getSettings, storeInfo } from "@/lib/server/settings";

export const metadata: Metadata = { title: "Carrinho", robots: { index: false } };

export default async function CartPage() {
  await connection();
  return (
    <div className="container-page py-5 lg:py-8">
      <Breadcrumbs items={[{ label: "Carrinho" }]} />
      <h1 className="mb-5 text-2xl font-bold text-petrol lg:text-3xl">Meu carrinho</h1>
      <CartPageView pixPercent={storeInfo(getSettings()).pixPercent} />
    </div>
  );
}
