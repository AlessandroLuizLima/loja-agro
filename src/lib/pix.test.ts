import { describe, expect, it } from "vitest";
import { formatPhone, slugify, whatsappNumber } from "./format";
import { crc16, pixPayload } from "./pix";

describe("Pix copia e cola", () => {
  it("calcula o CRC16-CCITT padrão", () => {
    expect(crc16("123456789")).toBe("29B1");
  });

  it("monta o BR Code com chave, valor, nome e cidade", () => {
    const code = pixPayload({ key: "contato@loja.com.br", name: "Agro São José", city: "São Roque", amount: 98.9, txid: "PED-1001" });
    expect(code.startsWith("000201")).toBe(true);
    expect(code).toContain("0014br.gov.bcb.pix0119contato@loja.com.br");
    expect(code).toContain("540598.90");
    expect(code).toContain("5913Agro Sao Jose");
    expect(code).toContain("6009Sao Roque");
    expect(code).toContain("0507PED1001");
    // o CRC final confere com o resto do código
    expect(code.slice(-4)).toBe(crc16(code.slice(0, -4)));
  });

  it("limita nome a 25 e cidade a 15 caracteres", () => {
    const code = pixPayload({ key: "k", name: "A".repeat(40), city: "B".repeat(30) });
    expect(code).toContain(`5925${"A".repeat(25)}`);
    expect(code).toContain(`6015${"B".repeat(15)}`);
    expect(code).not.toContain("54"); // sem valor: o cliente digita
  });
});

describe("formatação", () => {
  it("cria endereços amigáveis", () => {
    expect(slugify("Ração p/ Cães – 15 kg!")).toBe("racao-p-caes-15-kg");
  });
  it("formata e normaliza telefones", () => {
    expect(formatPhone("5511987654321")).toBe("(11) 98765-4321");
    expect(whatsappNumber("(11) 98765-4321")).toBe("5511987654321");
    expect(whatsappNumber("5511987654321")).toBe("5511987654321");
  });
});
