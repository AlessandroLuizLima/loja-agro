import { RefreshCw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { PawIcon, PixIcon } from "@/components/icons";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductGrid } from "@/components/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { bestSellers, menuCollections, productsIn, weeklyOffers } from "@/lib/catalog";

const benefits = [
  { title: "Frete grátis", text: "Acima de R$ 199", Icon: Truck, tone: "bg-brand-soft text-brand-dark", href: "/ajuda/prazos-de-entrega" },
  { title: "Compra segura", text: "Site 100% protegido", Icon: ShieldCheck, tone: "bg-petrol-soft text-petrol", href: "/ajuda/politica-de-privacidade" },
  { title: "Troca fácil", text: "Até 30 dias", Icon: RefreshCw, tone: "bg-sun-soft text-amber-700", href: "/ajuda/trocas-e-devolucoes" },
  { title: "5% OFF no Pix", text: "Aprovação na hora", Icon: PixIcon, tone: "bg-mint text-emerald-700", href: "/categoria/promocoes" },
];

const testimonials = [
  { initials: "MC", name: "Mariana C.", place: "São Paulo, SP · tutora do Thor 🐶", color: "bg-brand", text: "Entrega super rápida e a ração chegou bem embalada. O Thor amou o brinquedo que veio de brinde!" },
  { initials: "RS", name: "Rafael S.", place: "Belo Horizonte, MG · tutor da Mel 🐱", color: "bg-petrol", text: "Preço melhor que no pet shop do bairro e ainda paguei com desconto no Pix. Já é minha terceira compra." },
  { initials: "JP", name: "Juliana P.", place: "Curitiba, PR · tutora da Luna 🐶", color: "bg-amber-500", text: "Precisei trocar o tamanho da caminha e foi muito fácil. Atendimento pelo WhatsApp nota 10!" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="container-page py-5">
        <div className="relative grid overflow-hidden rounded-3xl bg-linear-135 from-petrol to-[#2a6b80] text-white lg:min-h-[440px] lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <PawIcon className="absolute -top-5 -left-5 size-32 text-white/[.06]" />
          <div className="relative z-10 px-6 pt-8 pb-2 lg:px-14 lg:py-12">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-sun px-3 py-1.5 text-xs font-bold text-petrol">
              <PawIcon className="size-3.5" /> Semana do Pet Feliz
            </span>
            <h1 className="mb-3 text-[clamp(2rem,7vw,3.4rem)] leading-[1.1] font-extrabold">
              Tudo que seu pet ama, com <span className="text-sun">até 40% OFF</span>
            </h1>
            <p className="mb-6 max-w-md text-base opacity-90 lg:text-lg">Rações premium, brinquedos e cuidados com entrega rápida para todo o Brasil.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/categoria/promocoes" className="btn btn-primary h-14 px-8 text-lg">
                Comprar agora →
              </Link>
              <span className="text-sm opacity-85">✔ 5% OFF extra no Pix</span>
            </div>
          </div>

          <div aria-hidden="true" className="relative grid min-h-60 place-items-center lg:min-h-[440px]">
            <div className="absolute size-64 rounded-full bg-brand lg:size-[22rem]" />
            <div className="relative text-[7rem] leading-none drop-shadow-[0_10px_18px_rgb(0_0_0/.25)] lg:text-[10rem]">🐕🐈</div>
            <div className="absolute top-4 right-4 rounded-2xl bg-white px-4 py-2.5 text-center font-display text-sm font-bold text-petrol shadow-card lg:top-auto lg:bottom-10">
              Até<b className="block text-2xl text-brand">40% OFF</b>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section aria-label="Benefícios" className="container-page grid grid-cols-2 gap-3 pb-6 sm:grid-cols-4">
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
      <section className="container-page py-7 lg:py-10">
        <SectionHeading title="Compre por categoria" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {menuCollections().map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="reveal rounded-2xl bg-white px-2 py-4 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className={`mx-auto mb-2.5 grid size-16 place-items-center rounded-full text-3xl ${c.tint}`}>{c.emoji}</div>
              <h3 className="text-sm font-semibold text-petrol">{c.name}</h3>
              <small className="text-xs text-muted">{productsIn(c.slug).length} produtos</small>
            </Link>
          ))}
        </div>
      </section>

      {/* Ofertas da semana */}
      <section id="ofertas" aria-labelledby="ofertas-title" className="container-page py-7 lg:py-10">
        <SectionHeading id="ofertas-title" title="Ofertas da semana" subtitle={<Countdown />} href="/categoria/promocoes" linkLabel="Ver todas" />
        <ProductGrid products={weeklyOffers()} />
      </section>

      {/* Banner promocional */}
      <section className="container-page py-7 lg:py-10">
        <div className="relative grid items-center gap-4 overflow-hidden rounded-3xl bg-brand px-6 py-8 text-white sm:grid-cols-[1.4fr_1fr] sm:p-10">
          <PawIcon className="absolute -top-5 -right-5 size-40 text-white/10" />
          <div className="relative">
            <h2 className="mb-2 text-[clamp(1.5rem,5.5vw,2.4rem)] leading-tight font-extrabold">
              Clube PetHouse: <span className="text-petrol">economize 15%</span> todo mês
            </h2>
            <p className="opacity-95">Assine a ração do seu pet, receba em casa no dia certo e nunca mais fique sem.</p>
            <p className="my-4 inline-block rounded-xl border-2 border-dashed border-white bg-white/20 px-4 py-2 font-display font-bold tracking-widest">🏷️ ASSINE15</p>
            <div>
              <Link href="/ajuda/clube-pethouse" className="btn btn-petrol h-13 px-8">
                Quero assinar
              </Link>
            </div>
          </div>
          <div aria-hidden="true" className="text-center text-7xl leading-none sm:text-8xl">
            📦🐾
          </div>
        </div>
      </section>

      {/* Mais vendidos */}
      <section aria-labelledby="best-title" className="container-page py-7 lg:py-10">
        <SectionHeading id="best-title" title="Mais vendidos" subtitle="Os favoritos dos nossos clientes de 4 patas" href="/categoria/mais-vendidos" />
        <ProductGrid products={bestSellers()} top />
      </section>

      {/* Depoimentos */}
      <section aria-labelledby="reviews-title" className="container-page py-7 lg:py-10">
        <SectionHeading id="reviews-title" title="Quem compra, recomenda" />
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-sun-soft px-4 py-3 text-sm">
          <b className="font-display text-3xl text-petrol">4,9</b>
          <div>
            <span className="text-amber-400" aria-label="5 de 5 estrelas">
              ★★★★★
            </span>
            <p className="text-xs text-muted">Baseado em 2.384 avaliações verificadas</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="reveal relative rounded-2xl bg-white p-5 shadow-card">
              <span aria-hidden="true" className="absolute top-1 right-4 font-serif text-6xl leading-none text-brand-soft">
                &ldquo;
              </span>
              <span className="text-lg text-amber-400" aria-label="5 de 5 estrelas">
                ★★★★★
              </span>
              <blockquote className="mt-2 mb-4 text-[0.95rem]">{t.text}</blockquote>
              <figcaption className="flex items-center gap-3">
                <span className={`grid size-11 place-items-center rounded-full font-display font-bold text-white ${t.color}`}>{t.initials}</span>
                <span>
                  <b className="block text-sm text-petrol">{t.name}</b>
                  <small className="text-xs text-muted">{t.place}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-page py-7 lg:py-10">
        <div className="rounded-3xl border-2 border-sun bg-sun-soft px-5 py-8 text-center lg:p-12">
          <div aria-hidden="true" className="mb-2 text-5xl">
            🎁
          </div>
          <h2 className="mb-1.5 text-[clamp(1.4rem,5vw,2rem)] font-bold text-petrol">
            Ganhe <span className="text-brand-dark">10% OFF</span> na primeira compra
          </h2>
          <p className="mb-5 text-muted">Cadastre seu e-mail e receba o cupom na hora, além de ofertas exclusivas.</p>
          <NewsletterForm />
          <p className="mt-3 text-xs text-muted">Sem spam. Você pode cancelar quando quiser.</p>
        </div>
      </section>
    </>
  );
}
