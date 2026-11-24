"use client";

import { Flame, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useCart } from "./cart-provider";

type NavCategory = { slug: string; name: string; emoji: string };

/**
 * Cabeçalho da loja. `logo` e `account` chegam prontos do servidor
 * (o de conta dentro de um <Suspense>, porque lê o cookie de sessão).
 */
export function Header({ logo, account, drawerAccount, categories }: { logo: ReactNode; account: ReactNode; drawerAccount: ReactNode; categories: NavCategory[] }) {
  const { count, ready, openDrawer } = useCart();
  const menu = useRef<HTMLDialogElement>(null);
  const close = () => menu.current?.close();

  return (
    <>
      <header className="site-header sticky top-0 z-40 bg-white/90 shadow-[0_2px_12px_rgb(30_50_30/.06)] backdrop-blur-md">
        <div className="container-page flex flex-wrap items-center gap-x-1 gap-y-2.5 py-3 sm:gap-x-2.5 lg:flex-nowrap lg:gap-6 lg:py-4">
          <button type="button" aria-label="Abrir menu" onClick={() => menu.current?.showModal()} className="icon-btn lg:hidden">
            <Menu className="size-6" />
          </button>

          <div className="mr-auto min-w-0 lg:mr-0">{logo}</div>

          <form role="search" action="/busca" className="relative order-last basis-full lg:order-none lg:mx-auto lg:max-w-xl lg:flex-1 lg:basis-auto">
            <label htmlFor="q" className="sr-only">
              Buscar produtos
            </label>
            <input
              id="q"
              name="q"
              type="search"
              required
              minLength={2}
              placeholder="Ração, sal mineral, sementes…"
              className="h-12 w-full rounded-full border-2 border-line bg-cream pr-14 pl-5 outline-none transition focus:border-brand"
            />
            <button type="submit" aria-label="Buscar" className="absolute top-1 right-1 grid size-10 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark">
              <Search className="size-[18px]" strokeWidth={2.6} />
            </button>
          </form>

          {account}

          <button type="button" onClick={openDrawer} className="icon-btn relative" aria-label={`Abrir carrinho com ${count} ${count === 1 ? "item" : "itens"}`}>
            <ShoppingCart className="size-6" />
            {ready && (
              <span key={count} className="absolute top-0.5 right-0 grid h-5 min-w-5 animate-[bump_.3s_ease] place-items-center rounded-full bg-brand px-1 text-[0.7rem] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>

        <nav aria-label="Categorias" className="border-t border-line">
          <ul className="container-page no-scrollbar flex gap-1 overflow-x-auto py-2 lg:justify-center lg:gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="block rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap text-petrol transition hover:bg-petrol-soft hover:text-petrol-dark">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/ofertas" className="flex items-center gap-1 rounded-full bg-brand-soft px-3.5 py-2 text-sm font-bold whitespace-nowrap text-brand-dark">
                <Flame className="size-4" /> Ofertas
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Menu lateral mobile com <dialog> nativo: foco preso, Esc para fechar e backdrop de graça */}
      <dialog
        ref={menu}
        aria-label="Menu"
        onClick={(e) => {
          const el = e.target as HTMLElement;
          if (e.target === e.currentTarget || el.closest("a")) close();
        }}
        className="drawer m-0 h-dvh max-h-none w-[min(84vw,320px)] bg-white p-0 backdrop:bg-petrol-dark/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            {logo}
            <button type="button" aria-label="Fechar menu" onClick={close} className="icon-btn shrink-0">
              <X className="size-6" />
            </button>
          </div>
          {drawerAccount}
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="flex items-center gap-3 border-b border-line px-2 py-3.5 font-semibold text-petrol">
                  <span className="text-xl">{c.emoji}</span>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/ofertas" className="flex items-center gap-3 border-b border-line px-2 py-3.5 font-semibold text-brand-dark">
                <span className="text-xl">🔥</span> Ofertas
              </Link>
            </li>
            <li>
              <Link href="/ajuda/entregas-e-retirada" className="flex items-center gap-3 border-b border-line px-2 py-3.5 font-semibold text-petrol">
                <span className="text-xl">🚚</span> Entregas e retirada
              </Link>
            </li>
            <li>
              <Link href="/ajuda/fale-conosco" className="flex items-center gap-3 px-2 py-3.5 font-semibold text-petrol">
                <span className="text-xl">💬</span> Atendimento
              </Link>
            </li>
          </ul>
        </div>
      </dialog>
    </>
  );
}

/** Placeholder enquanto a sessão é lida (mesmo tamanho do link final, sem salto de layout). */
export function AccountFallback() {
  return (
    <span className="icon-btn gap-2 lg:w-auto lg:px-2.5" aria-hidden="true">
      <User className="size-6" />
      <span className="hidden text-left text-xs leading-tight lg:block">
        Olá!
        <b className="block">Minha conta</b>
      </span>
    </span>
  );
}
