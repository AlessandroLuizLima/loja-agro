import { Lock } from "lucide-react";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, PawIcon, TikTokIcon, YouTubeIcon } from "./icons";

const columns = [
  { title: "Categorias", links: ["Cães", "Gatos", "Rações", "Brinquedos", "Higiene", "Acessórios"] },
  { title: "Institucional", links: ["Quem somos", "Clube PetHouse", "Blog", "Fale conosco"] },
  { title: "Políticas", links: ["Trocas e devoluções", "Política de privacidade", "Termos de uso", "Prazos de entrega"] },
];

const socials = [
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "TikTok", Icon: TikTokIcon },
  { label: "YouTube", Icon: YouTubeIcon },
];

const payments = ["PIX", "VISA", "MASTER", "ELO", "AMEX", "BOLETO"];

export function Footer() {
  return (
    <footer className="mt-10 bg-petrol-dark pt-9 text-sm text-[#cfe0e5]">
      <div className="container-page grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr] lg:gap-8">
        <div>
          <Link href="/" className="mb-3 flex items-center gap-1.5 font-display text-2xl font-bold text-white">
            <PawIcon className="size-8 text-brand" />
            Pet<span className="text-brand">House</span>
          </Link>
          <p className="mb-4 opacity-85">Cuidando de quem cuida da gente desde 2020. Produtos selecionados para cães e gatos.</p>
          <div className="flex gap-2.5">
            {socials.map(({ label, Icon }) => (
              <Link key={label} href="#" aria-label={label} className="grid size-11 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-brand">
                <Icon className="size-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* No celular vira acordeão; no desktop fica sempre aberto (ver .footer-col em globals.css) */}
        {columns.map((col, i) => (
          <details key={col.title} className="footer-col border-b border-white/10 lg:border-0" open={i === 0}>
            <summary className="flex cursor-pointer list-none justify-between py-3.5 font-display font-semibold text-white lg:pointer-events-none lg:pt-0">
              {col.title}
            </summary>
            <ul className="space-y-2.5 pb-4">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href="#" className="transition hover:text-brand">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}

        <div>
          <h4 className="mt-5 mb-2.5 font-display font-semibold text-white lg:mt-0">Atendimento</h4>
          <p className="opacity-85">
            📱 WhatsApp: (11) 90000-0000
            <br />
            ✉️ contato@pethouse.com.br
            <br />
            🕘 Seg a Sex, 9h às 18h
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
        © {new Date().getFullYear()} PetHouse Comércio de Produtos Pet LTDA · CNPJ 00.000.000/0001-00 · Loja fictícia para protótipo
      </p>
    </footer>
  );
}
