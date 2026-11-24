import { Megaphone } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import type { Category, Settings } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { AccountLink, DrawerAccountLink } from "./account-link";
import { Footer } from "./footer";
import { AccountFallback, Header } from "./header";
import { WhatsAppIcon } from "./icons";
import { Logo } from "./logo";

/** Estrutura comum a todas as páginas da loja. */
export function StoreShell({ settings, categories, children }: { settings: Settings; categories: Category[]; children: ReactNode }) {
  const nav = categories.map((c) => ({ slug: c.slug, name: c.name, emoji: c.emoji }));
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      {settings.announcement && (
        <div role="note" className="flex items-center justify-center gap-2 bg-petrol px-3 py-2 text-center text-xs font-medium text-white sm:text-sm">
          <Megaphone className="hidden size-4 shrink-0 text-sun sm:block" />
          <span>{settings.announcement}</span>
        </div>
      )}
      <Header
        logo={<Logo name={settings.storeName} logoImageId={settings.logoImageId} />}
        categories={nav}
        account={
          <Suspense fallback={<AccountFallback />}>
            <AccountLink />
          </Suspense>
        }
        drawerAccount={
          <Suspense fallback={<div className="mb-3 h-12 rounded-full bg-petrol-soft" />}>
            <DrawerAccountLink />
          </Suspense>
        }
      />
      <main id="conteudo" className="min-h-[60vh]">
        {children}
      </main>
      <Footer settings={settings} categories={categories} />
      <a
        href={waLink(settings.whatsapp, `Olá, ${settings.storeName}! Vim pelo site.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
        className="fixed right-4 bottom-4 z-30 grid size-15 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_22px_rgb(37_211_102/.45)] transition hover:scale-110 print:hidden"
      >
        <WhatsAppIcon className="size-8" />
      </a>
    </>
  );
}
