import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createToken, readToken } from "./token";

const COOKIE = "ph_session";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 dias

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Defina SESSION_SECRET (mínimo 32 caracteres) nas variáveis de ambiente.");
  }
  return "dev-only-secret-troque-em-producao-0000000000";
}

export async function createSession(userId: string) {
  const token = createToken({ uid: userId, exp: Date.now() + MAX_AGE_S * 1000 }, secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function getSessionUserId() {
  // Validar a expiração usa o relógio: marca a leitura como "na hora do request"
  await connection();
  const token = (await cookies()).get(COOKIE)?.value;
  return readToken(token, secret())?.uid ?? null;
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
