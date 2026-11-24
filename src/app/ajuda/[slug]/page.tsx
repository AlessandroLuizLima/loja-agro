import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getInfoPage, infoPages, STORE } from "@/lib/content";

export function generateStaticParams() {
  return infoPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ajuda/[slug]">): Promise<Metadata> {
  const page = getInfoPage((await params).slug);
  return page ? { title: page.title, description: page.intro, alternates: { canonical: `/ajuda/${page.slug}` } } : {};
}

export default async function InfoPage({ params }: PageProps<"/ajuda/[slug]">) {
  const page = getInfoPage((await params).slug);
  if (!page) notFound();

  return (
    <div className="container-page py-5 lg:py-8">
      <Breadcrumbs items={[{ label: page.title }]} />
      <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Ajuda" className="rounded-3xl bg-white p-4 shadow-card">
          <ul className="space-y-1 text-sm">
            {infoPages.map((p) => (
              <li key={p.slug}>
                <Link href={`/ajuda/${p.slug}`} aria-current={p.slug === page.slug ? "page" : undefined} className="block rounded-xl px-3 py-2 font-medium text-petrol hover:bg-petrol-soft aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand-dark">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <h1 className="mb-2 text-2xl font-bold text-petrol lg:text-3xl">{page.title}</h1>
          <p className="mb-6 text-lg text-muted">{page.intro}</p>
          {page.sections.map((s) => (
            <section key={s.heading} className="mb-5">
              <h2 className="mb-1.5 text-lg font-semibold text-petrol">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="mb-2 leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <div className="mt-8 rounded-2xl bg-sun-soft p-4 text-sm">
            Ainda com dúvidas? Fale com a gente pelo{" "}
            <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-dark underline">
              WhatsApp
            </a>{" "}
            ou pelo e-mail {STORE.email}.
          </div>
        </article>
      </div>
    </div>
  );
}
