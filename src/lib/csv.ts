/**
 * Planilha CSV no formato que o Excel em português usa: separador ";", UTF-8 com BOM (acentos certos)
 * e números com vírgula. Na leitura também aceita "," como separador (Google Planilhas, LibreOffice).
 */

/** Lê o texto do CSV em linhas e colunas. Aceita aspas, ";" ou "," e quebras de linha dentro de aspas. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const sep = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  // Linhas totalmente vazias (comuns no fim do arquivo) não contam
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const quote = (v: string) => (/[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Monta o CSV para baixar (abre direto no Excel com acentos corretos). */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  return "﻿" + rows.map((r) => r.map((v) => quote(v == null ? "" : String(v))).join(";")).join("\r\n") + "\r\n";
}

/** Número em reais no padrão brasileiro para a planilha: 54.9 -> "54,90". */
export const csvMoney = (n: number | null) => (n == null ? "" : n.toFixed(2).replace(".", ","));
