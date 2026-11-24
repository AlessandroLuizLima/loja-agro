import { describe, expect, it } from "vitest";
import { adminPassword, customerPassword } from "./password-rules";

describe("regras de senha", () => {
  it("cliente: 8+ com letras e números", () => {
    expect(customerPassword.safeParse("abc12345").success).toBe(true);
    expect(customerPassword.safeParse("abcdefgh").success).toBe(false);
    expect(customerPassword.safeParse("abc123").success).toBe(false);
  });
  it("painel: 10+ com maiúscula, minúscula e número", () => {
    expect(adminPassword.safeParse("Agro2026Loja").success).toBe(true);
    expect(adminPassword.safeParse("agro2026loja").success).toBe(false);
    expect(adminPassword.safeParse("Agro2026").success).toBe(false);
  });
});
