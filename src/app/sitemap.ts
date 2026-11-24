import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { listCategories, listProducts } from "@/lib/server/catalog";
import { getSettings, siteUrl } from "@/lib/server/settings";

const helpPages = ["quem-somos", "como-comprar", "fale-conosco", "entregas-e-retirada", "trocas-e-devolucoes", "politica-de-privacidade", "termos-de-uso"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = siteUrl(getSettings());
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/ofertas`, changeFrequency: "daily", priority: 0.8 },
    ...listCategories().map((c) => ({ url: `${base}/categoria/${c.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...listProducts().map((p) => ({ url: `${base}/produto/${p.slug}`, lastModified: p.updatedAt.replace(" ", "T") + "Z", changeFrequency: "weekly" as const, priority: 0.7 })),
    ...helpPages.map((slug) => ({ url: `${base}/ajuda/${slug}`, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
