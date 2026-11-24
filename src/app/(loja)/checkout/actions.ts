"use server";

import { z } from "zod";
import { todayISO } from "@/lib/dates";
import { onlyDigits } from "@/lib/format";
import { computeTotals, MAX_QTY_PER_ITEM } from "@/lib/pricing";
import { getProductsBySlugs } from "@/lib/server/catalog";
import { checkoutDates } from "@/lib/server/checkout";
import { findActiveCoupon } from "@/lib/server/coupons";
import { getZone } from "@/lib/server/delivery";
import { createOrder, OutOfStockError } from "@/lib/server/orders";
import { getSettings } from "@/lib/server/settings";
import { getCurrentUser } from "@/lib/server/users";
import type { OrderItem, OrderPayload } from "@/lib/types";

export type CheckoutState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; orderId: string };

const text = (max: number) => z.string().trim().max(max);

const OPTIONAL_FIELDS = ["email", "pickupDate", "zoneId", "deliveryDate", "street", "number", "district", "reference", "onDelivery", "changeFor", "notes", "coupon", "privacy"];

const schema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome.").max(80),
    phone: z.string().refine((v) => onlyDigits(v).length >= 10 && onlyDigits(v).length <= 11, "Informe um celular com DDD."),
    email: z.email("E-mail inválido.").max(120).or(z.literal("")),
    fulfillment: z.enum(["retirada", "entrega"], { error: "Escolha como quer receber." }),
    pickupDate: text(10),
    zoneId: text(60),
    deliveryDate: text(10),
    street: text(120),
    number: text(15),
    district: text(60),
    reference: text(160),
    payment: z.enum(["pix", "na_entrega"], { error: "Escolha a forma de pagamento." }),
    onDelivery: z.enum(["dinheiro", "cartao", "pix"]).or(z.literal("")),
    changeFor: text(12),
    notes: text(400),
    coupon: text(30),
    privacy: z.literal("on", { error: "Para fazer o pedido, aceite a Política de Privacidade." }),
    items: z.string().transform((s, ctx) => {
      try {
        return z
          .array(z.object({ slug: z.string().max(100), qty: z.number().int().min(1).max(MAX_QTY_PER_ITEM) }))
          .min(1)
          .max(60)
          .parse(JSON.parse(s));
      } catch {
        ctx.addIssue({ code: "custom", message: "Carrinho inválido." });
        return z.NEVER;
      }
    }),
  })
  .superRefine((d, ctx) => {
    if (d.fulfillment === "entrega") {
      if (!d.zoneId) ctx.addIssue({ code: "custom", path: ["zoneId"], message: "Escolha sua região de entrega." });
      if (d.street.length < 3) ctx.addIssue({ code: "custom", path: ["street"], message: "Informe a rua." });
      if (d.district.length < 2) ctx.addIssue({ code: "custom", path: ["district"], message: "Informe o bairro ou localidade." });
    }
    if (d.payment === "na_entrega" && !d.onDelivery) ctx.addIssue({ code: "custom", path: ["onDelivery"], message: "Como vai pagar?" });
  });

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  // Campos que não aparecem na tela (ex.: dia de retirada quando o cliente escolheu entrega) chegam vazios
  const blank = Object.fromEntries(OPTIONAL_FIELDS.map((k) => [k, ""]));
  const raw = { ...blank, ...Object.fromEntries([...formData.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""])) };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Confira os campos destacados.", fieldErrors };
  }
  const d = parsed.data;
  const settings = getSettings();

  // Produtos, preços e estoque vêm do banco; do navegador só aproveitamos o "qual" e o "quantos"
  const products = new Map(getProductsBySlugs(d.items.map((i) => i.slug)).map((p) => [p.slug, p]));
  const items: OrderItem[] = [];
  for (const i of d.items) {
    const p = products.get(i.slug);
    if (!p || p.saleMode !== "online") return { status: "error", message: "Um dos produtos do carrinho não está mais à venda. Volte ao carrinho e confira." };
    if (p.stock < i.qty) return { status: "error", message: `Temos só ${p.stock} de "${p.name}" em estoque. Ajuste a quantidade no carrinho.` };
    items.push({ productId: p.id, slug: p.slug, name: p.name, unit: p.unit, imageId: p.imageId, emoji: p.emoji, tint: p.tint, qty: i.qty, unitPrice: p.price, lineTotal: Math.round(p.price * i.qty * 100) / 100 });
  }

  // Datas e região conferidas de novo aqui (o dia pode ter virado desde que a página abriu)
  const today = todayISO();
  let fulfillment: OrderPayload["fulfillment"];
  let zone = undefined as ReturnType<typeof getZone>;
  if (d.fulfillment === "retirada") {
    if (!settings.pickupEnabled) return { status: "error", message: "A retirada na loja está indisponível no momento." };
    if (!checkoutDates.pickup(settings, today).includes(d.pickupDate)) {
      return { status: "error", message: "Escolha um dia de retirada da lista.", fieldErrors: { pickupDate: "Escolha um dia." } };
    }
    fulfillment = { type: "retirada", date: d.pickupDate };
  } else {
    zone = getZone(d.zoneId);
    if (!zone?.active) return { status: "error", message: "Escolha uma região de entrega da lista.", fieldErrors: { zoneId: "Escolha a região." } };
    if (!checkoutDates.delivery(zone, today).includes(d.deliveryDate)) {
      return { status: "error", message: "Escolha um dia de entrega da lista.", fieldErrors: { deliveryDate: "Escolha um dia." } };
    }
    fulfillment = {
      type: "entrega",
      date: d.deliveryDate,
      zoneId: zone.id,
      zoneName: zone.name,
      address: { street: d.street, number: d.number || "s/n", district: d.district, reference: d.reference },
    };
  }

  const pixEnabled = !!settings.pixKey;
  if (d.payment === "pix" && !pixEnabled) return { status: "error", message: "Pagamento por Pix pelo site indisponível. Escolha pagar na retirada/entrega." };

  const coupon = d.coupon ? findActiveCoupon(d.coupon) : undefined;
  if (d.coupon && !coupon) return { status: "error", message: "O cupom não é mais válido. Remova-o para continuar." };

  const totals = computeTotals({ lines: items.map((i) => ({ price: i.unitPrice, qty: i.qty })), coupon, zone, payment: d.payment, pixDiscountPercent: settings.pixDiscountPercent });
  if (totals.couponError) return { status: "error", message: totals.couponError };

  const changeFor = Number(d.changeFor.replace(",", "."));
  const payload: OrderPayload = {
    customer: { name: d.name.replace(/\s+/g, " "), phone: d.phone, email: d.email.toLowerCase() },
    fulfillment,
    items,
    payment: {
      method: d.payment,
      ...(d.payment === "na_entrega" && d.onDelivery && { onDelivery: d.onDelivery }),
      ...(d.payment === "na_entrega" && d.onDelivery === "dinheiro" && changeFor > totals.total && { changeFor }),
    },
    notes: d.notes,
    totals: {
      subtotal: totals.subtotal,
      couponCode: coupon && totals.couponDiscount > 0 ? coupon.code : undefined,
      couponDiscount: totals.couponDiscount,
      deliveryFee: totals.deliveryFee,
      pixDiscount: totals.pixDiscount,
      total: totals.total,
    },
  };

  const user = await getCurrentUser();
  try {
    const { id } = createOrder({ userId: user?.id ?? null, payload });
    return { status: "success", orderId: id };
  } catch (err) {
    if (err instanceof OutOfStockError) return { status: "error", message: `Acabou de esgotar: ${err.productName}. Ajuste o carrinho e tente de novo.` };
    throw err;
  }
}
