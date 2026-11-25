import { describe, expect, it } from "vitest";
import { csvMoney, parseCsv, toCsv } from "./csv";

describe("planilha CSV", () => {
  it("lê o formato do Excel em português (; e BOM) com aspas e quebra de linha", () => {
    const text = '﻿nome;preco\r\n"Ração ""Premium""; 15 kg";54,90\r\n"Linha\ncom quebra";1\r\n\r\n';
    expect(parseCsv(text)).toEqual([
      ["nome", "preco"],
      ['Ração "Premium"; 15 kg', "54,90"],
      ["Linha\ncom quebra", "1"],
    ]);
  });

  it("lê o formato com vírgula (Google Planilhas)", () => {
    expect(parseCsv("nome,preco\nMilho,\"54.90\"\n")).toEqual([
      ["nome", "preco"],
      ["Milho", "54.90"],
    ]);
  });

  it("escreve e lê de volta sem perder nada", () => {
    const rows = [["nome", "obs"], ['Saco "grande"', "a;b"]];
    expect(parseCsv(toCsv(rows))).toEqual(rows);
    expect(csvMoney(54.9)).toBe("54,90");
    expect(csvMoney(null)).toBe("");
  });
});
