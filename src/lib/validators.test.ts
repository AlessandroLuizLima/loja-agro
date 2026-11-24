import { describe, expect, it } from "vitest";
import { maskCep, maskCpf, maskPhone } from "./masks";
import { cardBrand, isValidCardNumber, isValidCpf, isValidExpiry } from "./validators";

describe("isValidCpf", () => {
  it("aceita CPF válido com ou sem máscara", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });
  it("recusa dígitos errados e sequências repetidas", () => {
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });
});

describe("cartão", () => {
  it("valida pelo algoritmo de Luhn", () => {
    expect(isValidCardNumber("4111 1111 1111 1111")).toBe(true);
    expect(isValidCardNumber("4111 1111 1111 1112")).toBe(false);
  });
  it("identifica a bandeira", () => {
    expect(cardBrand("4111")).toBe("Visa");
    expect(cardBrand("5555 5555")).toBe("Mastercard");
    expect(cardBrand("3782")).toBe("Amex");
  });
  it("valida a data de validade", () => {
    const now = new Date(2026, 10, 23);
    expect(isValidExpiry("11/26", now)).toBe(true);
    expect(isValidExpiry("10/26", now)).toBe(false);
    expect(isValidExpiry("13/30", now)).toBe(false);
  });
});

describe("máscaras", () => {
  it("formatam enquanto o usuário digita", () => {
    expect(maskCep("01001000")).toBe("01001-000");
    expect(maskCpf("5299822")).toBe("529.982.2");
    expect(maskPhone("11900000000")).toBe("(11) 90000-0000");
    expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
  });
});
