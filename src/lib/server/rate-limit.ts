import "server-only";
import { db } from "./db";

/**
 * Limite de tentativas (contra quem tenta adivinhar senhas).
 * Conta as falhas recentes por chave, ex.: "login:email:fulano@x.com" e "login:ip:1.2.3.4".
 */

export type Limit = { max: number; windowMin: number };

export const LIMITS = {
  /** Mesma conta: 5 senhas erradas em 15 minutos bloqueiam por 15 minutos */
  loginEmail: { max: 5, windowMin: 15 },
  /** Mesmo IP, várias contas: 20 falhas em 15 minutos */
  loginIp: { max: 20, windowMin: 15 },
  /** Código da verificação em duas etapas: 5 erros em 15 minutos */
  twoFactor: { max: 5, windowMin: 15 },
  /** Códigos de confirmação de e-mail/celular enviados para a mesma conta */
  verifySend: { max: 3, windowMin: 15 },
  /** Cadastros feitos do mesmo IP */
  signupIp: { max: 10, windowMin: 60 },
} satisfies Record<string, Limit>;

/** Minutos que faltam para liberar, ou 0 se não está bloqueado. */
export function blockedFor(key: string, limit: Limit, now = Date.now()) {
  const since = now - limit.windowMin * 60_000;
  const rows = db().prepare("SELECT at FROM login_attempts WHERE key = ? AND at > ? ORDER BY at DESC LIMIT ?").all(key, since, limit.max) as { at: number }[];
  if (rows.length < limit.max) return 0;
  const oldest = rows[rows.length - 1].at;
  return Math.max(1, Math.ceil((oldest + limit.windowMin * 60_000 - now) / 60_000));
}

export function recordAttempt(key: string, now = Date.now()) {
  db().prepare("INSERT INTO login_attempts (key, at) VALUES (?, ?)").run(key, now);
}

export function clearAttempts(key: string) {
  db().prepare("DELETE FROM login_attempts WHERE key = ?").run(key);
}

/** Limpeza: tentativas com mais de um dia não servem para nada. */
export function pruneAttempts(now = Date.now()) {
  db().prepare("DELETE FROM login_attempts WHERE at < ?").run(now - 24 * 60 * 60_000);
}
