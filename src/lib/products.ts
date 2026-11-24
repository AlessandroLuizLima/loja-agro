/**
 * Catálogo fictício do protótipo.
 * Em produção, substitua estas listas por chamadas à API da Nuvemshop
 * (GET /v1/{store_id}/products) dentro de Server Components.
 */
export type Product = {
  id: string;
  name: string;
  /** Placeholder visual até termos as fotos reais */
  emoji: string;
  tint: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
};

export const PIX_DISCOUNT = 0.05;
export const MAX_INSTALLMENTS = 6;

export const weeklyOffers: Product[] = [
  { id: "racao-caes-15kg", name: "Ração Premium Cães Adultos Frango & Arroz 15kg", emoji: "🦴", tint: "bg-brand-soft", oldPrice: 289.9, price: 199.9, rating: 4.9, reviews: 412 },
  { id: "arranhador-torre", name: "Arranhador Torre para Gatos 3 Andares", emoji: "🐈", tint: "bg-petrol-soft", oldPrice: 249.9, price: 169.9, rating: 4.8, reviews: 198 },
  { id: "kit-mordedores", name: "Kit Brinquedos Mordedores Resistentes (5 un.)", emoji: "🎾", tint: "bg-mint", oldPrice: 89.9, price: 54.9, rating: 4.7, reviews: 306 },
  { id: "caminha-m", name: "Caminha Pet Redonda Antiestresse Tam. M", emoji: "🛏️", tint: "bg-rose", oldPrice: 179.9, price: 119.9, rating: 4.9, reviews: 521 },
  { id: "shampoo-neutro", name: "Shampoo Neutro Hipoalergênico 500ml", emoji: "🧴", tint: "bg-sky", oldPrice: 49.9, price: 32.9, rating: 4.6, reviews: 144 },
  { id: "sache-salmao", name: "Ração Úmida Gatos Salmão – Caixa 12 sachês", emoji: "🐟", tint: "bg-sun-soft", oldPrice: 59.9, price: 41.9, rating: 4.8, reviews: 233 },
  { id: "peitoral-refletivo", name: "Coleira + Guia Peitoral Ajustável Refletiva", emoji: "🦮", tint: "bg-petrol-soft", oldPrice: 99.9, price: 64.9, rating: 4.7, reviews: 178 },
  { id: "fonte-2l", name: "Fonte Bebedouro Automático 2L com Filtro", emoji: "💧", tint: "bg-mint", oldPrice: 199.9, price: 139.9, rating: 4.8, reviews: 289 },
];

export const bestSellers: Product[] = [
  { id: "tapete-30", name: "Tapete Higiênico Super Absorvente 30 un.", emoji: "🧻", tint: "bg-sun-soft", price: 69.9, rating: 4.9, reviews: 1820 },
  { id: "bifinho-500", name: "Petisco Natural Bifinho de Carne 500g", emoji: "🥩", tint: "bg-brand-soft", price: 34.9, rating: 4.9, reviews: 1344 },
  { id: "areia-bio-4kg", name: "Areia Sanitária Biodegradável 4kg", emoji: "🐾", tint: "bg-petrol-soft", oldPrice: 42.9, price: 36.9, rating: 4.8, reviews: 987 },
  { id: "comedouro-inox", name: "Comedouro Duplo Inox Antiderrapante", emoji: "🥣", tint: "bg-sky", price: 59.9, rating: 4.7, reviews: 756 },
];

export const categories = [
  { name: "Cães", emoji: "🐶", count: "+850 itens", tint: "bg-brand-soft" },
  { name: "Gatos", emoji: "🐱", count: "+620 itens", tint: "bg-petrol-soft" },
  { name: "Rações", emoji: "🥣", count: "+300 itens", tint: "bg-sun-soft" },
  { name: "Brinquedos", emoji: "🎾", count: "+240 itens", tint: "bg-mint" },
  { name: "Higiene", emoji: "🛁", count: "+180 itens", tint: "bg-sky" },
  { name: "Acessórios", emoji: "🦮", count: "+410 itens", tint: "bg-rose" },
] as const;

export const navLinks = [
  { label: "Cães", emoji: "🐶" },
  { label: "Gatos", emoji: "🐱" },
  { label: "Rações", emoji: "🥣" },
  { label: "Brinquedos", emoji: "🎾" },
  { label: "Higiene", emoji: "🛁" },
  { label: "Acessórios", emoji: "🦮" },
] as const;

export const testimonials = [
  { initials: "MC", name: "Mariana C.", place: "São Paulo, SP · tutora do Thor 🐶", color: "bg-brand", text: "Entrega super rápida e a ração chegou bem embalada. O Thor amou o brinquedo que veio de brinde!" },
  { initials: "RS", name: "Rafael S.", place: "Belo Horizonte, MG · tutor da Mel 🐱", color: "bg-petrol", text: "Preço melhor que no pet shop do bairro e ainda paguei com desconto no Pix. Já é minha terceira compra." },
  { initials: "JP", name: "Juliana P.", place: "Curitiba, PR · tutora da Luna 🐶", color: "bg-amber-500", text: "Precisei trocar o tamanho da caminha e foi muito fácil. Atendimento pelo WhatsApp nota 10!" },
];
