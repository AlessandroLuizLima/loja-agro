import { CalendarCheck, MessageCircle, Search, Store, Truck } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { PixIcon, WhatsAppIcon } from "@/components/icons";
import { ProductGrid } from "@/components/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { daysSummary } from "@/lib/dates";
import { brl } from "@/lib/format";
import { listCategories, listProducts } from "@/lib/server/catalog";
import { listZones } from "@/lib/server/delivery";
import { getSettings, storeInfo } from "@/lib/server/settings";
import { tintClass } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";

const steps = [
  { Icon: Search, title: "Veja o que tem", text: "Preço e estoque atualizados pela loja. Sem precisar mandar mensagem e esperar." },
  { Icon: CalendarCheck, title: "Reserve pelo site", text: "Escolha o dia de retirar na loja ou o dia de entrega da sua região." },
  { Icon: Store, title: "Tudo separado", text: "Quando você chegar, o pedido já está pronto. É só pagar e levar." },
];

export default async function Home() {
  await connection();
  const s = getSettings();
  const store = storeInfo(s);
  const categories = listCategories().filter((c) => c.productCount > 0);
  const offers = listProducts({ onSale: true, limit: 8 });
  const featured = listProducts({ featured: true, limit: 8 });
  const zones = listZones();

  const benefits = [
    s.pickupEnabled && { title: "Retire na loja", text: "Sem frete, no dia que preferir", Icon: Store, tone: "bg-brand-soft text-brand-dark", href: "/ajuda/entregas-e-retirada" },
    zones.length > 0 && { title: "Entrega na roça", text: "Rota fixa na sua região", Icon: Truck, tone: "bg-petrol-soft text-petrol", href: "/ajuda/entregas-e-retirada" },
    store.pixPercent > 0 && { title: `${store.pixPercent}% OFF no Pix`, text: "Pagando pelo site", Icon: PixIcon, tone: "bg-mint text-emerald-700", href: "/ajuda/como-comprar" },
    { title: "Fale no WhatsApp", text: "Atendimento de gente da terra", Icon: MessageCircle, tone: "bg-sun-soft text-amber-700", href: "/ajuda/fale-conosco" },
  ].filter((b) => !!b);

  return (
    <>
      {/* Hero */}
      <section className="container-page py-5">
        <div className="relative grid overflow-hidden rounded-3xl bg-linear-135 from-petrol to-petrol-dark text-white lg:min-h-[420px] lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="relative z-10 px-6 pt-8 pb-2 lg:px-14 lg:py-12">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-sun px-3 py-1.5 text-xs font-bold text-petrol-dark">🌾 {s.tagline}</span>
            <h1 className="mb-3 text-[clamp(1.9rem,6.5vw,3.2rem)] leading-[1.1] font-extrabold">{s.heroTitle}</h1>
            <p className="mb-6 max-w-lg text-base opacity-90 lg:text-lg">{s.heroSubtitle}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={offers.length > 0 ? "/ofertas" : "#categorias"} className="btn btn-primary h-14 px-8 text-lg">
                {offers.length > 0 ? "Ver ofertas" : "Ver produtos"} →
              </Link>
              <a href={waLink(s.whatsapp, `Olá, ${s.storeName}!`)} target="_blank" rel="noopener noreferrer" className="btn h-14 border-2 border-white/40 px-6 text-white hover:bg-white/10">
                <WhatsAppIcon className="size-5" /> WhatsApp
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="relative grid min-h-56 place-items-center lg:min-h-[420px]">
            <div className="absolute size-60 rounded-full bg-brand lg:size-[21rem]" />
            <div className="relative grid grid-cols-2 gap-2 text-[4.5rem] leading-none drop-shadow-[0_10px_18px_rgb(0_0_0/.25)] lg:text-[6.5rem]">
              <span>🐄</span>
              <span>🐔</span>
              <span>🌽</span>
              <span>🐕</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section aria-label="Vantagens" className="container-page grid grid-cols-2 gap-3 pb-6 sm:grid-cols-4">
        {benefits.map(({ title, text, Icon, tone, href }) => (
          <Link key={title} href={href} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card transition hover:shadow-lift lg:p-5">
            <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
              <Icon className="size-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-petrol lg:text-base">{title}</h3>
              <p className="text-xs leading-snug text-muted lg:text-sm">{text}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Categorias */}
      <section id="categorias" className="container-page py-7 lg:py-10">
        <SectionHeading title="Compre por categoria" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((c) => (
            <Link key={c.id} href={`/categoria/${c.slug}`} className="reveal rounded-2xl bg-white px-2 py-4 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className={`mx-auto mb-2.5 grid size-16 place-items-center rounded-full text-3xl ${tintClass(c.tint)}`}>{c.emoji}</div>
              <h3 className="text-sm leading-tight font-semibold text-petrol">{c.name}</h3>
              <small className="text-xs text-muted">{c.productCount} produtos</small>
            </Link>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section aria-labelledby="ofertas-title" className="container-page py-7 lg:py-10">
          <SectionHeading id="ofertas-title" title="Ofertas da semana" subtitle="Preços especiais enquanto durar o estoque" href="/ofertas" linkLabel="Ver todas" />
          <ProductGrid products={offers} store={store} />
        </section>
      )}

      {/* Como funciona */}
      <section aria-labelledby="como-title" className="container-page py-7 lg:py-10">
        <div className="rounded-3xl bg-white p-6 shadow-card lg:p-10">
          <h2 id="como-title" className="mb-1 text-[clamp(1.35rem,4.5vw,1.9rem)] font-bold text-petrol">
            Compre sem esperar resposta no WhatsApp
          </h2>
          <p className="mb-6 text-muted">Do sítio ou da cidade, você resolve tudo pelo celular.</p>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map(({ Icon, title, text }, i) => (
              <li key={title} className="flex gap-4 rounded-2xl bg-cream p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-white">
                  <Icon className="size-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-petrol">
                    {i + 1}. {title}
                  </h3>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="destaques-title" className="container-page py-7 lg:py-10">
          <SectionHeading id="destaques-title" title="Mais procurados" subtitle="O que nossos clientes mais levam" />
          <ProductGrid products={featured} store={store} />
        </section>
      )}

      {/* Entregas */}
      {(zones.length > 0 || s.pickupEnabled) && (
        <section aria-labelledby="entregas-title" className="container-page py-7 lg:py-10">
          <SectionHeading id="entregas-title" title="Retirada e entregas" href="/ajuda/entregas-e-retirada" linkLabel="Detalhes" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.pickupEnabled && (
              <div className="rounded-2xl border-2 border-brand bg-white p-5 shadow-card">
                <p className="mb-1 flex items-center gap-2 font-display font-bold text-petrol">
                  <Store className="size-5 text-brand" /> Retirada na loja
                </p>
                <p className="text-sm text-muted">
                  {s.address}, {s.city}
                </p>
                <p className="mt-3 text-sm">
                  <b>{daysSummary(s.pickupDays)}</b> · grátis
                </p>
              </div>
            )}
            {zones.map((z) => (
              <div key={z.id} className="rounded-2xl bg-white p-5 shadow-card">
                <p className="mb-1 flex items-center gap-2 font-display font-bold text-petrol">
                  <Truck className="size-5 text-brand" /> {z.name}
                </p>
                <p className="text-sm text-muted">{z.areas}</p>
                <p className="mt-3 text-sm">
                  <b>{daysSummary(z.days)}</b> · {z.fee === 0 ? "grátis" : brl(z.fee)}
                  {z.freeAbove != null && z.fee > 0 && <span className="text-emerald-700"> (grátis acima de {brl(z.freeAbove)})</span>}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chamada para o WhatsApp */}
      <section className="container-page py-7 lg:py-10">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-brand px-6 py-8 text-center text-white sm:flex-row sm:text-left lg:p-10">
          <span className="text-6xl" aria-hidden="true">
            🤠
          </span>
          <div className="flex-1">
            <h2 className="text-[clamp(1.3rem,4.5vw,1.8rem)] leading-tight font-extrabold">Não achou o que precisa?</h2>
            <p className="opacity-95">Temos muito mais na loja. Chame a gente no WhatsApp que a gente separa para você.</p>
          </div>
          <a href={waLink(s.whatsapp, `Olá, ${s.storeName}! Estou procurando um produto.`)} target="_blank" rel="noopener noreferrer" className="btn btn-petrol h-13 px-8">
            <WhatsAppIcon className="size-5" /> Chamar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
