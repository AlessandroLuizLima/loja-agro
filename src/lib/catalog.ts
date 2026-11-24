/**
 * Catálogo da loja.
 *
 * Os dados ficam aqui para o projeto rodar sem serviços externos. Para ligar à
 * Nuvemshop, troque as funções no fim do arquivo por chamadas à API
 * (GET /v1/{store_id}/products) mantendo as mesmas assinaturas.
 */

export type CategorySlug = "racoes" | "brinquedos" | "higiene" | "acessorios";
export type PetSlug = "caes" | "gatos";

export type Product = {
  slug: string;
  name: string;
  /** Ilustração provisória até termos as fotos reais */
  emoji: string;
  tint: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  category: CategorySlug;
  pets: PetSlug[];
  stock: number;
  tags: ("oferta" | "mais-vendido")[];
  description: string;
  highlights: string[];
};

export type Collection = {
  slug: string;
  name: string;
  emoji: string;
  tint: string;
  description: string;
  /** Aparece no menu e nos cards de categoria da home */
  inMenu: boolean;
  match: (p: Product) => boolean;
};

const products: Product[] = [
  {
    slug: "racao-premium-caes-adultos-frango-15kg",
    name: "Ração Premium Cães Adultos Frango & Arroz 15kg",
    emoji: "🦴", tint: "bg-brand-soft", oldPrice: 289.9, price: 199.9, rating: 4.9, reviews: 412,
    category: "racoes", pets: ["caes"], stock: 42, tags: ["oferta"],
    description: "Alimento completo para cães adultos de porte médio e grande, com frango de verdade como primeiro ingrediente e arroz de fácil digestão.",
    highlights: ["Sem corantes artificiais", "Ômega 3 e 6 para pele e pelagem", "Fibras que ajudam a digestão", "Embalagem com fecho zip"],
  },
  {
    slug: "arranhador-torre-gatos-3-andares",
    name: "Arranhador Torre para Gatos 3 Andares",
    emoji: "🐈", tint: "bg-petrol-soft", oldPrice: 249.9, price: 169.9, rating: 4.8, reviews: 198,
    category: "acessorios", pets: ["gatos"], stock: 15, tags: ["oferta"],
    description: "Torre com três plataformas, toca e postes revestidos de sisal natural. Ajuda a gastar energia e protege seus móveis.",
    highlights: ["Altura de 92 cm", "Sisal natural", "Base reforçada antitombamento", "Montagem sem ferramentas"],
  },
  {
    slug: "kit-mordedores-resistentes-5un",
    name: "Kit Brinquedos Mordedores Resistentes (5 un.)",
    emoji: "🎾", tint: "bg-mint", oldPrice: 89.9, price: 54.9, rating: 4.7, reviews: 306,
    category: "brinquedos", pets: ["caes"], stock: 80, tags: ["oferta"],
    description: "Cinco mordedores de borracha atóxica em formatos diferentes para limpar os dentes e aliviar o estresse.",
    highlights: ["Borracha atóxica", "Ideal para cães de 5 a 25 kg", "Pode ir na lava-louças", "Cores sortidas"],
  },
  {
    slug: "caminha-redonda-antiestresse-m",
    name: "Caminha Pet Redonda Antiestresse Tam. M",
    emoji: "🛏️", tint: "bg-rose", oldPrice: 179.9, price: 119.9, rating: 4.9, reviews: 521,
    category: "acessorios", pets: ["caes", "gatos"], stock: 23, tags: ["oferta"],
    description: "Cama de pelúcia macia com bordas altas que dão sensação de aconchego e segurança. Tamanho M (60 cm).",
    highlights: ["Diâmetro de 60 cm", "Fundo antiderrapante", "Lavável na máquina", "Enchimento de fibra siliconada"],
  },
  {
    slug: "shampoo-neutro-hipoalergenico-500ml",
    name: "Shampoo Neutro Hipoalergênico 500ml",
    emoji: "🧴", tint: "bg-sky", oldPrice: 49.9, price: 32.9, rating: 4.6, reviews: 144,
    category: "higiene", pets: ["caes", "gatos"], stock: 60, tags: ["oferta"],
    description: "Fórmula suave com pH balanceado, indicada para peles sensíveis e filhotes a partir de 3 meses.",
    highlights: ["pH balanceado", "Sem parabenos", "Fragrância suave", "Rende até 20 banhos"],
  },
  {
    slug: "racao-umida-gatos-salmao-12-saches",
    name: "Ração Úmida Gatos Salmão – Caixa 12 sachês",
    emoji: "🐟", tint: "bg-sun-soft", oldPrice: 59.9, price: 41.9, rating: 4.8, reviews: 233,
    category: "racoes", pets: ["gatos"], stock: 55, tags: ["oferta"],
    description: "Sachês de 85 g com pedaços de salmão ao molho. Ajuda na hidratação e agrada até os gatos mais exigentes.",
    highlights: ["12 sachês de 85 g", "Rico em proteína", "Ajuda na hidratação", "Para gatos adultos"],
  },
  {
    slug: "peitoral-guia-ajustavel-refletivo",
    name: "Coleira + Guia Peitoral Ajustável Refletiva",
    emoji: "🦮", tint: "bg-petrol-soft", oldPrice: 99.9, price: 64.9, rating: 4.7, reviews: 178,
    category: "acessorios", pets: ["caes"], stock: 34, tags: ["oferta"],
    description: "Peitoral acolchoado com faixas refletivas para passeios noturnos mais seguros. Acompanha guia de 1,2 m.",
    highlights: ["Ajuste em 4 pontos", "Faixas refletivas", "Fecho de engate rápido", "Guia de 1,2 m inclusa"],
  },
  {
    slug: "fonte-bebedouro-automatico-2l",
    name: "Fonte Bebedouro Automático 2L com Filtro",
    emoji: "💧", tint: "bg-mint", oldPrice: 199.9, price: 139.9, rating: 4.8, reviews: 289,
    category: "acessorios", pets: ["gatos", "caes"], stock: 18, tags: ["oferta"],
    description: "Água sempre corrente e filtrada, que estimula seu pet a beber mais. Bomba silenciosa e baixo consumo.",
    highlights: ["Capacidade de 2 litros", "Filtro de carvão ativado", "Motor silencioso", "Cabo USB"],
  },
  {
    slug: "tapete-higienico-super-absorvente-30un",
    name: "Tapete Higiênico Super Absorvente 30 un.",
    emoji: "🧻", tint: "bg-sun-soft", price: 69.9, rating: 4.9, reviews: 1820,
    category: "higiene", pets: ["caes"], stock: 120, tags: ["mais-vendido"],
    description: "Tapetes 60x60 cm com gel superabsorvente que neutraliza odores e mantém a superfície seca.",
    highlights: ["30 unidades de 60x60 cm", "Gel que vira sólido", "Atrativo para educação", "Fita adesiva nas bordas"],
  },
  {
    slug: "bifinho-natural-carne-500g",
    name: "Petisco Natural Bifinho de Carne 500g",
    emoji: "🥩", tint: "bg-brand-soft", price: 34.9, rating: 4.9, reviews: 1344,
    category: "racoes", pets: ["caes"], stock: 95, tags: ["mais-vendido"],
    description: "Petisco macio feito com carne bovina, ideal para recompensar e treinar seu cão.",
    highlights: ["Feito com carne bovina", "Sem conservantes artificiais", "Pacote de 500 g", "Ótimo para adestramento"],
  },
  {
    slug: "areia-sanitaria-biodegradavel-4kg",
    name: "Areia Sanitária Biodegradável 4kg",
    emoji: "🐾", tint: "bg-petrol-soft", oldPrice: 42.9, price: 36.9, rating: 4.8, reviews: 987,
    category: "higiene", pets: ["gatos"], stock: 70, tags: ["mais-vendido"],
    description: "Areia de grãos de milho que forma torrões firmes, controla odores e pode ser descartada no vaso sanitário.",
    highlights: ["100% vegetal", "Forma torrões firmes", "Baixa poeira", "Pode ir no vaso sanitário"],
  },
  {
    slug: "comedouro-duplo-inox-antiderrapante",
    name: "Comedouro Duplo Inox Antiderrapante",
    emoji: "🥣", tint: "bg-sky", price: 59.9, rating: 4.7, reviews: 756,
    category: "acessorios", pets: ["caes", "gatos"], stock: 40, tags: ["mais-vendido"],
    description: "Duas tigelas de aço inox removíveis em base de silicone que não escorrega nem derrama.",
    highlights: ["2 tigelas de 400 ml", "Aço inox removível", "Base de silicone", "Fácil de limpar"],
  },
  {
    slug: "varinha-pena-gatos",
    name: "Varinha Interativa com Penas para Gatos",
    emoji: "🪶", tint: "bg-rose", price: 24.9, rating: 4.6, reviews: 211,
    category: "brinquedos", pets: ["gatos"], stock: 65,  tags: [],
    description: "Varinha flexível com penas e guizo que desperta o instinto caçador e diverte gato e tutor.",
    highlights: ["Haste flexível de 70 cm", "Penas naturais", "Guizo", "Refil extra incluso"],
  },
  {
    slug: "racao-gatos-castrados-salmao-10kg",
    name: "Ração Gatos Castrados Salmão 10kg",
    emoji: "🐱", tint: "bg-sun-soft", price: 219.9, rating: 4.8, reviews: 402,
    category: "racoes", pets: ["gatos"], stock: 27, tags: [],
    description: "Fórmula para gatos castrados com controle de peso e saúde do trato urinário.",
    highlights: ["Controle de peso", "Saúde urinária", "Rico em proteína", "Embalagem de 10 kg"],
  },
  {
    slug: "escova-removedora-de-pelos",
    name: "Escova Removedora de Pelos com Botão Limpa-Fácil",
    emoji: "🪮", tint: "bg-mint", price: 44.9, rating: 4.7, reviews: 389,
    category: "higiene", pets: ["caes", "gatos"], stock: 48, tags: [],
    description: "Remove pelos soltos e nós sem machucar. Um botão recolhe as cerdas para limpar a escova em segundos.",
    highlights: ["Cerdas com ponta arredondada", "Botão de limpeza", "Cabo ergonômico", "Para pelos curtos e longos"],
  },
  {
    slug: "bola-dispenser-petiscos",
    name: "Bola Dispenser de Petiscos Interativa",
    emoji: "⚽", tint: "bg-brand-soft", price: 39.9, rating: 4.5, reviews: 167,
    category: "brinquedos", pets: ["caes"], stock: 52, tags: [],
    description: "Coloque petiscos ou ração dentro e veja seu cão se divertir tentando tirá-los. Ótima para cães ansiosos.",
    highlights: ["Dificuldade ajustável", "Material atóxico", "Diâmetro de 10 cm", "Fácil de abrir e lavar"],
  },
];

export const collections: Collection[] = [
  { slug: "caes", name: "Cães", emoji: "🐶", tint: "bg-brand-soft", inMenu: true, description: "Rações, brinquedos e acessórios para o seu melhor amigo.", match: (p) => p.pets.includes("caes") },
  { slug: "gatos", name: "Gatos", emoji: "🐱", tint: "bg-petrol-soft", inMenu: true, description: "Tudo para o conforto e a diversão do seu gato.", match: (p) => p.pets.includes("gatos") },
  { slug: "racoes", name: "Rações", emoji: "🥣", tint: "bg-sun-soft", inMenu: true, description: "Rações secas, úmidas e petiscos para todas as fases.", match: (p) => p.category === "racoes" },
  { slug: "brinquedos", name: "Brinquedos", emoji: "🎾", tint: "bg-mint", inMenu: true, description: "Diversão e gasto de energia garantidos.", match: (p) => p.category === "brinquedos" },
  { slug: "higiene", name: "Higiene", emoji: "🛁", tint: "bg-sky", inMenu: true, description: "Banho, tosa, tapetes e areias.", match: (p) => p.category === "higiene" },
  { slug: "acessorios", name: "Acessórios", emoji: "🦮", tint: "bg-rose", inMenu: true, description: "Camas, comedouros, coleiras e mais.", match: (p) => p.category === "acessorios" },
  { slug: "promocoes", name: "Promoções", emoji: "🔥", tint: "bg-brand-soft", inMenu: false, description: "Ofertas com até 40% OFF por tempo limitado.", match: (p) => p.oldPrice !== undefined },
  { slug: "mais-vendidos", name: "Mais vendidos", emoji: "⭐", tint: "bg-sun-soft", inMenu: false, description: "Os favoritos dos nossos clientes de 4 patas.", match: (p) => p.tags.includes("mais-vendido") },
];

/* ===== Acesso aos dados (troque por chamadas à API da Nuvemshop) ===== */

export const allProducts = (): readonly Product[] => products;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);

export const menuCollections = () => collections.filter((c) => c.inMenu);

export const productsIn = (slug: string) => {
  const c = getCollection(slug);
  return c ? products.filter(c.match) : [];
};

export const weeklyOffers = () => products.filter((p) => p.tags.includes("oferta"));

export const bestSellers = () => products.filter((p) => p.tags.includes("mais-vendido"));

export const relatedProducts = (product: Product, limit = 4) =>
  products
    .filter((p) => p.slug !== product.slug && (p.category === product.category || p.pets.some((pet) => product.pets.includes(pet))))
    .slice(0, limit);

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function searchProducts(query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return products.filter((p) => {
    const text = normalize(`${p.name} ${p.description} ${p.category} ${p.pets.join(" ")}`);
    return terms.every((t) => text.includes(t));
  });
}
