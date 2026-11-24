import { getProduct, type Product } from "./catalog";

/**
 * Regras de preço da loja, compartilhadas entre o carrinho (cliente) e o
 * checkout (servidor). O servidor sempre recalcula tudo a partir do catálogo:
 * nunca confia em preços vindos do navegador.
 */

export const FREE_SHIPPING_MIN = 199;
export const PIX_DISCOUNT = 0.05;
export const MAX_INSTALLMENTS = 6;
export const MIN_INSTALLMENT_VALUE = 20;
export const MAX_QTY_PER_ITEM = 10;

export type CartItem = { slug: string; qty: number };

export type PaymentMethod = "pix" | "cartao" | "boleto";

export type Coupon = { code: string; percent: number; minSubtotal: number; description: string };

export const COUPONS: Coupon[] = [
  { code: "BEMVINDO10", percent: 10, minSubtotal: 99, description: "10% OFF na primeira compra (mín. R$ 99)" },
  { code: "ASSINE15", percent: 15, minSubtotal: 0, description: "15% OFF do Clube PetHouse" },
];

export type ShippingOption = {
  id: "pac" | "sedex" | "retirada";
  name: string;
  deadline: string;
  price: number;
};

const round = (n: number) => Math.round(n * 100) / 100;

export function findCoupon(code: string | undefined | null) {
  if (!code) return undefined;
  return COUPONS.find((c) => c.code === code.trim().toUpperCase());
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Frete fictício por região (1º dígito do CEP). Substitua pela API de frete da Nuvemshop/Melhor Envio. */
export function shippingOptions(cep: string, merchandiseTotal: number): ShippingOption[] {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return [];
  const southeast = Number(digits[0]) <= 3;
  const free = merchandiseTotal >= FREE_SHIPPING_MIN;
  return [
    { id: "pac", name: free ? "Frete grátis (PAC)" : "PAC", deadline: southeast ? "4 a 6 dias úteis" : "6 a 10 dias úteis", price: free ? 0 : southeast ? 14.9 : 22.9 },
    { id: "sedex", name: "SEDEX", deadline: southeast ? "1 a 2 dias úteis" : "2 a 4 dias úteis", price: southeast ? 24.9 : 39.9 },
    { id: "retirada", name: "Retirar na loja (São Paulo, SP)", deadline: "Pronto em 2 horas", price: 0 },
  ];
}

export type PricedLine = { product: Product; qty: number; lineTotal: number };

export type Totals = {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  coupon?: Coupon;
  couponError?: string;
  couponDiscount: number;
  shipping?: ShippingOption;
  shippingPrice: number;
  pixDiscount: number;
  total: number;
  installments: { count: number; value: number };
  /** Quanto falta para ganhar frete grátis */
  missingForFreeShipping: number;
};

export function maxInstallments(total: number) {
  return Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(total / MIN_INSTALLMENT_VALUE)));
}

export function computeTotals(input: {
  items: CartItem[];
  couponCode?: string | null;
  cep?: string;
  shippingId?: string | null;
  payment?: PaymentMethod;
}): Totals {
  const lines: PricedLine[] = [];
  for (const item of input.items) {
    const product = getProduct(item.slug);
    if (!product) continue;
    const qty = Math.max(1, Math.min(Math.floor(item.qty), MAX_QTY_PER_ITEM, product.stock));
    lines.push({ product, qty, lineTotal: round(product.price * qty) });
  }

  const subtotal = round(lines.reduce((s, l) => s + l.lineTotal, 0));
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);

  let coupon = findCoupon(input.couponCode);
  let couponError: string | undefined;
  if (input.couponCode && !coupon) couponError = "Cupom inválido ou expirado.";
  if (coupon && subtotal < coupon.minSubtotal) {
    couponError = `Este cupom vale para compras acima de R$ ${coupon.minSubtotal}.`;
    coupon = undefined;
  }
  const couponDiscount = coupon ? round(subtotal * (coupon.percent / 100)) : 0;
  const merchandise = round(subtotal - couponDiscount);

  const options = input.cep ? shippingOptions(input.cep, merchandise) : [];
  const shipping = options.find((o) => o.id === input.shippingId);
  const shippingPrice = shipping?.price ?? 0;

  const pixDiscount = input.payment === "pix" ? round(merchandise * PIX_DISCOUNT) : 0;
  const total = round(merchandise - pixDiscount + shippingPrice);
  const count = maxInstallments(total);

  return {
    lines,
    itemCount,
    subtotal,
    coupon,
    couponError,
    couponDiscount,
    shipping,
    shippingPrice,
    pixDiscount,
    total,
    installments: { count, value: round(total / count) },
    missingForFreeShipping: Math.max(0, round(FREE_SHIPPING_MIN - merchandise)),
  };
}
