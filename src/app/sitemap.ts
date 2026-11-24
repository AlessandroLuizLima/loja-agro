import type { MetadataRoute } from "next";
import { allProducts, collections } from "@/lib/catalog";
import { infoPages } from "@/lib/content";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...collections.map((c) => ({ url: `${base}/categoria/${c.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...allProducts().map((p) => ({ url: `${base}/produto/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...infoPages.map((p) => ({ url: `${base}/ajuda/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
