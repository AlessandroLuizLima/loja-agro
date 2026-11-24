"use client";

import { LayoutDashboard, Package, Percent, Settings, ShieldCheck, ShoppingBag, Tags, Truck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { path: "", label: "Início", Icon: LayoutDashboard },
  { path: "/pedidos", label: "Pedidos", Icon: ShoppingBag, badge: true },
  { path: "/produtos", label: "Produtos", Icon: Package },
  { path: "/categorias", label: "Categorias", Icon: Tags },
  { path: "/entregas", label: "Entregas", Icon: Truck },
  { path: "/cupons", label: "Cupons", Icon: Percent },
  { path: "/clientes", label: "Clientes", Icon: Users },
  { path: "/configuracoes", label: "Configurações", Icon: Settings },
  { path: "/registro", label: "Segurança", Icon: ShieldCheck },
];

/**
 * Menu do painel: barra rolável no celular, coluna lateral no computador.
 * `base` é o endereço do painel (/admin ou o secreto de ADMIN_PATH), vindo do servidor.
 */
export function AdminNav({ newOrders, base }: { newOrders: number; base: string }) {
  const current = usePathname();
  const isActive = (href: string) => (href === base ? current === base : current.startsWith(href));

  return (
    <nav aria-label="Painel" className="no-scrollbar overflow-x-auto lg:overflow-visible">
      <ul className="flex gap-1 lg:flex-col">
        {items.map(({ path, label, Icon, badge }) => {
          const href = `${base}${path}`;
          return (
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
          );
        })}
      </ul>
    </nav>
  );
}
