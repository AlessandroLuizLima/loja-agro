import { randomBytes, scrypt, scryptSync, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const KEY_LEN = 64;

const format = (salt: Buffer, hash: Buffer) => `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;

/** Hash no formato `scrypt$<salt>$<hash>` (base64url). */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  return format(salt, await scryptAsync(password.normalize("NFKC"), salt, KEY_LEN));
}

/** Versão síncrona, usada só na criação do primeiro administrador ao abrir o banco. */
export function hashPasswordSync(password: string) {
  const salt = randomBytes(16);
  return format(salt, scryptSync(password.normalize("NFKC"), salt, KEY_LEN));
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scryptAsync(password.normalize("NFKC"), Buffer.from(saltB64, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}
