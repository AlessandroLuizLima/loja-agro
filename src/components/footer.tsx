import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { formatPhone } from "@/lib/format";
import type { Category, Settings } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { FacebookIcon, InstagramIcon } from "./icons";
import { Logo } from "./logo";

const institucional = [
  { label: "Quem somos", href: "/ajuda/quem-somos" },
  { label: "Como comprar", href: "/ajuda/como-comprar" },
  { label: "Fale conosco", href: "/ajuda/fale-conosco" },
  { label: "Minha conta", href: "/conta" },
];

const politicas = [
  { label: "Entregas e retirada", href: "/ajuda/entregas-e-retirada" },
  { label: "Trocas e devoluções", href: "/ajuda/trocas-e-devolucoes" },
  { label: "Política de privacidade", href: "/ajuda/politica-de-privacidade" },
  { label: "Termos de uso", href: "/ajuda/termos-de-uso" },
];

export function Footer({ settings: s, categories }: { settings: Settings; categories: Category[] }) {
  const columns = [
    { title: "Categorias", links: categories.map((c) => ({ label: c.name, href: `/categoria/${c.slug}` })) },
    { title: "A loja", links: institucional },
    { title: "Políticas", links: politicas },
  ];
  const socials = [
    s.instagram && { label: "Instagram", href: s.instagram, Icon: InstagramIcon },
    s.facebook && { label: "Facebook", href: s.facebook, Icon: FacebookIcon },
  ].filter((x) => !!x);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.address}, ${s.city} - ${s.state}`)}`;

  return (
    <footer className="mt-10 bg-petrol-dark pt-9 text-sm text-white/80 print:hidden">
      <div className="container-page grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr] lg:gap-8">
        <div>
          <div className="mb-3">
            <Logo name={s.storeName} logoImageId={s.logoImageId} light />
          </div>
          <p className="mb-4">{s.tagline}</p>
          {socials.length > 0 && (
            <div className="flex gap-2.5">
              {socials.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-brand">
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* No celular vira acordeão; no desktop fica sempre aberto (ver .footer-col em globals.css) */}
        {columns.map((col, i) => (
          <details key={col.title} className="footer-col border-b border-white/10 lg:border-0" open={i === 0}>
            <summary className="flex cursor-pointer list-none justify-between py-3.5 font-display font-semibold text-white lg:pointer-events-none lg:pt-0">{col.title}</summary>
            <ul className="space-y-2.5 pb-4">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}

        <div>
          <h4 className="mt-5 mb-2.5 font-display font-semibold text-white lg:mt-0">Atendimento</h4>
          <ul className="space-y-2.5">
            <li>
              <a href={waLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-brand">
                <Phone className="mt-0.5 size-4 shrink-0" /> WhatsApp {formatPhone(s.whatsapp)}
              </a>
            </li>
            {s.email && (
              <li className="flex items-start gap-2 break-all">
                <Mail className="mt-0.5 size-4 shrink-0" /> {s.email}
              </li>
            )}
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" /> {s.hours}
            </li>
            <li>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-brand">
                <MapPin className="mt-0.5 size-4 shrink-0" /> {s.address}, {s.city} – {s.state}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="container-page mt-8 border-t border-white/10 pt-5 pb-24 text-center text-xs opacity-75 lg:pb-6">
        © {new Date().getFullYear()} {s.legalName}
        {s.cnpj && ` · CNPJ ${s.cnpj}`}
      </p>
    </footer>
  );
}
