import { Lock } from "lucide-react";
import Link from "next/link";
import { menuCollections } from "@/lib/catalog";
import { infoPages, STORE } from "@/lib/content";
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "./icons";
import { Logo } from "./logo";

const columns = [
  { title: "Categorias", links: menuCollections().map((c) => ({ label: c.name, href: `/categoria/${c.slug}` })) },
  {
    title: "Institucional",
    links: [
      ...infoPages.filter((p) => p.group === "institucional").map((p) => ({ label: p.title, href: `/ajuda/${p.slug}` })),
      { label: "Minha conta", href: "/conta" },
    ],
  },
  { title: "Políticas", links: infoPages.filter((p) => p.group === "politicas").map((p) => ({ label: p.title, href: `/ajuda/${p.slug}` })) },
];

// Troque pelos perfis reais da loja
const socials = [
  { label: "Instagram", href: "https://instagram.com/", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com/", Icon: FacebookIcon },
  { label: "TikTok", href: "https://tiktok.com/", Icon: TikTokIcon },
  { label: "YouTube", href: "https://youtube.com/", Icon: YouTubeIcon },
];

const payments = ["PIX", "VISA", "MASTER", "ELO", "AMEX", "BOLETO"];

export function Footer() {
  return (
    <footer className="mt-10 bg-petrol-dark pt-9 text-sm text-[#cfe0e5]">
      <div className="container-page grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr] lg:gap-8">
        <div>
          <div className="mb-3">
            <Logo light />
          </div>
          <p className="mb-4 opacity-85">Cuidando de quem cuida da gente desde 2020. Produtos selecionados para cães e gatos.</p>
          <div className="flex gap-2.5">
            {socials.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-brand">
                <Icon className="size-5" />
              </a>
            ))}
          </div>
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
          <p className="opacity-85">
            📱 WhatsApp: {STORE.whatsappLabel}
            <br />
            ✉️ {STORE.email}
            <br />
            🕘 {STORE.hours}
          </p>
          <h4 className="mt-5 mb-2.5 font-display font-semibold text-white">Formas de pagamento</h4>
          <ul className="flex flex-wrap gap-2">
            {payments.map((p) => (
              <li key={p} className={`rounded-lg bg-white px-2.5 py-1.5 font-display text-xs font-bold ${p === "PIX" ? "text-teal-600" : "text-petrol"}`}>
                {p}
              </li>
            ))}
          </ul>
          <h4 className="mt-5 mb-2.5 font-display font-semibold text-white">Segurança</h4>
          <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs">
            <Lock className="size-4" /> Site seguro · SSL
          </span>
        </div>
      </div>

      <p className="container-page mt-8 border-t border-white/10 pt-5 pb-24 text-center text-xs opacity-75 lg:pb-6">
        © 2026 {STORE.legalName} · CNPJ {STORE.cnpj} · {STORE.address}
      </p>
    </footer>
  );
}
