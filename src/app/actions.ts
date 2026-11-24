"use server";

export type NewsletterState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; coupon: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server Action da newsletter. No protótipo apenas valida e devolve o cupom;
 * na loja real, salve o contato (Nuvemshop Customers API, RD Station, Mailchimp…).
 */
export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Digite um e-mail válido." };
  }
  await new Promise((r) => setTimeout(r, 600)); // simula a chamada externa
  return { status: "success", coupon: "BEMVINDO10" };
}
