import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/** Cabeçalhos de segurança em todas as respostas. */
const securityHeaders = [
  // Ninguém consegue abrir a loja ou o painel dentro de outro site (golpe de "clique falso")
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  // O navegador não "adivinha" o tipo de arquivo (protege as imagens enviadas)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Links externos não recebem o endereço completo da página (que pode ter o código do pedido)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Em produção, o navegador só aceita HTTPS por 1 ano
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // Sem Cache Components de propósito: toda página da loja lê o banco (preço, estoque, nome e cores)
  // e é montada a cada acesso com connection(). Nada fica "congelado" do momento do build.
  // Gera um servidor enxuto em .next/standalone (usado no Dockerfile)
  output: "standalone",
  // Não anuncia "X-Powered-By: Next.js" (menos informação para quem procura falhas)
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Páginas com dados pessoais não ficam guardadas em cache de navegador ou proxy
      { source: "/(admin|conta|pedido|checkout)(.*)", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
  experimental: {
    // Fotos de produto e logo chegam já reduzidas pelo navegador; 4 MB dá folga
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
