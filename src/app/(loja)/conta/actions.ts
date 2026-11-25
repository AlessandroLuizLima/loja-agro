"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { customerPassword } from "@/lib/password-rules";
import { audit } from "@/lib/server/audit";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { deleteCustomer } from "@/lib/server/privacy";
import { blockedFor, clearAttempts, LIMITS, recordAttempt } from "@/lib/server/rate-limit";
import { clientIp } from "@/lib/server/request";
import { createSession, destroySession } from "@/lib/server/session";
import { createUser, findUserByEmail, findUserById, getCurrentUser, sessionUser, updateContact, updatePassword } from "@/lib/server/users";
import { refresh } from "next/cache";
import { getSettings } from "@/lib/server/settings";
import { confirmVerification, requestVerification } from "@/lib/server/verification";
import { canVerify, type Channel } from "@/lib/server/messaging";

export type AuthState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "password" | "confirm" | "terms", string>>;
  values?: { name?: string; email?: string; phone?: string };
};

/** Só aceita caminhos internos, para o ?next= não virar redirecionamento aberto. */
function safeNext(value: FormDataEntryValue | null) {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/conta";
}

const tooMany = (min: number) => `Muitas tentativas. Por segurança, tente de novo em ${min} ${min === 1 ? "minuto" : "minutos"}.`;

const signUpSchema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo.").max(80).refine((v) => v.includes(" "), "Informe nome e sobrenome."),
    email: z.email("E-mail inválido.").max(120),
    phone: z.string().trim().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido.").or(z.literal("")),
    password: customerPassword,
    confirm: z.string(),
    terms: z.literal("on", { error: "Aceite a Política de Privacidade para continuar." }),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não conferem." });

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData);
  const values = { name: String(raw.name ?? ""), email: String(raw.email ?? ""), phone: String(raw.phone ?? "") };

  const ipKey = `signup:ip:${await clientIp()}`;
  const wait = blockedFor(ipKey, LIMITS.signupIp);
  if (wait) return { error: tooMany(wait), values };

  const parsed = signUpSchema.safeParse({ ...raw, email: values.email.trim().toLowerCase(), terms: raw.terms ?? "" });
  if (!parsed.success) {
    const fieldErrors: AuthState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<AuthState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors, values };
  }

  if (findUserByEmail(parsed.data.email)) {
    return { fieldErrors: { email: "Este e-mail já tem cadastro. Faça login." }, values };
  }

  recordAttempt(ipKey);
  const user = createUser({
    name: parsed.data.name.replace(/\s+/g, " "),
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    passwordHash: await hashPassword(parsed.data.password),
  });
  await createSession(sessionUser(user));
  redirect(safeNext(formData.get("next")));
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(formData.get("password") ?? "");
  const emailKey = `login:email:${email}`;
  const ipKey = `login:ip:${await clientIp()}`;

  // Bloqueio por conta e por IP: impede testar milhares de senhas
  const wait = Math.max(blockedFor(emailKey, LIMITS.loginEmail), blockedFor(ipKey, LIMITS.loginIp));
  if (wait) return { error: tooMany(wait), values: { email } };

  const user = email ? findUserByEmail(email) : undefined;

  // Mesma mensagem para e-mail inexistente e senha errada (não revela quem tem conta).
  // Administrador só entra pela página do painel: tentativas aqui nem chegam a testar a senha dele
  // e contam num limite separado, então ninguém tranca o lojista para fora tentando senhas por aqui.
  if (!user || user.role === "admin" || !(await verifyPassword(password, user.password_hash))) {
    recordAttempt(emailKey);
    recordAttempt(ipKey);
    return { error: "E-mail ou senha incorretos.", values: { email } };
  }

  clearAttempts(emailKey);
  await createSession(sessionUser(user));
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const user = await getCurrentUser();
  if (user?.role === "admin") await audit(user.email, "logout");
  await destroySession();
  redirect("/");
}

export type DeleteAccountState = { error?: string };

/** LGPD: o cliente exclui a própria conta. Os pedidos ficam (registro de venda), sem os dados pessoais. */
export async function deleteAccount(_prev: DeleteAccountState, formData: FormData): Promise<DeleteAccountState> {
  const user = await getCurrentUser();
  if (!user) redirect("/conta/entrar");
  if (user.role === "admin") return { error: "A conta de administrador não pode ser excluída por aqui." };
  if (formData.get("confirm") !== "EXCLUIR") return { error: 'Digite EXCLUIR para confirmar.' };
  const row = findUserById(user.id);
  if (!row || !(await verifyPassword(String(formData.get("password") ?? ""), row.password_hash))) return { error: "Senha incorreta." };

  const orders = deleteCustomer(user.id);
  await audit(null, "conta_excluida", `${orders} pedido(s) anonimizado(s)`);
  await destroySession();
  redirect("/");
}

/* ===== Minha conta: contatos, confirmação por código e senha ===== */

export type ContactState = { error?: string; ok?: string; sent?: boolean; testCode?: string };

const channelOf = (v: FormDataEntryValue | null): Channel | null => (v === "email" || v === "phone" ? v : null);

async function customer() {
  const user = await getCurrentUser();
  if (!user) redirect("/conta/entrar");
  return user;
}

/** Envia (ou reenvia) o código de confirmação para o e-mail ou celular da conta. */
export async function sendContactCode(_prev: ContactState, fd: FormData): Promise<ContactState> {
  const user = await customer();
  const channel = channelOf(fd.get("channel"));
  if (!channel || !canVerify(channel)) return { error: "Confirmação indisponível." };
  const target = channel === "email" ? user.email : user.phone;
  if (!target) return { error: "Cadastre o celular primeiro." };
  const sent = await requestVerification(user, channel, target, getSettings().storeName);
  if (!sent.ok) return { error: sent.error };
  return { sent: true, testCode: sent.testCode };
}

export async function confirmContactCode(_prev: ContactState, fd: FormData): Promise<ContactState> {
  const user = await customer();
  const channel = channelOf(fd.get("channel"));
  if (!channel) return { error: "Pedido inválido." };
  const result = confirmVerification(user.id, channel, String(fd.get("code") ?? ""), channel === "email" ? user.email : user.phone);
  if (!result.ok) return { sent: true, error: result.error };
  refresh();
  return { ok: channel === "email" ? "E-mail confirmado." : "Celular confirmado." };
}

const phoneSchema = z.string().trim().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Informe o celular com DDD.");

/** Troca o e-mail (pede a senha, porque o e-mail é o login) ou o celular. O contato novo precisa ser confirmado de novo. */
export async function updateContactAction(_prev: ContactState, fd: FormData): Promise<ContactState> {
  const user = await customer();
  const channel = channelOf(fd.get("channel"));
  const value = String(fd.get("value") ?? "").trim();
  if (channel === "phone") {
    const parsed = phoneSchema.safeParse(value);
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    if (parsed.data === user.phone) return { error: "Esse já é o seu celular." };
    updateContact(user.id, "phone", parsed.data);
    refresh();
    return { ok: "Celular atualizado." };
  }
  if (channel === "email") {
    const parsed = z.email("E-mail inválido.").max(120).safeParse(value.toLowerCase());
    if (!parsed.success) return { error: "E-mail inválido." };
    if (parsed.data === user.email) return { error: "Esse já é o seu e-mail." };
    const row = findUserById(user.id);
    if (!row || !(await verifyPassword(String(fd.get("password") ?? ""), row.password_hash))) return { error: "Senha incorreta." };
    if (findUserByEmail(parsed.data)) return { error: "Este e-mail já é usado por outra conta." };
    updateContact(user.id, "email", parsed.data);
    refresh();
    return { ok: "E-mail atualizado. Você entra com o e-mail novo a partir de agora." };
  }
  return { error: "Pedido inválido." };
}

export type PasswordState = { error?: string; ok?: string; fieldErrors?: Partial<Record<"current" | "password" | "confirm", string>> };

const customerPasswordSchema = z
  .object({ current: z.string().min(1, "Informe a senha atual."), password: customerPassword, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não conferem." })
  .refine((d) => d.password !== d.current, { path: ["password"], message: "A nova senha precisa ser diferente da atual." });

/** Troca de senha do cliente. Outros aparelhos conectados são desconectados. */
export async function changeCustomerPassword(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const user = await customer();
  if (user.role === "admin") return { error: "A senha do painel é trocada em Painel > Configurações." };
  const parsed = customerPasswordSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const fieldErrors: PasswordState["fieldErrors"] = {};
    for (const i of parsed.error.issues) fieldErrors[i.path[0] as "current" | "password" | "confirm"] ??= i.message;
    return { fieldErrors };
  }
  const row = findUserById(user.id);
  if (!row || !(await verifyPassword(parsed.data.current, row.password_hash))) return { fieldErrors: { current: "Senha atual incorreta." } };
  const updated = updatePassword(user.id, await hashPassword(parsed.data.password));
  await createSession(sessionUser(updated));
  return { ok: "Senha alterada. Se você estava conectado em outro aparelho, vai precisar entrar de novo lá." };
}
