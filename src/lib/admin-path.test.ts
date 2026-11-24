import { describe, expect, it } from "vitest";
import { adminSlug } from "./admin-path";

describe("endereço do painel", () => {
  it("usa o endereço configurado quando é válido", () => {
    expect(adminSlug("gestao-7k2mq9")).toBe("gestao-7k2mq9");
    expect(adminSlug("/Gestao-7K2MQ9/")).toBe("gestao-7k2mq9");
  });
  it("cai no /admin padrão quando está vazio, curto, inválido ou ocupa rota da loja", () => {
    expect(adminSlug(undefined)).toBeNull();
    expect(adminSlug("")).toBeNull();
    expect(adminSlug("abc")).toBeNull();
    expect(adminSlug("painel secreto")).toBeNull();
    expect(adminSlug("checkout")).toBeNull();
  });
});
