import { describe, expect, it } from "vitest";
import { computeTotals, zoneFee } from "./pricing";

const racao = { price: 159.9, qty: 2 }; // 319,80
const milho = { price: 54.9, qty: 1 };

describe("computeTotals", () => {
  it("soma itens e quantidades", () => {
    const t = computeTotals({ lines: [racao, milho] });
    expect(t.subtotal).toBe(374.7);
    expect(t.itemCount).toBe(3);
    expect(t.total).toBe(374.7);
  });

  it("aplica cupom só acima do valor mínimo", () => {
    const coupon = { code: "BEMVINDO10", percent: 10, minSubtotal: 100 };
    expect(computeTotals({ lines: [racao], coupon }).couponDiscount).toBe(31.98);
    const small = computeTotals({ lines: [milho], coupon });
    expect(small.couponDiscount).toBe(0);
    expect(small.couponError).toMatch(/a partir de R\$ 100,00/);
  });

  it("cobra a taxa da zona e zera acima do valor de entrega grátis", () => {
    const zone = { fee: 15, freeAbove: 300 };
    expect(computeTotals({ lines: [milho], zone }).total).toBe(69.9);
    expect(computeTotals({ lines: [racao], zone }).deliveryFee).toBe(0);
    expect(zoneFee({ fee: 8, freeAbove: null }, 10_000)).toBe(8);
  });

  it("dá desconto no Pix sobre os produtos, não sobre a entrega", () => {
    const t = computeTotals({ lines: [milho], zone: { fee: 15, freeAbove: null }, payment: "pix", pixDiscountPercent: 10 });
    expect(t.pixDiscount).toBe(5.49);
    expect(t.total).toBe(64.41);
    expect(computeTotals({ lines: [milho], payment: "na_entrega", pixDiscountPercent: 10 }).pixDiscount).toBe(0);
  });

  it("entrega grátis considera o valor já com cupom", () => {
    const t = computeTotals({ lines: [{ price: 310, qty: 1 }], coupon: { code: "X", percent: 10, minSubtotal: 0 }, zone: { fee: 15, freeAbove: 300 } });
    expect(t.merchandise).toBe(279);
    expect(t.deliveryFee).toBe(15);
  });
});
