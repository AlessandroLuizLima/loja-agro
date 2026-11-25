import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "./db";
import { type Channel, sendCode, type SendResult } from "./messaging";
import { blockedFor, LIMITS, recordAttempt } from "./rate-limit";

/**
 * Confirmação de e-mail e celular: a loja manda um código de 6 números e o cliente digita na conta.
 * O código vale 10 minutos, aceita 5 tentativas e fica guardado só como hash.
 */

const TTL_MS = 10 * 60_000;
const MAX_TRIES = 5;

const hash = (userId: string, code: string) => createHash("sha256").update(`${userId}:${code}`).digest();

export async function requestVerification(user: { id: string }, channel: Channel, target: string, storeName: string): Promise<SendResult> {
  const key = `verificar:${user.id}:${channel}`;
  const wait = blockedFor(key, LIMITS.verifySend);
  if (wait) return { ok: false, error: `Você já pediu vários códigos. Tente de novo em ${wait} min.` };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const sent = await sendCode(channel, target, code, storeName);
  if (!sent.ok) return sent;

  recordAttempt(key);
  db()
    .prepare(
      `INSERT INTO verification_codes (user_id, channel, target, code_hash, expires_at, attempts) VALUES (?, ?, ?, ?, ?, 0)
       ON CONFLICT(user_id, channel) DO UPDATE SET target = excluded.target, code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0`,
    )
    .run(user.id, channel, target, hash(user.id, code).toString("hex"), Date.now() + TTL_MS);
  return sent;
}

export type ConfirmResult = { ok: true } | { ok: false; error: string };

/** Confere o código. `currentTarget` é o contato atual da conta: se mudou depois do envio, o código não vale. */
export function confirmVerification(userId: string, channel: Channel, code: string, currentTarget: string | null): ConfirmResult {
  const conn = db();
  const row = conn.prepare("SELECT target, code_hash, expires_at, attempts FROM verification_codes WHERE user_id = ? AND channel = ?").get(userId, channel) as
    | { target: string; code_hash: string; expires_at: number; attempts: number }
    | undefined;
  if (!row || row.target !== currentTarget) return { ok: false, error: "Peça um código novo." };
  if (row.expires_at < Date.now() || row.attempts >= MAX_TRIES) {
    conn.prepare("DELETE FROM verification_codes WHERE user_id = ? AND channel = ?").run(userId, channel);
    return { ok: false, error: "O código expirou. Peça um novo." };
  }
  const clean = code.replace(/\D/g, "");
  const ok = clean.length === 6 && timingSafeEqual(hash(userId, clean), Buffer.from(row.code_hash, "hex"));
  if (!ok) {
    conn.prepare("UPDATE verification_codes SET attempts = attempts + 1 WHERE user_id = ? AND channel = ?").run(userId, channel);
    return { ok: false, error: `Código incorreto. Restam ${MAX_TRIES - row.attempts - 1} tentativas.` };
  }
  const column = channel === "email" ? "email_verified_at" : "phone_verified_at";
  conn.prepare(`UPDATE users SET ${column} = datetime('now') WHERE id = ?`).run(userId);
  conn.prepare("DELETE FROM verification_codes WHERE user_id = ? AND channel = ?").run(userId, channel);
  return { ok: true };
}
