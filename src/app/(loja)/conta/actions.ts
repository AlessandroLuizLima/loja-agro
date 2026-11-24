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
import { createUser, findUserByEmail, findUserById, getCurrentUser, sessionUser } from "@/lib/server/users";

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
  if (wait) {
    if (findUserByEmail(email)?.role === "admin") await audit(email, "login_bloqueado");
    return { error: tooMany(wait), values: { email } };
  }

  const user = email ? findUserByEmail(email) : undefined;

  // Mesma mensagem para e-mail inexistente e senha errada (não revela quem tem conta)
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    recordAttempt(emailKey);
    recordAttempt(ipKey);
    if (user?.role === "admin") await audit(email, "login_falhou");
    return { error: "E-mail ou senha incorretos.", values: { email } };
  }

  clearAttempts(emailKey);
  await createSession(sessionUser(user));
  if (user.role === "admin") await audit(user.email, "login");
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
