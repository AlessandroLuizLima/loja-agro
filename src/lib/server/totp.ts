import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Verificação em duas etapas com aplicativo autenticador (Google Authenticator, Microsoft Authenticator, Authy…).
 * TOTP (RFC 6238): código de 6 dígitos que muda a cada 30 segundos, calculado a partir de um segredo
 * que só o celular do lojista e a loja conhecem. Funções puras, sem banco, para poderem ser testadas.
 */

const STEP_S = 30;
const DIGITS = 6;
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string) {
  const clean = text.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Segredo novo: 160 bits aleatórios em base32 (o formato que os aplicativos leem). */
export function generateSecret() {
  return base32Encode(randomBytes(20));
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_S);

export function codeAt(secret: string, step: number) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return String(bin).padStart(DIGITS, "0");
}

/**
 * Confere o código aceitando 30 s de diferença de relógio para cada lado.
 * Devolve o passo usado (para impedir reutilizar o mesmo código) ou null.
 */
export function verifyCode(secret: string, code: string, lastUsedStep: number, now = Date.now()) {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== DIGITS) return null;
  const step = currentStep(now);
  for (const s of [step - 1, step, step + 1]) {
    if (s <= lastUsedStep) continue;
    const expected = Buffer.from(codeAt(secret, s));
    if (timingSafeEqual(expected, Buffer.from(clean))) return s;
  }
  return null;
}

/** Endereço lido pelo QR Code dos aplicativos autenticadores. */
export function otpauthUri(secret: string, account: string, issuer: string) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_S}`;
}

/* ===== Segredo guardado criptografado no banco (AES-256-GCM, chave derivada do SESSION_SECRET) ===== */

const keyFrom = (appSecret: string) => createHash("sha256").update(`totp:${appSecret}`).digest();

export function encryptSecret(secret: string, appSecret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(appSecret), iv);
  const data = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decryptSecret(stored: string, appSecret: string) {
  try {
    const [iv, tag, data] = stored.split(".").map((p) => Buffer.from(p, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", keyFrom(appSecret), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/* ===== Códigos de recuperação (para quando o celular se perde) ===== */

const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // sem letras parecidas (i, l, o, 0, 1)

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const bytes = randomBytes(8);
    const chars = [...bytes].map((b) => RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]).join("");
    return `${chars.slice(0, 4)}-${chars.slice(4)}`;
  });
}

export const normalizeRecoveryCode = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, "");

export const hashRecoveryCode = (code: string) => createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");
