import { connection } from "next/server";
import { CartProvider } from "@/components/cart-provider";
import { StoreShell } from "@/components/store-shell";
import { listCategories } from "@/lib/server/catalog";
import { getSettings } from "@/lib/server/settings";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <CartProvider>
      <StoreShell settings={getSettings()} categories={listCategories()}>
        {children}
      </StoreShell>
    </CartProvider>
  );
}
