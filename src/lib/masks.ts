import { onlyDigits } from "./pricing";

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

export const maskCep = (v: string) => apply(onlyDigits(v).slice(0, 8), "#####-###");
export const maskCpf = (v: string) => apply(onlyDigits(v).slice(0, 11), "###.###.###-##");
export const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return apply(d, d.length > 10 ? "(##) #####-####" : "(##) ####-####");
};
export const maskCard = (v: string) => apply(onlyDigits(v).slice(0, 16), "#### #### #### ####");
export const maskExpiry = (v: string) => apply(onlyDigits(v).slice(0, 4), "##/##");
