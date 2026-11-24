import "server-only";
import { db, transaction } from "./db";
import { secret } from "./session";
import { decryptSecret, encryptSecret, generateRecoveryCodes, generateSecret, hashRecoveryCode, verifyCode } from "./totp";

/** Verificação em duas etapas da conta: ativação, conferência do código e códigos de recuperação. */

type Row = { totp_secret: string | null; totp_enabled: number; totp_last_step: number };

const row = (userId: string) => db().prepare("SELECT totp_secret, totp_enabled, totp_last_step FROM users WHERE id = ?").get(userId) as Row | undefined;

export function twoFactorStatus(userId: string) {
  const r = row(userId);
  const recoveryLeft = (db().prepare("SELECT COUNT(*) AS n FROM recovery_codes WHERE user_id = ? AND used_at IS NULL").get(userId) as { n: number }).n;
  return { enabled: r?.totp_enabled === 1, pendingSetup: !!r?.totp_secret && r.totp_enabled !== 1, recoveryLeft };
}

/** Segredo em texto (só para mostrar o QR Code durante a ativação). */
export function pendingSecret(userId: string) {
  const r = row(userId);
  if (!r?.totp_secret || r.totp_enabled === 1) return null;
  return decryptSecret(r.totp_secret, secret());
}

/** Passo 1 da ativação: gera um segredo novo (ainda desligado até o lojista confirmar um código). */
export function startSetup(userId: string) {
  db().prepare("UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?").run(encryptSecret(generateSecret(), secret()), userId);
}

export function cancelSetup(userId: string) {
  db().prepare("UPDATE users SET totp_secret = NULL WHERE id = ? AND totp_enabled = 0").run(userId);
}

/** Confere um código do aplicativo e marca o passo como usado (o mesmo código não vale duas vezes). */
function checkTotp(userId: string, code: string) {
  const r = row(userId);
  const plain = r?.totp_secret ? decryptSecret(r.totp_secret, secret()) : null;
  if (!r || !plain) return false;
  const step = verifyCode(plain, code, r.totp_last_step);
  if (step === null) return false;
  db().prepare("UPDATE users SET totp_last_step = ? WHERE id = ?").run(step, userId);
  return true;
}

/** Passo 2 da ativação: com um código certo, liga a verificação e devolve os códigos de recuperação (mostrados uma única vez). */
export function confirmSetup(userId: string, code: string) {
  if (!checkTotp(userId, code)) return null;
  const codes = generateRecoveryCodes();
  const conn = db();
  transaction(conn, () => {
    conn.prepare("UPDATE users SET totp_enabled = 1 WHERE id = ?").run(userId);
    conn.prepare("DELETE FROM recovery_codes WHERE user_id = ?").run(userId);
    const insert = conn.prepare("INSERT INTO recovery_codes (user_id, code_hash) VALUES (?, ?)");
    for (const c of codes) insert.run(userId, hashRecoveryCode(c));
  });
  return codes;
}

export function disable(userId: string) {
  const conn = db();
  transaction(conn, () => {
    conn.prepare("UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?").run(userId);
    conn.prepare("DELETE FROM recovery_codes WHERE user_id = ?").run(userId);
  });
}

/** No login: aceita o código do aplicativo ou um código de recuperação (que deixa de valer). */
export function verifyLoginCode(userId: string, input: string): "app" | "recuperacao" | null {
  if (/^\s*\d{3}\s?\d{3}\s*$/.test(input)) return checkTotp(userId, input) ? "app" : null;
  const { changes } = db()
    .prepare("UPDATE recovery_codes SET used_at = datetime('now') WHERE user_id = ? AND code_hash = ? AND used_at IS NULL")
    .run(userId, hashRecoveryCode(input));
  return Number(changes) > 0 ? "recuperacao" : null;
}

/** Ao confirmar a senha ou o código, a verificação é exigida? */
export const requiresTwoFactor = (userId: string) => row(userId)?.totp_enabled === 1;
