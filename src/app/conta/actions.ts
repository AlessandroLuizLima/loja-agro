"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { createSession, destroySession } from "@/lib/server/session";
import { createUser, findUserByEmail } from "@/lib/server/users";

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

const signUpSchema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo.").max(80).refine((v) => v.includes(" "), "Informe nome e sobrenome."),
    email: z.email("E-mail inválido.").max(120),
    phone: z.string().trim().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido.").or(z.literal("")),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72).regex(/[A-Za-z]/, "Use letras e números.").regex(/\d/, "Use letras e números."),
    confirm: z.string(),
    terms: z.literal("on", { error: "Aceite os termos para continuar." }),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não conferem." });

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData);
  const values = { name: String(raw.name ?? ""), email: String(raw.email ?? ""), phone: String(raw.phone ?? "") };
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

  const id = createUser({
    name: parsed.data.name.replace(/\s+/g, " "),
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    passwordHash: await hashPassword(parsed.data.password),
  });
  await createSession(id);
  redirect(safeNext(formData.get("next")));
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = email ? findUserByEmail(email) : undefined;

  // Mesma mensagem para e-mail inexistente e senha errada (não revela quem tem conta)
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: "E-mail ou senha incorretos.", values: { email } };
  }

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
