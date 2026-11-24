import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";
import { createToken, readToken } from "./token";

const SECRET = "x".repeat(40);

describe("senhas", () => {
  it("gera hash com sal e verifica corretamente", async () => {
    const hash = await hashPassword("pet12345");
    expect(hash).not.toContain("pet12345");
    expect(await hashPassword("pet12345")).not.toBe(hash);
    expect(await verifyPassword("pet12345", hash)).toBe(true);
    expect(await verifyPassword("errada123", hash)).toBe(false);
  });
});

describe("token de sessão", () => {
  it("lê um token válido", () => {
    const token = createToken({ uid: "u1", exp: Date.now() + 60_000 }, SECRET);
    expect(readToken(token, SECRET)?.uid).toBe("u1");
  });
  it("recusa token adulterado, expirado ou com outro segredo", () => {
    const token = createToken({ uid: "u1", exp: Date.now() + 60_000 }, SECRET);
    const [data, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ uid: "admin", exp: Date.now() + 60_000 })).toString("base64url");
    expect(readToken(`${forged}.${sig}`, SECRET)).toBeNull();
    expect(readToken(`${data}.${sig}`, "y".repeat(40))).toBeNull();
    expect(readToken(createToken({ uid: "u1", exp: Date.now() - 1 }, SECRET), SECRET)).toBeNull();
    expect(readToken(undefined, SECRET)).toBeNull();
  });
});

describe("versão da sessão", () => {
  it("guarda a versão e recusa versão inválida", () => {
    expect(readToken(createToken({ uid: "u1", sv: 3, exp: Date.now() + 60_000 }, SECRET), SECRET)?.sv).toBe(3);
    const data = Buffer.from(JSON.stringify({ uid: "u1", sv: "3", exp: Date.now() + 60_000 })).toString("base64url");
    const forged = createToken({ uid: "u1", exp: Date.now() + 60_000 }, SECRET).split(".")[1];
    expect(readToken(`${data}.${forged}`, SECRET)).toBeNull();
  });
});
