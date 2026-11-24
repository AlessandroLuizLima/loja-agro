import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem Cache Components de propósito: toda página da loja lê o banco (preço, estoque, nome e cores)
  // e é montada a cada acesso com connection(). Nada fica "congelado" do momento do build.
  // Gera um servidor enxuto em .next/standalone (usado no Dockerfile)
  output: "standalone",
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
