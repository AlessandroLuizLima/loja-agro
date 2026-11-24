import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSettings, siteUrl } from "@/lib/server/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/conta", "/checkout", "/carrinho", "/pedido", "/busca"] },
    sitemap: `${siteUrl(getSettings())}/sitemap.xml`,
  };
}
