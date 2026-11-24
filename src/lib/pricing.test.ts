import { describe, expect, it } from "vitest";
import { computeTotals, FREE_SHIPPING_MIN, maxInstallments, shippingOptions } from "./pricing";

const racao = "racao-premium-caes-adultos-frango-15kg"; // R$ 199,90
const shampoo = "shampoo-neutro-hipoalergenico-500ml"; // R$ 32,90

describe("computeTotals", () => {
  it("soma itens e ignora produtos inexistentes", () => {
    const t = computeTotals({ items: [{ slug: shampoo, qty: 2 }, { slug: "nao-existe", qty: 1 }] });
    expect(t.lines).toHaveLength(1);
    expect(t.subtotal).toBe(65.8);
    expect(t.itemCount).toBe(2);
  });

  it("limita a quantidade a 10 por item", () => {
    const t = computeTotals({ items: [{ slug: shampoo, qty: 99 }] });
    expect(t.lines[0].qty).toBe(10);
  });

  it("aplica cupom válido e recusa cupom abaixo do mínimo", () => {
    expect(computeTotals({ items: [{ slug: racao, qty: 1 }], couponCode: "bemvindo10" }).couponDiscount).toBe(19.99);
    const low = computeTotals({ items: [{ slug: shampoo, qty: 1 }], couponCode: "BEMVINDO10" });
    expect(low.couponDiscount).toBe(0);
    expect(low.couponError).toMatch(/acima de/);
    expect(computeTotals({ items: [{ slug: shampoo, qty: 1 }], couponCode: "FAKE" }).couponError).toBeDefined();
  });

  it("dá 5% no Pix sobre os produtos, sem descontar o frete", () => {
    const t = computeTotals({ items: [{ slug: shampoo, qty: 1 }], cep: "01001-000", shippingId: "sedex", payment: "pix" });
    expect(t.pixDiscount).toBe(1.65);
    expect(t.total).toBe(32.9 - 1.65 + 24.9);
  });

  it("frete PAC grátis a partir de R$ 199 já com cupom", () => {
    const t = computeTotals({ items: [{ slug: racao, qty: 1 }], cep: "01001000", shippingId: "pac" });
    expect(t.shippingPrice).toBe(0);
    const withCoupon = computeTotals({ items: [{ slug: racao, qty: 1 }], couponCode: "ASSINE15", cep: "01001000", shippingId: "pac" });
    expect(withCoupon.shippingPrice).toBeGreaterThan(0);
    expect(withCoupon.missingForFreeShipping).toBeCloseTo(FREE_SHIPPING_MIN - 169.91, 2);
  });
});

describe("shippingOptions", () => {
  it("não retorna opções sem CEP completo", () => {
    expect(shippingOptions("0100", 50)).toEqual([]);
  });
  it("cobra mais fora do Sudeste", () => {
    const sp = shippingOptions("01001-000", 50).find((o) => o.id === "pac")!;
    const ba = shippingOptions("40000-000", 50).find((o) => o.id === "pac")!;
    expect(ba.price).toBeGreaterThan(sp.price);
  });
});

describe("maxInstallments", () => {
  it("respeita parcela mínima de R$ 20 e máximo de 6x", () => {
    expect(maxInstallments(15)).toBe(1);
    expect(maxInstallments(65)).toBe(3);
    expect(maxInstallments(1000)).toBe(6);
  });
});
