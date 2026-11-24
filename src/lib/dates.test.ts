import { describe, expect, it } from "vitest";
import { addDays, dateLabel, daysSummary, longDate, todayISO, upcomingDates, weekdayOf } from "./dates";

describe("datas de retirada e entrega", () => {
  it("usa o fuso de São Paulo para saber que dia é hoje", () => {
    // 23/11/2026 às 01h UTC ainda é dia 22 em São Paulo (UTC-3)
    expect(todayISO(new Date("2026-11-23T01:00:00Z"))).toBe("2026-11-22");
    expect(todayISO(new Date("2026-11-23T12:00:00Z"))).toBe("2026-11-23");
  });

  it("soma dias atravessando o mês", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(weekdayOf("2026-11-23")).toBe(1); // segunda
  });

  it("lista as próximas datas nos dias da semana escolhidos", () => {
    // a partir de segunda 23/11, só terças e quintas, sem contar hoje
    expect(upcomingDates([2, 4], "2026-11-23", 3, 1)).toEqual(["2026-11-24", "2026-11-26", "2026-12-01"]);
    // loja fechada no domingo
    expect(upcomingDates([1, 2, 3, 4, 5, 6], "2026-11-28", 2)).toEqual(["2026-11-28", "2026-11-30"]);
  });

  it("escreve as datas de forma amigável", () => {
    expect(dateLabel("2026-11-23", "2026-11-23")).toBe("Hoje, 23/11");
    expect(dateLabel("2026-11-24", "2026-11-23")).toBe("Amanhã, 24/11");
    expect(dateLabel("2026-11-26", "2026-11-23")).toBe("qui, 26/11");
    expect(longDate("2026-11-26")).toBe("quinta-feira, 26/11");
    expect(longDate("2026-11-28")).toBe("sábado, 28/11");
  });

  it("resume os dias da semana", () => {
    expect(daysSummary([1, 2, 3, 4, 5, 6])).toBe("Seg a Sáb");
    expect(daysSummary([4, 2])).toBe("Ter e Qui");
    expect(daysSummary([0, 1, 2, 3, 4, 5, 6])).toBe("Todos os dias");
    expect(daysSummary([])).toBe("Sem dias definidos");
  });
});
