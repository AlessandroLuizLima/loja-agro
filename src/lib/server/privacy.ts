import "server-only";
import type { OrderPayload } from "../types";
import { auditSystem } from "./audit";
import { db, transaction } from "./db";
import { pruneAttempts } from "./rate-limit";

/**
 * LGPD: exclusão e anonimização de dados pessoais.
 *
 * Pedidos não são apagados (são registro de venda e de estoque): perdem nome, telefone,
 * e-mail, endereço e observações, e ficam só com produtos, valores e datas.
 */

export const ANON_NAME = "Cliente removido";

function anonymizePayload(json: string) {
  const p = JSON.parse(json) as OrderPayload;
  p.customer = { name: ANON_NAME, phone: "", email: "" };
  if (p.fulfillment.type === "entrega") p.fulfillment.address = { street: "Endereço removido", number: "", district: "", reference: "" };
  p.notes = "";
  return JSON.stringify(p);
}

/** Remove os dados pessoais de um pedido. Devolve false se já estava anonimizado. */
export function anonymizeOrder(id: string) {
  const conn = db();
  const row = conn.prepare("SELECT payload FROM orders WHERE id = ? AND anonymized_at IS NULL").get(id) as { payload: string } | undefined;
  if (!row) return false;
  conn
    .prepare("UPDATE orders SET payload = ?, customer_name = ?, customer_phone = '', user_id = NULL, anonymized_at = datetime('now') WHERE id = ?")
    .run(anonymizePayload(row.payload), ANON_NAME, id);
  return true;
}

/** Exclui a conta do cliente e anonimiza todos os pedidos dela. Devolve quantos pedidos foram anonimizados. */
export function deleteCustomer(userId: string) {
  const conn = db();
  return transaction(conn, () => {
    const ids = conn.prepare("SELECT id FROM orders WHERE user_id = ?").all(userId) as { id: string }[];
    let n = 0;
    for (const { id } of ids) if (anonymizeOrder(id)) n++;
    conn.prepare("DELETE FROM users WHERE id = ? AND role = 'cliente'").run(userId);
    return n;
  });
}

/**
 * Prazo de guarda: pedidos concluídos ou cancelados há mais de `months` meses perdem os dados pessoais.
 * O registro de acessos é guardado por 12 meses.
 */
export function runRetention(months: number) {
  const conn = db();
  const ids = conn
    .prepare(
      `SELECT id FROM orders WHERE anonymized_at IS NULL AND status IN ('concluido', 'cancelado')
       AND updated_at < datetime('now', ?)`,
    )
    .all(`-${Math.max(1, Math.floor(months))} months`) as { id: string }[];
  let n = 0;
  for (const { id } of ids) if (anonymizeOrder(id)) n++;
  const { changes: logs } = conn.prepare("DELETE FROM audit_log WHERE at < datetime('now', '-12 months')").run();
  pruneAttempts();
  if (n > 0 || Number(logs) > 0) auditSystem("limpeza_lgpd", `${n} pedido(s) anonimizado(s), ${logs} registro(s) antigo(s) apagado(s)`);
  return n;
}

const globalForRetention = globalThis as unknown as { lojaRetentionAt?: number };

/** Roda a limpeza no máximo a cada 6 horas (chamado ao abrir o painel). */
export function runRetentionIfDue(months: number) {
  const now = Date.now();
  if (globalForRetention.lojaRetentionAt && now - globalForRetention.lojaRetentionAt < 6 * 60 * 60_000) return;
  globalForRetention.lojaRetentionAt = now;
  runRetention(months);
}
