"use client";

import { LayoutDashboard, Package, Percent, Settings, ShoppingBag, Tags, Truck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Início", Icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ShoppingBag, badge: true },
  { href: "/admin/produtos", label: "Produtos", Icon: Package },
  { href: "/admin/categorias", label: "Categorias", Icon: Tags },
  { href: "/admin/entregas", label: "Entregas", Icon: Truck },
  { href: "/admin/cupons", label: "Cupons", Icon: Percent },
  { href: "/admin/clientes", label: "Clientes", Icon: Users },
  { href: "/admin/configuracoes", label: "Configurações", Icon: Settings },
];

/** Menu do painel: barra rolável no celular, coluna lateral no computador. */
export function AdminNav({ newOrders }: { newOrders: number }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  return (
    <nav aria-label="Painel" className="no-scrollbar overflow-x-auto lg:overflow-visible">
      <ul className="flex gap-1 lg:flex-col">
        {items.map(({ href, label, Icon, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap text-white/80 transition hover:bg-white/10 hover:text-white aria-[current=page]:bg-white aria-[current=page]:text-petrol"
            >
              <Icon className="size-[18px] shrink-0" />
              {label}
              {badge && newOrders > 0 && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">{newOrders}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
