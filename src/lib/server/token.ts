import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token de sessão assinado com HMAC-SHA256: `<base64url(json)>.<assinatura>`.
 * Funções puras (sem cookies) para poderem ser testadas isoladamente.
 */

export type SessionPayload = { uid: string; exp: number };

const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("base64url");

export function createToken(payload: SessionPayload, secret: string) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function readToken(token: string | undefined, secret: string, now = Date.now()): SessionPayload | null {
  if (!token) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  const expected = Buffer.from(sign(data, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number" || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}
