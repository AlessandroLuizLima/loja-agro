import { ArrowRight, CalendarCheck, CircleCheck, MessageCircle, PackageCheck, Search, Store, Truck } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import type { CSSProperties } from "react";
import { PixIcon, WhatsAppIcon } from "@/components/icons";
import { stockText } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { ProductImage } from "@/components/product-image";
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
  { Icon: CalendarCheck, title: "Reserve pelo site", text: "Escolha o dia de retirar na loja ou de receber na sua casa." },
  { Icon: Store, title: "Tudo separado", text: "O pedido fica pronto para você retirar ou chega na sua porta." },
];

/** Atraso da animação de entrada (classe .enter), para os elementos surgirem em cascata. */
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default async function Home() {
  await connection();
  const s = getSettings();
  const store = storeInfo(s);
  const categories = listCategories().filter((c) => c.productCount > 0);
  const offers = listProducts({ onSale: true, limit: 8 });
  const featured = listProducts({ featured: true, limit: 8 });
  const zones = listZones();

  const spotlight = featured[0] ?? offers[0];
  const spotStock = spotlight && stockText(spotlight);
  const trust = ["Estoque atualizado pela loja", s.pickupEnabled && "Retirada sem frete", zones.length > 0 && "Entrega na sua casa"].filter((t): t is string => !!t);

  const benefits = [
    s.pickupEnabled && { title: "Retire na loja", text: "Sem frete, no dia que preferir", Icon: Store, tone: "bg-brand-soft text-brand-dark", href: "/ajuda/entregas-e-retirada" },
    zones.length > 0 && { title: "Entrega na sua casa", text: "No dia de entrega do seu bairro", Icon: Truck, tone: "bg-petrol-soft text-petrol", href: "/ajuda/entregas-e-retirada" },
    store.pixPercent > 0 && { title: `${store.pixPercent}% OFF no Pix`, text: "Pagando pelo site", Icon: PixIcon, tone: "bg-mint text-emerald-700", href: "/ajuda/como-comprar" },
    { title: "Fale no WhatsApp", text: "Atendimento de gente da terra", Icon: MessageCircle, tone: "bg-sun-soft text-amber-700", href: "/ajuda/fale-conosco" },
  ].filter((b) => !!b);

  return (
    <>
      {/* Hero */}
      <section className="container-page py-5">
        <div className="relative isolate grid overflow-hidden rounded-[2rem] bg-linear-135 from-petrol to-petrol-dark text-white lg:min-h-[460px] lg:grid-cols-[1.15fr_1fr] lg:items-center">
          {/* Fundo decorativo */}
          <div aria-hidden="true" className="dots absolute inset-0 -z-10 opacity-60" />
          <div aria-hidden="true" className="drift absolute -top-24 -left-20 -z-10 size-80 rounded-full bg-brand/25 blur-3xl" />
          <div aria-hidden="true" className="drift absolute -right-10 -bottom-32 -z-10 size-96 rounded-full bg-sun/15 blur-3xl [animation-delay:-7s]" />

          <div className="relative z-10 px-6 pt-9 pb-4 lg:px-14 lg:py-14">
            <span className="enter mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold ring-1 ring-white/20 backdrop-blur">
              <span className="size-2 rounded-full bg-sun" /> {s.tagline}
            </span>
            <h1 className="enter mb-4 text-[clamp(2rem,6.5vw,3.4rem)] leading-[1.05] font-extrabold tracking-tight" style={delay(80)}>
              {s.heroTitle}
            </h1>
            <p className="enter mb-7 max-w-lg text-base text-white/85 lg:text-lg" style={delay(160)}>
              {s.heroSubtitle}
            </p>
            <div className="enter flex flex-wrap items-center gap-3" style={delay(240)}>
              <Link href={offers.length > 0 ? "/ofertas" : "#categorias"} className="btn btn-primary group h-14 px-8 text-lg">
                {offers.length > 0 ? "Ver ofertas" : "Ver produtos"} <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </Link>
              <a href={waLink(s.whatsapp, `Olá, ${s.storeName}!`)} target="_blank" rel="noopener noreferrer" className="btn h-14 border-2 border-white/30 px-6 text-white hover:border-white/60 hover:bg-white/10">
                <WhatsAppIcon className="size-5" /> WhatsApp
              </a>
            </div>
            <ul className="enter mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80" style={delay(320)}>
              {trust.map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CircleCheck className="size-4 text-sun" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Vitrine: um produto de verdade, com o preço e o estoque atuais */}
          <div className="relative grid min-h-80 place-items-center px-6 pt-4 pb-14 lg:min-h-[460px] lg:pb-4">
            {spotlight ? (
              <>
                <Link
                  href={`/produto/${spotlight.slug}`}
                  className="enter relative z-10 w-full max-w-[17rem] rounded-3xl bg-white p-3 text-ink shadow-[0_30px_60px_-15px_rgb(0_0_0/.45)] transition duration-300 hover:-translate-y-1 hover:rotate-0 lg:max-w-[19rem] lg:-rotate-2"
                  style={delay(200)}
                >
                  <ProductImage item={spotlight} eager className="aspect-[4/3] rounded-2xl" emojiClassName="text-8xl" />
                  <div className="px-1.5 pt-3 pb-1">
                    <p className="line-clamp-1 text-sm font-semibold">{spotlight.name}</p>
                    <p className="text-xs text-muted">{spotlight.unit}</p>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p className="font-display text-2xl font-bold text-petrol">{spotlight.saleMode === "consulta" ? "Consulte" : brl(spotlight.price)}</p>
                      <span className={`flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-[0.7rem] font-semibold ${spotStock.tone}`}>
                        <span className="size-1.5 rounded-full bg-current" /> {spotStock.text}
                      </span>
                    </div>
                  </div>
                </Link>
                <div aria-hidden="true" className="float absolute top-6 right-3 z-20 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-petrol shadow-lift lg:top-16 lg:right-8">
                  <span className="grid size-8 place-items-center rounded-xl bg-mint text-emerald-700">
                    <PackageCheck className="size-4" />
                  </span>
                  Estoque na hora
                </div>
                {zones.length > 0 && (
                  <div aria-hidden="true" className="float absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-petrol shadow-lift lg:top-32 lg:bottom-auto lg:left-0" style={delay(-2500)}>
                    <span className="grid size-8 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                      <Truck className="size-4" />
                    </span>
                    Entrega na sua casa
                  </div>
                )}
              </>
            ) : (
              <div aria-hidden="true" className="float grid grid-cols-2 gap-2 text-[4.5rem] leading-none lg:text-[6.5rem]">
                <span>🐄</span>
                <span>🐔</span>
                <span>🌽</span>
                <span>🐕</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section aria-label="Vantagens" className="container-page grid grid-cols-2 gap-3 pb-6 lg:grid-cols-4">
        {benefits.map(({ title, text, Icon, tone, href }, i) => (
          <Link
            key={title}
            href={href}
            className="enter group flex flex-col items-start gap-2.5 rounded-2xl bg-white p-4 shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-1 hover:shadow-lift lg:flex-row lg:items-center lg:gap-3 lg:p-5"
            style={delay(380 + i * 70)}
          >
            <div className={`grid size-12 shrink-0 place-items-center rounded-2xl transition duration-300 group-hover:scale-110 group-hover:-rotate-6 ${tone}`}>
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
            <Link
              key={c.id}
              href={`/categoria/${c.slug}`}
              className="reveal group rounded-2xl bg-white px-2 py-4 text-center shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand/40"
            >
              <div className={`mx-auto mb-2.5 grid size-16 place-items-center rounded-full text-3xl transition duration-300 group-hover:scale-110 ${tintClass(c.tint)}`}>{c.emoji}</div>
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
        <div className="reveal rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line/70 lg:p-12">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-dark uppercase">Como funciona</p>
            <h2 id="como-title" className="mb-2 text-[clamp(1.45rem,4.5vw,2.1rem)] leading-tight font-bold tracking-tight text-petrol">
              Compre sem esperar resposta no WhatsApp
            </h2>
            <p className="text-muted">Sem sair de casa, você resolve tudo pelo celular.</p>
          </div>
          <ol className="relative grid gap-6 sm:grid-cols-3 sm:gap-8">
            <span aria-hidden="true" className="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-line sm:block" />
            {steps.map(({ Icon, title, text }, i) => (
              <li key={title} className="relative flex gap-4 sm:flex-col sm:items-center sm:text-center">
                <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-glow">
                  <Icon className="size-6" />
                  <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-petrol text-xs font-bold ring-4 ring-white">{i + 1}</span>
                </span>
                <div>
                  <h3 className="font-semibold text-petrol sm:text-lg">{title}</h3>
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
              <div className="reveal rounded-2xl border-2 border-brand bg-white p-5 shadow-card">
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
              <div key={z.id} className="reveal rounded-2xl bg-white p-5 shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
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
        <div className="reveal relative isolate flex flex-col items-center gap-5 overflow-hidden rounded-[2rem] bg-linear-120 from-brand to-brand-dark px-6 py-9 text-center text-white sm:flex-row sm:text-left lg:p-12">
          <div aria-hidden="true" className="dots absolute inset-0 -z-10" />
          <div aria-hidden="true" className="drift absolute -top-20 -right-16 -z-10 size-72 rounded-full bg-white/15 blur-2xl" />
          <span className="float grid size-20 shrink-0 place-items-center rounded-3xl bg-white/15 ring-1 ring-white/25" aria-hidden="true">
            <WhatsAppIcon className="size-10" />
          </span>
          <div className="flex-1">
            <h2 className="text-[clamp(1.3rem,4.5vw,1.9rem)] leading-tight font-extrabold tracking-tight">Não achou o que precisa?</h2>
            <p className="text-white/90">Temos muito mais na loja. Chame a gente no WhatsApp que a gente separa para você.</p>
          </div>
          <a
            href={waLink(s.whatsapp, `Olá, ${s.storeName}! Estou procurando um produto.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-petrol h-13 px-8 shadow-lift hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="size-5" /> Chamar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
