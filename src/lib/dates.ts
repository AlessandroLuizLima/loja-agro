/**
 * Datas de retirada/entrega. Trabalha com strings AAAA-MM-DD no fuso de São Paulo,
 * para o servidor (geralmente em UTC) e o navegador concordarem sobre "hoje".
 */

export const TIME_ZONE = "America/Sao_Paulo";

export const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const isoFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

export function todayISO(now = new Date()) {
  return isoFmt.format(now);
}

const toUTC = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export function addDays(iso: string, n: number) {
  const d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const weekdayOf = (iso: string) => toUTC(iso).getUTCDay();

/** Próximas `count` datas que caem nos dias da semana informados, a partir de `from` + `startOffset` dias. */
export function upcomingDates(days: number[], from: string, count: number, startOffset = 0) {
  const out: string[] = [];
  for (let i = startOffset; i < startOffset + 28 && out.length < count; i++) {
    const d = addDays(from, i);
    if (days.includes(weekdayOf(d))) out.push(d);
  }
  return out;
}

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** "Hoje", "Amanhã" ou "qui, 26/11" */
export function dateLabel(iso: string, today: string) {
  if (iso === today) return `Hoje, ${ddmm(iso)}`;
  if (iso === addDays(today, 1)) return `Amanhã, ${ddmm(iso)}`;
  return `${SHORT[weekdayOf(iso)]}, ${ddmm(iso)}`;
}

/** "quinta-feira, 26/11" */
export function longDate(iso: string) {
  const w = weekdayOf(iso);
  const name = WEEKDAYS[w].toLowerCase();
  return `${w === 0 || w === 6 ? name : `${name}-feira`}, ${ddmm(iso)}`;
}

/** Resumo legível dos dias: "Todos os dias", "Seg a Sáb", "Ter e Qui". */
export function daysSummary(days: number[]) {
  const sorted = [...new Set(days)].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  if (sorted.length === 0) return "Sem dias definidos";
  if (sorted.length === 7) return "Todos os dias";
  const cap = (i: number) => SHORT[i][0].toUpperCase() + SHORT[i].slice(1);
  const contiguous = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (contiguous && sorted.length >= 3) return `${cap(sorted[0])} a ${cap(sorted.at(-1)!)}`;
  const names = sorted.map(cap);
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} e ${names.at(-1)}`;
}
