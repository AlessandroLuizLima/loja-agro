"use server";

import { redirect } from "next/navigation";
import type { AuthState } from "@/app/(loja)/conta/actions";
import { adminUrl } from "@/lib/admin-path";
import { audit } from "@/lib/server/audit";
import { verifyPassword } from "@/lib/server/password";
import { blockedFor, clearAttempts, LIMITS, recordAttempt } from "@/lib/server/rate-limit";
import { clientIp } from "@/lib/server/request";
import { clearPendingLogin, createPendingLogin, createSession, getPendingLogin } from "@/lib/server/session";
import { requiresTwoFactor, verifyLoginCode } from "@/lib/server/two-factor";
import { findUserByEmail, findUserById, sessionUser } from "@/lib/server/users";

const tooMany = (min: number) => `Muitas tentativas. Por segurança, tente de novo em ${min} ${min === 1 ? "minuto" : "minutos"}.`;

/** Só caminhos dentro do painel, para o ?next= não virar redirecionamento aberto. */
function safeAdminNext(value: FormDataEntryValue | null) {
  const v = typeof value === "string" ? value : "";
  const base = adminUrl();
  return v === base || v.startsWith(`${base}/`) ? v : base;
}

/** Login do painel (só aparece na página de entrada do painel). */
export async function adminSignIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(formData.get("password") ?? "");
  const emailKey = `admin:email:${email}`;
  const ipKey = `admin:ip:${await clientIp()}`;

  const wait = Math.max(blockedFor(emailKey, LIMITS.loginEmail), blockedFor(ipKey, LIMITS.loginIp));
  if (wait) {
    await audit(email || null, "login_bloqueado");
    return { error: tooMany(wait), values: { email } };
  }

  const user = email ? findUserByEmail(email) : undefined;
  if (!user || user.role !== "admin" || !(await verifyPassword(password, user.password_hash))) {
    recordAttempt(emailKey);
    recordAttempt(ipKey);
    await audit(email || null, "login_falhou");
    return { error: "E-mail ou senha incorretos.", values: { email } };
  }
  clearAttempts(emailKey);

  // Senha certa: com verificação em duas etapas, ainda falta o código do celular
  if (requiresTwoFactor(user.id)) {
    await createPendingLogin(sessionUser(user));
    redirect(`${adminUrl("/verificar")}?next=${encodeURIComponent(safeAdminNext(formData.get("next")))}`);
  }

  await createSession(sessionUser(user));
  await audit(user.email, "login");
  redirect(safeAdminNext(formData.get("next")));
}

export type VerifyState = { error?: string };

/** Segunda etapa do login: código do aplicativo autenticador ou código de recuperação. */
export async function verifyTwoFactorLogin(_prev: VerifyState, formData: FormData): Promise<VerifyState> {
  const pending = await getPendingLogin();
  if (!pending) redirect(adminUrl("/entrar?erro=expirou"));
  const user = findUserById(pending.uid);
  if (!user || user.role !== "admin" || user.session_version !== pending.sv) redirect(adminUrl("/entrar"));

  const key = `2fa:${user.id}`;
  const wait = blockedFor(key, LIMITS.twoFactor);
  if (wait) return { error: tooMany(wait) };

  const kind = verifyLoginCode(user.id, String(formData.get("code") ?? "").slice(0, 20));
  if (!kind) {
    recordAttempt(key);
    await audit(user.email, "2fa_falhou");
    return { error: "Código incorreto ou expirado. Confira o aplicativo e tente de novo." };
  }

  clearAttempts(key);
  await clearPendingLogin();
  await createSession(sessionUser(user));
  await audit(user.email, kind === "recuperacao" ? "codigo_recuperacao" : "login");
  redirect(safeAdminNext(formData.get("next")));
}
