import { describe, expect, it } from "vitest";
import { base32Decode, base32Encode, codeAt, decryptSecret, encryptSecret, generateRecoveryCodes, generateSecret, hashRecoveryCode, verifyCode } from "./totp";

// Segredo de teste da RFC 6238 ("12345678901234567890")
const RFC_SECRET = base32Encode(Buffer.from("12345678901234567890"));

describe("TOTP (RFC 6238)", () => {
  it("base32 vai e volta", () => {
    expect(RFC_SECRET).toBe("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
    expect(base32Decode(RFC_SECRET).toString()).toBe("12345678901234567890");
  });

  it("gera os códigos oficiais da RFC", () => {
    expect(codeAt(RFC_SECRET, Math.floor(59 / 30))).toBe("287082");
    expect(codeAt(RFC_SECRET, Math.floor(1111111109 / 30))).toBe("081804");
    expect(codeAt(RFC_SECRET, Math.floor(1234567890 / 30))).toBe("005924");
  });

  it("aceita 30 s de diferença e não aceita o mesmo código duas vezes", () => {
    const now = 1_700_000_000_000;
    const step = Math.floor(now / 30_000);
    const code = codeAt(RFC_SECRET, step);
    expect(verifyCode(RFC_SECRET, code, 0, now)).toBe(step);
    expect(verifyCode(RFC_SECRET, code, step, now)).toBeNull();
    expect(verifyCode(RFC_SECRET, codeAt(RFC_SECRET, step - 1), 0, now)).toBe(step - 1);
    expect(verifyCode(RFC_SECRET, codeAt(RFC_SECRET, step - 3), 0, now)).toBeNull();
    expect(verifyCode(RFC_SECRET, "12345", 0, now)).toBeNull();
  });
});

describe("segredo guardado e códigos de recuperação", () => {
  it("criptografa e só abre com a mesma chave", () => {
    const secret = generateSecret();
    const stored = encryptSecret(secret, "a".repeat(40));
    expect(stored).not.toContain(secret);
    expect(decryptSecret(stored, "a".repeat(40))).toBe(secret);
    expect(decryptSecret(stored, "b".repeat(40))).toBeNull();
  });

  it("gera 8 códigos diferentes, conferidos sem diferenciar maiúsculas e hífen", () => {
    const codes = generateRecoveryCodes();
    expect(new Set(codes).size).toBe(8);
    expect(codes[0]).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}$/);
    expect(hashRecoveryCode(codes[0].toUpperCase().replace("-", " "))).toBe(hashRecoveryCode(codes[0]));
  });
});
