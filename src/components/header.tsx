"use client";

import { Flame, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { navLinks } from "@/lib/products";
import { useCart } from "./cart-provider";
import { PawIcon } from "./icons";

function Logo() {
  return (
    <Link href="/" aria-label="PetHouse - página inicial" className="flex items-center gap-1.5 font-display text-2xl font-bold text-petrol lg:text-[1.7rem]">
      <PawIcon className="size-8 text-brand" />
      Pet<span className="text-brand">House</span>
    </Link>
  );
}

export function Header() {
  const { count } = useCart();
  const drawer = useRef<HTMLDialogElement>(null);
  const close = () => drawer.current?.close();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 shadow-[0_2px_12px_rgb(31_78_95/.06)] backdrop-blur-md">
        <div className="container-page flex flex-wrap items-center gap-2.5 py-3 lg:flex-nowrap lg:gap-6 lg:py-4">
          <button type="button" aria-label="Abrir menu" onClick={() => drawer.current?.showModal()} className="icon-btn lg:hidden">
            <Menu className="size-6" />
          </button>

          <div className="mr-auto lg:mr-0">
            <Logo />
          </div>

          <form role="search" action="/busca" className="relative order-last basis-full lg:order-none lg:mx-auto lg:max-w-xl lg:flex-1 lg:basis-auto">
            <label htmlFor="q" className="sr-only">Buscar produtos</label>
            <input
              id="q"
              name="q"
              type="search"
              placeholder="O que seu pet precisa hoje?"
              className="h-12 w-full rounded-full border-2 border-line bg-cream pr-14 pl-5 outline-none transition focus:border-brand"
            />
            <button type="submit" aria-label="Buscar" className="absolute top-1 right-1 grid size-10 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark">
              <Search className="size-[18px]" strokeWidth={2.6} />
            </button>
          </form>

          <Link href="#" className="icon-btn gap-2 lg:w-auto lg:px-2.5" aria-label="Minha conta">
            <User className="size-6" />
            <span className="hidden text-left text-xs leading-tight text-petrol lg:block">
              Olá, visitante
              <b className="block">Entrar / Cadastrar</b>
            </span>
          </Link>

          <Link href="#" className="icon-btn relative" aria-label={`Carrinho com ${count} itens`}>
            <ShoppingCart className="size-6" />
            <span
              key={count}
              className="absolute top-0.5 right-0 grid h-5 min-w-5 animate-[bump_.3s_ease] place-items-center rounded-full bg-brand px-1 text-[0.7rem] font-bold text-white"
            >
              {count}
            </span>
          </Link>
        </div>

        <nav aria-label="Categorias" className="border-t border-line">
          <ul className="container-page no-scrollbar flex gap-1 overflow-x-auto py-2 lg:justify-center lg:gap-2">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link href="#" className="block rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap text-petrol transition hover:bg-petrol-soft">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="#ofertas" className="flex items-center gap-1 rounded-full bg-brand-soft px-3.5 py-2 text-sm font-bold whitespace-nowrap text-brand-dark">
                <Flame className="size-4" /> Promoções
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Menu lateral mobile com <dialog> nativo: foco preso, Esc para fechar e backdrop de graça */}
      <dialog
        ref={drawer}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="drawer m-0 h-dvh max-h-none w-[min(84vw,320px)] bg-white p-0 backdrop:bg-petrol-dark/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-4 flex items-center justify-between">
            <Logo />
            <button type="button" aria-label="Fechar menu" onClick={close} className="icon-btn">
              <X className="size-6" />
            </button>
          </div>
          <Link href="#" onClick={close} className="btn btn-petrol mb-3 h-12 w-full">
            <User className="size-5" /> Entrar / Cadastrar
          </Link>
          <ul>
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link href="#" onClick={close} className="flex items-center gap-3 border-b border-line px-2 py-3.5 font-semibold text-petrol">
                  <span className="text-xl">{l.emoji}</span>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="#ofertas" onClick={close} className="flex items-center gap-3 px-2 py-3.5 font-semibold text-brand-dark">
                <span className="text-xl">🔥</span> Promoções
              </Link>
            </li>
          </ul>
        </div>
      </dialog>
    </>
  );
}
