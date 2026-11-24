import { onlyDigits } from "./format";

const apply = (digits: string, pattern: string) => {
  let out = "";
  let i = 0;
  for (const ch of pattern) {
    if (i >= digits.length) break;
    if (ch === "#") out += digits[i++];
    else out += ch;
  }
  return out;
};

export const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return apply(d, d.length > 10 ? "(##) #####-####" : "(##) ####-####");
};

export const maskCnpj = (v: string) => apply(onlyDigits(v).slice(0, 14), "##.###.###/####-##");

/** Valor em reais digitado livremente ("12,5" ou "12.50") -> número */
export const parseMoney = (v: string) => {
  const n = Number(v.replace(/\s|R\$/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};
