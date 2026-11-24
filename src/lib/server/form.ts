import "server-only";
import { z } from "zod";
import { parseMoney } from "../masks";

/** Utilitários para ler formulários do painel. */

export function fieldErrorsOf(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

/** Converte FormData em objeto simples (só os campos de texto). */
export const formText = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;

export const isChecked = (fd: FormData, name: string) => fd.get(name) === "on";

/** Lista de dias da semana enviada por checkboxes com o mesmo nome */
export const weekdays = (fd: FormData, name: string) =>
  [...new Set(fd.getAll(name).map(Number))].filter((n) => Number.isInteger(n) && n >= 0 && n <= 6).sort((a, b) => a - b);

/** Arquivo enviado (ignora o campo vazio que o navegador manda quando nada foi escolhido) */
export function uploadedFile(fd: FormData, name: string) {
  const f = fd.get(name);
  return f instanceof File && f.size > 0 ? f : null;
}

/** "R$ 1.234,50", "1234,5" ou "1234.50" -> 1234.5 */
export const moneyField = (msg = "Valor inválido.") =>
  z
    .string()
    .trim()
    .min(1, msg)
    .transform(parseMoney)
    .refine((n) => Number.isFinite(n) && n >= 0 && n < 1_000_000, msg)
    .transform((n) => Math.round(n * 100) / 100);

export const optionalMoney = (msg = "Valor inválido.") =>
  z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : parseMoney(s)))
    .refine((n) => n === null || (Number.isFinite(n) && n >= 0 && n < 1_000_000), msg)
    .transform((n) => (n === null ? null : Math.round(n * 100) / 100));
