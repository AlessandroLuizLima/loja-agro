import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { connection } from "next/server";
import { getSettings, siteUrl } from "@/lib/server/settings";
import { imageUrl, type Settings } from "@/lib/types";
import "./globals.css";

/**
 * Todas as páginas leem o banco da loja (produtos, preços, estoque, nome e cores):
 * connection() faz cada página ser montada no acesso, sempre com o dado atual.
 */

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

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const s = getSettings();
  let base: URL | undefined;
  try {
    base = new URL(siteUrl(s));
  } catch {
    base = undefined;
  }
  return {
    metadataBase: base,
    title: { default: `${s.storeName} | ${s.tagline}`, template: `%s | ${s.storeName}` },
    description: s.heroSubtitle,
    icons: { icon: imageUrl(s.logoImageId) ?? "/icone.svg" },
    openGraph: { siteName: s.storeName, title: s.storeName, description: s.heroSubtitle, locale: "pt_BR", type: "website" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  await connection();
  return { themeColor: getSettings().colorPetrol };
}

const HEX = /^#[0-9a-f]{6}$/i;

/** Cores escolhidas no painel. Só aceita #rrggbb, então não há como injetar CSS. */
function themeCss(s: Settings) {
  const brand = HEX.test(s.colorBrand) ? s.colorBrand : "#e8862a";
  const petrol = HEX.test(s.colorPetrol) ? s.colorPetrol : "#2f5d2b";
  return `:root{--color-brand:${brand};--color-petrol:${petrol}}`;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const settings = getSettings();
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <style>{themeCss(settings)}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
