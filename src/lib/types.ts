/**
 * Tipos compartilhados entre servidor e navegador.
 * Nada aqui acessa banco ou segredos: pode ser importado por Client Components.
 */

/** Cores de fundo para produtos/categorias sem foto. Classes fixas para o Tailwind gerá-las. */
export const TINTS = {
  verde: "bg-mint",
  laranja: "bg-brand-soft",
  amarelo: "bg-sun-soft",
  azul: "bg-sky",
  rosa: "bg-rose",
  petroleo: "bg-petrol-soft",
} as const;

export type Tint = keyof typeof TINTS;
export const TINT_NAMES = Object.keys(TINTS) as Tint[];
export const tintClass = (t: string) => TINTS[t as Tint] ?? TINTS.verde;

export const imageUrl = (id: string | null | undefined) => (id ? `/imagens/${id}` : null);

export type Category = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  tint: Tint;
  description: string;
  sort: number;
  active: boolean;
  productCount: number;
};

/** "online": compra pelo site. "consulta": só aparece no catálogo, pedido pelo WhatsApp (ex.: itens que exigem receita). */
export type SaleMode = "online" | "consulta";

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  oldPrice: number | null;
  unit: string;
  stock: number;
  imageId: string | null;
  emoji: string;
  tint: Tint;
  description: string;
  highlights: string[];
  saleMode: SaleMode;
  featured: boolean;
  active: boolean;
  updatedAt: string;
};

export type DeliveryZone = {
  id: string;
  name: string;
  /** Bairros/localidades atendidos, em texto livre */
  areas: string;
  fee: number;
  /** Entrega grátis a partir deste valor (null = nunca) */
  freeAbove: number | null;
  /** Dias da semana com entrega (0 = domingo … 6 = sábado) */
  days: number[];
  active: boolean;
  sort: number;
};

export type CouponInfo = { code: string; percent: number; minSubtotal: number };
export type Coupon = CouponInfo & { id: string; active: boolean; uses: number };

export type Settings = {
  storeName: string;
  tagline: string;
  logoImageId: string | null;
  colorBrand: string;
  colorPetrol: string;
  announcement: string;
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  hours: string;
  instagram: string;
  facebook: string;
  legalName: string;
  cnpj: string;
  pixKey: string;
  pixName: string;
  pixDiscountPercent: number;
  pickupEnabled: boolean;
  pickupDays: number[];
  pickupNote: string;
  siteUrl: string;
  /** LGPD: encarregado pelos dados pessoais (quem atende os pedidos dos clientes sobre os dados) */
  dpoName: string;
  dpoEmail: string;
  /** Meses até apagar os dados pessoais de pedidos concluídos ou cancelados */
  retentionMonths: number;
};

/** Item do carrinho salvo no navegador. Os dados do produto são uma cópia para exibição: o servidor recalcula tudo. */
export type CartItem = {
  slug: string;
  qty: number;
  name: string;
  price: number;
  unit: string;
  imageId: string | null;
  emoji: string;
  tint: Tint;
  stock: number;
};

export type CartSnapshot = Omit<CartItem, "qty">;

export const toSnapshot = (p: Product): CartSnapshot => ({
  slug: p.slug,
  name: p.name,
  price: p.price,
  unit: p.unit,
  imageId: p.imageId,
  emoji: p.emoji,
  tint: p.tint,
  stock: p.stock,
});

/* ===== Pedidos ===== */

export type OrderStatus = "novo" | "confirmado" | "pronto" | "em_rota" | "concluido" | "cancelado";
export type PaymentStatus = "pendente" | "pago";
export type FulfillmentType = "retirada" | "entrega";
export type PaymentMethod = "pix" | "na_entrega";
export type OnDeliveryMethod = "dinheiro" | "cartao" | "pix";

export const ORDER_STATUSES: OrderStatus[] = ["novo", "confirmado", "pronto", "em_rota", "concluido", "cancelado"];

export function statusLabel(status: OrderStatus, type: FulfillmentType) {
  switch (status) {
    case "novo":
      return "Recebido";
    case "confirmado":
      return "Confirmado";
    case "pronto":
      return type === "retirada" ? "Pronto para retirada" : "Separado";
    case "em_rota":
      return "Saiu para entrega";
    case "concluido":
      return type === "retirada" ? "Retirado" : "Entregue";
    case "cancelado":
      return "Cancelado";
  }
}

export const ON_DELIVERY_LABEL: Record<OnDeliveryMethod, string> = {
  dinheiro: "Dinheiro",
  cartao: "Cartão (débito ou crédito)",
  pix: "Pix na hora",
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  unit: string;
  imageId: string | null;
  emoji: string;
  tint: Tint;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderPayload = {
  customer: { name: string; phone: string; email: string };
  fulfillment: {
    type: FulfillmentType;
    /** AAAA-MM-DD */
    date: string;
    zoneId?: string;
    zoneName?: string;
    address?: { street: string; number: string; district: string; reference: string };
  };
  items: OrderItem[];
  payment: { method: PaymentMethod; onDelivery?: OnDeliveryMethod; changeFor?: number };
  notes: string;
  totals: { subtotal: number; couponCode?: string; couponDiscount: number; deliveryFee: number; pixDiscount: number; total: number };
};

export type Order = OrderPayload & {
  id: string;
  number: number;
  userId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};
