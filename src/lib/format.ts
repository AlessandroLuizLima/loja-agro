const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const brl = (value: number) => currency.format(value);

export const discountPercent = (price: number, oldPrice?: number) =>
  oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;
