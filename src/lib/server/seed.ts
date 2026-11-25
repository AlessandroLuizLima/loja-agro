import "server-only";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { slugify } from "../format";
import type { Tint } from "../types";

/**
 * Dados de demonstração de uma agropecuária, criados só na primeira vez que o banco é aberto.
 * O lojista edita ou apaga tudo pelo painel. Para começar com a loja vazia: SEED_DEMO=false.
 */

const categories: { name: string; emoji: string; tint: Tint; description: string }[] = [
  { name: "Cães e gatos", emoji: "🐾", tint: "laranja", description: "Rações, petiscos, areia e cuidados para cães e gatos." },
  { name: "Aves", emoji: "🐔", tint: "amarelo", description: "Rações, milho e equipamentos para galinhas e aves." },
  { name: "Equinos", emoji: "🐴", tint: "rosa", description: "Rações, suplementos e selaria para cavalos." },
  { name: "Bovinos", emoji: "🐄", tint: "azul", description: "Sal mineral, rações e manejo de gado." },
  { name: "Jardim e horta", emoji: "🌱", tint: "verde", description: "Sementes, adubos, terra e mudas." },
  { name: "Ferramentas", emoji: "🛠️", tint: "petroleo", description: "Ferramentas, arame, mangueiras e manutenção." },
  { name: "Saúde animal", emoji: "💉", tint: "azul", description: "Vermífugos, vacinas e medicamentos veterinários." },
];

type SeedProduct = {
  name: string;
  cat: number;
  price: number;
  old?: number;
  unit: string;
  stock: number;
  emoji: string;
  tint: Tint;
  description: string;
  highlights: string[];
  consulta?: boolean;
  featured?: boolean;
  /** Variação: grupo e nome da opção */
  group?: string;
  option?: string;
  /** Foto de public/demo-fotos (padrão: o slug do produto) */
  photo?: string;
};

const products: SeedProduct[] = [
  { name: "Ração para cães adultos Premium 15 kg", cat: 0, price: 159.9, old: 189.9, unit: "Saco 15 kg", stock: 24, emoji: "🐕", tint: "laranja", featured: true, group: "racao-caes-premium", option: "15 kg", photo: "racao-para-caes-adultos-premium-15-kg", description: "Ração completa para cães adultos de todos os portes, com proteína de frango e arroz.", highlights: ["Rica em ômega 3 e 6", "Sem corantes artificiais", "Rende cerca de 50 dias para um cão médio"] },
  { name: "Ração para cães adultos Premium 3 kg", cat: 0, price: 44.9, unit: "Pacote 3 kg", stock: 18, emoji: "🐕", tint: "laranja", group: "racao-caes-premium", option: "3 kg", photo: "racao-para-caes-adultos-premium-15-kg", description: "Ração completa para cães adultos de todos os portes, com proteína de frango e arroz.", highlights: ["Rica em ômega 3 e 6", "Sem corantes artificiais", "Embalagem prática para cães pequenos"] },
  { name: "Ração para gatos adultos 10,1 kg", cat: 0, price: 139.9, unit: "Saco 10,1 kg", stock: 15, emoji: "🐈", tint: "rosa", description: "Fórmula para gatos adultos, com controle de bolas de pelo e saúde urinária.", highlights: ["Controle de pH urinário", "Fibras para bolas de pelo", "Croquetes crocantes"] },
  { name: "Areia higiênica para gatos 4 kg", cat: 0, price: 19.9, unit: "Pacote 4 kg", stock: 40, emoji: "🪣", tint: "amarelo", description: "Areia de grãos finos com alta absorção e controle de odor.", highlights: ["Forma torrões firmes", "Controle de odor por até 7 dias"] },
  { name: "Ração para galinhas poedeiras 25 kg", cat: 1, price: 98.9, old: 109.9, unit: "Saco 25 kg", stock: 30, emoji: "🐔", tint: "amarelo", featured: true, description: "Ração farelada balanceada para aumentar a postura e a qualidade da casca.", highlights: ["Cálcio na medida certa", "Aumenta a postura", "Para aves a partir de 18 semanas"] },
  { name: "Milho em grão 20 kg", cat: 1, price: 54.9, unit: "Saco 20 kg", stock: 60, emoji: "🌽", tint: "amarelo", featured: true, description: "Milho em grão selecionado, limpo e seco, para trato de aves e outros animais.", highlights: ["Grãos selecionados", "Baixa umidade"] },
  { name: "Bebedouro automático para aves 5 L", cat: 1, price: 34.9, unit: "Unidade", stock: 18, emoji: "💧", tint: "azul", description: "Bebedouro tipo pressão, fácil de limpar, para pintinhos e aves adultas.", highlights: ["Capacidade de 5 litros", "Base larga e estável"] },
  { name: "Ração para equinos 40 kg", cat: 2, price: 119.9, unit: "Saco 40 kg", stock: 20, emoji: "🐴", tint: "rosa", featured: true, description: "Ração peletizada para cavalos em manutenção e trabalho leve.", highlights: ["Peletizada, menos desperdício", "Com vitaminas e minerais"] },
  { name: "Cabresto de nylon reforçado", cat: 2, price: 49.9, old: 59.9, unit: "Unidade", stock: 12, emoji: "🪢", tint: "laranja", description: "Cabresto ajustável em nylon com argolas reforçadas.", highlights: ["Tamanho ajustável", "Argolas zincadas"] },
  { name: "Sal mineral para bovinos 25 kg", cat: 3, price: 89.9, unit: "Saco 25 kg", stock: 35, emoji: "🧂", tint: "azul", featured: true, description: "Suplemento mineral pronto para uso, para bovinos de corte em pasto.", highlights: ["Fósforo e microminerais", "Pronto para o cocho"] },
  { name: "Ração para bezerros 30 kg", cat: 3, price: 112.9, unit: "Saco 30 kg", stock: 10, emoji: "🐄", tint: "azul", description: "Ração inicial para bezerros em aleitamento e recria.", highlights: ["Alta digestibilidade", "Estimula o desenvolvimento do rúmen"] },
  { name: "Adubo NPK 10-10-10 5 kg", cat: 4, price: 39.9, old: 46.9, unit: "Pacote 5 kg", stock: 25, emoji: "🧪", tint: "verde", description: "Adubo granulado de uso geral para hortas, jardins e frutíferas.", highlights: ["Nitrogênio, fósforo e potássio equilibrados", "Fácil aplicação"] },
  { name: "Terra vegetal adubada 25 kg", cat: 4, price: 24.9, unit: "Saco 25 kg", stock: 50, emoji: "🪴", tint: "verde", description: "Terra preparada com matéria orgânica, pronta para vasos e canteiros.", highlights: ["Rica em matéria orgânica", "Pronta para plantio"] },
  { name: "Sementes de alface crespa", cat: 4, price: 4.9, unit: "Envelope", stock: 80, emoji: "🥬", tint: "verde", description: "Sementes de alta germinação para horta caseira ou comercial.", highlights: ["Alta taxa de germinação", "Colheita em 45 a 60 dias"] },
  { name: "Mangueira de jardim 20 m", cat: 5, price: 79.9, unit: "Rolo 20 m", stock: 9, emoji: "🌀", tint: "petroleo", description: "Mangueira flexível e resistente, com engates e esguicho.", highlights: ["Acompanha esguicho", "Resistente ao sol"] },
  { name: "Enxada com cabo 1,40 m", cat: 5, price: 64.9, unit: "Unidade", stock: 14, emoji: "⛏️", tint: "petroleo", description: "Enxada de aço temperado com cabo de madeira tratada.", highlights: ["Aço temperado", "Cabo de 1,40 m"] },
  { name: "Arame farpado 500 m", cat: 5, price: 389.9, old: 419.9, unit: "Rolo 500 m", stock: 6, emoji: "🧷", tint: "petroleo", description: "Arame farpado galvanizado para cercas de pastagem.", highlights: ["Galvanizado, não enferruja", "Alta resistência"] },
  { name: "Vermífugo para cães até 10 kg", cat: 6, price: 29.9, unit: "Caixa com 2 comprimidos", stock: 30, emoji: "💊", tint: "azul", description: "Vermífugo de amplo espectro para cães. Siga a orientação do médico-veterinário.", highlights: ["Dose única", "Comprimido palatável"] },
  { name: "Antibiótico injetável para bovinos", cat: 6, price: 0, unit: "Frasco 50 ml", stock: 0, emoji: "💉", tint: "azul", consulta: true, description: "Medicamento de venda sob prescrição do médico-veterinário. Consulte disponibilidade e condições pelo WhatsApp.", highlights: ["Venda mediante receita veterinária", "Orientação no balcão"] },
];

const zones = [
  { name: "Centro e bairros próximos", areas: "Centro, Vila Aguiar, Jardim Brasília e região", fee: 8, freeAbove: 150, days: [1, 2, 3, 4, 5, 6] },
  { name: "Zona norte – entrega às terças", areas: "Mailasqui, Canguera e bairros vizinhos", fee: 15, freeAbove: 300, days: [2] },
  { name: "Zona sul – entrega às quintas", areas: "São João Novo, Saboó e bairros vizinhos", fee: 15, freeAbove: 300, days: [4] },
];

export function seedDemoData(conn: DatabaseSync) {
  const catIds = categories.map((c, i) => {
    const id = randomUUID();
    conn
      .prepare("INSERT INTO categories (id, slug, name, emoji, tint, description, sort) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, slugify(c.name), c.name, c.emoji, c.tint, c.description, i);
    return id;
  });

  const insertProduct = conn.prepare(
    `INSERT INTO products (id, slug, name, category_id, price, old_price, unit, stock, emoji, tint, description, highlights, sale_mode, featured, image_id, variant_group, variant_label)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const p of products) {
    const slug = slugify(p.name);
    insertProduct.run(
      randomUUID(),
      slug,
      p.name,
      catIds[p.cat],
      p.price,
      p.old ?? null,
      p.unit,
      p.stock,
      p.emoji,
      p.tint,
      p.description,
      JSON.stringify(p.highlights),
      p.consulta ? "consulta" : "online",
      p.featured ? 1 : 0,
      demoPhoto(conn, p.photo ?? slug),
      p.group ?? null,
      p.option ?? null,
    );
  }

  zones.forEach((z, i) =>
    conn
      .prepare("INSERT INTO delivery_zones (id, name, areas, fee, free_above, days, sort) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(randomUUID(), z.name, z.areas, z.fee, z.freeAbove, JSON.stringify(z.days), i),
  );

  conn.prepare("INSERT INTO coupons (id, code, percent, min_subtotal) VALUES (?, ?, ?, ?)").run(randomUUID(), "BEMVINDO10", 10, 100);
}

/**
 * Foto de demonstração do produto (public/demo-fotos/<slug>.webp), gravada no banco como as fotos enviadas pelo painel.
 * Fotos de licença livre; créditos em public/demo-fotos/CREDITOS.md. Sem a foto, o produto usa o emoji.
 */
export function demoPhoto(conn: DatabaseSync, slug: string) {
  const file = join(/*turbopackIgnore: true*/ process.cwd(), "public", "demo-fotos", `${slug}.webp`);
  if (!existsSync(file)) return null;
  const id = randomUUID().replace(/-/g, ""); // mesmo formato das fotos enviadas pelo painel
  conn.prepare("INSERT INTO images (id, mime, data) VALUES (?, 'image/webp', ?)").run(id, readFileSync(file));
  return id;
}
