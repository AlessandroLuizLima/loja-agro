"use server";

import { z } from "zod";
import { db } from "@/lib/server/db";

export type NewsletterState = { status: "idle" } | { status: "error"; message: string } | { status: "success"; coupon: string };

const schema = z.object({ email: z.email().max(120) });

/** Cadastra o e-mail na newsletter e devolve o cupom de primeira compra. */
export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "").trim().toLowerCase() });
  if (!parsed.success) return { status: "error", message: "Digite um e-mail válido." };

  db().prepare("INSERT OR IGNORE INTO newsletter (email) VALUES (?)").run(parsed.data.email);
  return { status: "success", coupon: "BEMVINDO10" };
}
