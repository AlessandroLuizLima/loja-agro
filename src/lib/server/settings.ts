import "server-only";
import type { Settings } from "../types";
import { db } from "./db";

/** Valores iniciais. Tudo é editável em Painel > Configurações. */
export const DEFAULT_SETTINGS: Settings = {
  storeName: "Agro Boa Terra",
  tagline: "Agropecuária e pet shop",
  logoImageId: null,
  colorBrand: "#e8862a",
  colorPetrol: "#2f5d2b",
  announcement: "Retire na loja sem pagar frete · Entregamos na sua casa",
  heroTitle: "Tudo para seus animais, sua horta e seu jardim",
  heroSubtitle: "Veja preço e estoque na hora, compre pelo site e retire na loja ou receba na sua casa.",
  about:
    "Somos uma agropecuária de família, atendendo produtores, famílias e tutores de pets da região há anos. Aqui você encontra rações, sal mineral, sementes, ferramentas e produtos veterinários, com atendimento de quem entende do campo.",
  whatsapp: "5511900000000",
  email: "contato@agroboaterra.com.br",
  address: "Rua do Comércio, 100 – Centro",
  city: "São Roque",
  state: "SP",
  hours: "Seg a Sex, 7h30 às 18h · Sáb, 7h30 às 13h",
  instagram: "",
  facebook: "",
  legalName: "Agro Boa Terra Comércio de Produtos Agropecuários LTDA",
  cnpj: "00.000.000/0001-00",
  pixKey: "",
  pixName: "Agro Boa Terra",
  pixDiscountPercent: 3,
  pickupEnabled: true,
  pickupDays: [1, 2, 3, 4, 5, 6],
  pickupNote: "Separamos em até 2 horas no horário de funcionamento.",
  siteUrl: "",
};

export function getSettings(): Settings {
  const rows = db().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const stored: Partial<Settings> = {};
  for (const r of rows) {
    if (r.key in DEFAULT_SETTINGS) {
      try {
        (stored as Record<string, unknown>)[r.key] = JSON.parse(r.value);
      } catch {
        /* valor corrompido: fica o padrão */
      }
    }
  }
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveSettings(patch: Partial<Settings>) {
  const stmt = db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  for (const [key, value] of Object.entries(patch)) {
    if (key in DEFAULT_SETTINGS && value !== undefined) stmt.run(key, JSON.stringify(value));
  }
}

/** Endereço público do site: o configurado no painel, ou a variável de ambiente, ou localhost. */
export function siteUrl(settings: Settings) {
  return (settings.siteUrl || process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/** O que os cards de produto precisam saber da loja. Sem chave Pix, não há desconto no Pix. */
export function storeInfo(s: Settings) {
  return { whatsapp: s.whatsapp, pixPercent: s.pixKey ? s.pixDiscountPercent : 0 };
}
