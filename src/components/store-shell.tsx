import { CreditCard, Truck } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { STORE } from "@/lib/content";
import { AccountLink, DrawerAccountLink } from "./account-link";
import { Footer } from "./footer";
import { AccountFallback, Header } from "./header";
import { WhatsAppIcon } from "./icons";

export function AnnouncementBar() {
  return (
    <div role="note" className="flex items-center justify-center gap-1.5 bg-petrol px-3 py-2 text-center text-[11px] font-medium whitespace-nowrap text-white sm:gap-2 sm:text-sm">
      <Truck className="hidden size-4 sm:block" />
      <span>
        <b className="text-sun">Frete grátis</b> acima de R$ 199
      </span>
      <span aria-hidden="true" className="opacity-50">
        |
      </span>
      <CreditCard className="hidden size-4 sm:block" />
      <span>
        Parcele em até <b className="text-sun">6x sem juros</b>
      </span>
    </div>
  );
}

/** Estrutura comum a todas as páginas da loja. */
export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <AnnouncementBar />
      <Header
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
      <Footer />
      <a
        href={`https://wa.me/${STORE.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
        className="fixed right-4 bottom-4 z-30 grid size-15 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_22px_rgb(37_211_102/.45)] transition hover:scale-110"
      >
        <WhatsAppIcon className="size-8" />
      </a>
    </>
  );
}
