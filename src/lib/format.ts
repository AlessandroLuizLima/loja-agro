const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const brl = (value: number) => currency.format(value);

export const discountPercent = (price: number, oldPrice?: number | null) => (oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0);

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** "Ração Cães 15 kg" -> "racao-caes-15-kg" */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Texto sem acentos e em minúsculas, para buscas. */
export const normalizeText = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** "5511900000000" -> "(11) 90000-0000" */
export function formatPhone(value: string) {
  let d = onlyDigits(value);
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return value;
}

/** Telefone brasileiro para links do WhatsApp: sempre com o 55 na frente. */
export function whatsappNumber(value: string) {
  const d = onlyDigits(value);
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}

const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Sao_Paulo" });

/** Datas do SQLite ("2026-11-23 14:02:10", em UTC) */
const parseDb = (s: string) => new Date(s.replace(" ", "T") + "Z");
export const formatDateTime = (s: string) => dateTimeFmt.format(parseDb(s));
export const formatDate = (s: string) => dateFmt.format(parseDb(s));
