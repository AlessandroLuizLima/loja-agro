"use server";

import { randomInt } from "node:crypto";
import { z } from "zod";
import { computeTotals, onlyDigits } from "@/lib/pricing";
import { createOrder, type OrderPayload } from "@/lib/server/orders";
import { getCurrentUser } from "@/lib/server/users";
import { isValidCpf } from "@/lib/validators";

export type CheckoutState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; orderId: string };

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;

const schema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo.").max(80),
    email: z.email("E-mail inválido.").max(120),
    cpf: z.string().refine(isValidCpf, "CPF inválido."),
    phone: z.string().refine((v) => onlyDigits(v).length >= 10, "Telefone inválido."),
    cep: z.string().refine((v) => onlyDigits(v).length === 8, "CEP inválido."),
    street: z.string().trim().min(3, "Informe a rua.").max(120),
    number: z.string().trim().min(1, "Informe o número.").max(10),
    complement: z.string().trim().max(60),
    district: z.string().trim().min(2, "Informe o bairro.").max(60),
    city: z.string().trim().min(2, "Informe a cidade.").max(60),
    state: z.enum(UFS, { error: "UF inválida." }),
    shipping: z.enum(["pac", "sedex", "retirada"], { error: "Escolha a forma de entrega." }),
    payment: z.enum(["pix", "cartao", "boleto"], { error: "Escolha a forma de pagamento." }),
    installments: z.coerce.number().int().min(1).max(6),
    cardBrand: z.string().max(20),
    cardLast4: z.string().max(4),
    coupon: z.string().max(30),
    items: z
      .string()
      .transform((s, ctx) => {
        try {
          return z.array(z.object({ slug: z.string().max(80), qty: z.number().int().min(1).max(10) })).max(50).parse(JSON.parse(s));
        } catch {
          ctx.addIssue({ code: "custom", message: "Carrinho inválido." });
          return z.NEVER;
        }
      }),
  })
  .refine((d) => d.payment !== "cartao" || /^\d{4}$/.test(d.cardLast4), { path: ["cardNumber"], message: "Confira os dados do cartão." });

/** Códigos de pagamento fictícios. Na loja real vêm do gateway (Nuvem Pago, Mercado Pago, Pagar.me…). */
const fakePix = (total: number) =>
  `00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}52040000530398654${String(total.toFixed(2).length).padStart(2, "0")}${total.toFixed(2)}5802BR5908PETHOUSE6009SAO PAULO6304${randomInt(4096, 65535).toString(16).toUpperCase()}`;
const fakeBoleto = () => Array.from({ length: 47 }, () => randomInt(0, 10)).join("").replace(/^(.{5})(.{5})(.{5})(.{6})(.{5})(.{6})(.)(.{14})$/, "$1.$2 $3.$4 $5.$6 $7 $8");

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const raw = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Confira os campos destacados.", fieldErrors };
  }
  const d = parsed.data;

  // Preços, frete e descontos são recalculados no servidor a partir do catálogo
  const totals = computeTotals({ items: d.items, couponCode: d.coupon || null, cep: d.cep, shippingId: d.shipping, payment: d.payment });

  if (totals.lines.length === 0) return { status: "error", message: "Seu carrinho está vazio." };
  if (totals.couponError) return { status: "error", message: totals.couponError };
  if (!totals.shipping) return { status: "error", message: "Escolha uma forma de entrega válida.", fieldErrors: { shipping: "Escolha a entrega." } };

  const installments = d.payment === "cartao" ? Math.min(d.installments, totals.installments.count) : 1;
  const user = await getCurrentUser();

  const payload: OrderPayload = {
    customer: { name: d.name, email: d.email.toLowerCase(), cpf: onlyDigits(d.cpf), phone: d.phone },
    address: { cep: d.cep, street: d.street, number: d.number, complement: d.complement, district: d.district, city: d.city, state: d.state },
    items: totals.lines.map((l) => ({
      slug: l.product.slug,
      name: l.product.name,
      emoji: l.product.emoji,
      tint: l.product.tint,
      qty: l.qty,
      unitPrice: l.product.price,
      lineTotal: l.lineTotal,
    })),
    shipping: { id: totals.shipping.id, name: totals.shipping.name, deadline: totals.shipping.deadline, price: totals.shipping.price },
    payment: {
      method: d.payment,
      installments,
      installmentValue: Math.round((totals.total / installments) * 100) / 100,
      ...(d.payment === "cartao" && { cardBrand: d.cardBrand || "Cartão", cardLast4: d.cardLast4 }),
      ...(d.payment === "pix" && { pixCode: fakePix(totals.total) }),
      ...(d.payment === "boleto" && { boletoLine: fakeBoleto() }),
    },
    totals: {
      subtotal: totals.subtotal,
      couponCode: totals.coupon?.code,
      couponDiscount: totals.couponDiscount,
      pixDiscount: totals.pixDiscount,
      shipping: totals.shippingPrice,
      total: totals.total,
    },
  };

  const { id } = createOrder({
    userId: user?.id ?? null,
    // Demonstração: cartão é aprovado na hora; Pix e boleto aguardam o pagamento
    status: d.payment === "cartao" ? "pago" : "aguardando_pagamento",
    payload,
  });

  return { status: "success", orderId: id };
}
