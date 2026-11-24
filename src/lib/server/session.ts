import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createToken, readToken } from "./token";

const COOKIE = "ph_session";
const MAX_AGE_S = 60 * 60 * 24 * 30; // cliente: 30 dias
const ADMIN_MAX_AGE_S = 60 * 60 * 12; // painel: 12 horas

export function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Defina SESSION_SECRET (mínimo 32 caracteres) nas variáveis de ambiente.");
  }
  return "dev-only-secret-troque-em-producao-0000000000";
}

export async function createSession(user: { id: string; sessionVersion: number; role: string }) {
  const maxAge = user.role === "admin" ? ADMIN_MAX_AGE_S : MAX_AGE_S;
  const token = createToken({ uid: user.id, sv: user.sessionVersion, exp: Date.now() + maxAge * 1000 }, secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function getSession() {
  // Validar a expiração usa o relógio: marca a leitura como "na hora do request"
  await connection();
  const token = (await cookies()).get(COOKIE)?.value;
  const payload = readToken(token, secret());
  return payload ? { uid: payload.uid, sv: payload.sv ?? 1 } : null;
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/* ===== Login em duas etapas: senha certa, esperando o código do celular ===== */

const PENDING_COOKIE = "ph_2fa";
const PENDING_MAX_AGE_S = 5 * 60;
// Chave diferente da sessão: um cookie "esperando código" nunca serve como login
const pendingSecret = () => `${secret()}:2fa-pendente`;

export async function createPendingLogin(user: { id: string; sessionVersion: number }) {
  const token = createToken({ uid: user.id, sv: user.sessionVersion, exp: Date.now() + PENDING_MAX_AGE_S * 1000 }, pendingSecret());
  (await cookies()).set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: PENDING_MAX_AGE_S,
  });
}

export async function getPendingLogin() {
  await connection();
  const payload = readToken((await cookies()).get(PENDING_COOKIE)?.value, pendingSecret());
  return payload ? { uid: payload.uid, sv: payload.sv ?? 1 } : null;
}

export async function clearPendingLogin() {
  (await cookies()).delete(PENDING_COOKIE);
}
