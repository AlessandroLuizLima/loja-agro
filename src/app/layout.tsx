import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { StoreShell } from "@/components/store-shell";
import "./globals.css";

// next/font baixa as fontes no build e as serve do próprio domínio (sem request ao Google em produção)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "PetHouse | Tudo para seu pet",
    template: "%s | PetHouse",
  },
  description: "Rações, brinquedos, higiene e acessórios para cães e gatos. Frete grátis acima de R$ 199 e parcelamento em até 6x sem juros.",
  openGraph: {
    siteName: "PetHouse",
    title: "PetHouse | Tudo para seu pet",
    description: "Até 40% OFF em rações, brinquedos e acessórios. 5% OFF extra no Pix.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F4E5F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <StoreShell>{children}</StoreShell>
        </CartProvider>
      </body>
    </html>
  );
}
