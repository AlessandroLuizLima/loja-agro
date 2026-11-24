import "server-only";
import { headers } from "next/headers";

/**
 * IP de quem fez o pedido. Em produção o Caddy (deploy/) repassa o IP real em X-Forwarded-For.
 * Serve para limitar tentativas de login e para o registro de acessos, nunca como identificação.
 */
export async function clientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || h.get("x-real-ip") || "local").slice(0, 64);
}
