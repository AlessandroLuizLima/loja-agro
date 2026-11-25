import "server-only";
import { adminUrl } from "../admin-path";
import { brl } from "../format";
import { orderMessageForStore } from "../whatsapp";
import { emailStore } from "./messaging";
import { getOrder } from "./orders";
import { getSettings, siteUrl } from "./settings";

/**
 * Avisa a loja por e-mail que entrou um pedido (com Resend configurado), sem depender de o cliente
 * tocar em "Avisar a loja no WhatsApp". Vai para o e-mail de Configurações.
 */
export async function notifyNewOrder(orderId: string) {
  const order = getOrder(orderId);
  const s = getSettings();
  if (!order || !s.email) return;
  const body = [
    `Novo pedido pelo site (#${order.number}).`,
    "",
    orderMessageForStore(order).replace(/\*/g, "").replace(/^Olá! Fiz o pedido #\d+ pelo site\.\n\n/, ""),
    `Celular: ${order.customer.phone}${order.customer.email ? ` · E-mail: ${order.customer.email}` : ""}`,
    "",
    `Abrir no painel: ${siteUrl(s)}${adminUrl(`/pedidos/${order.id}`)}`,
  ].join("\n");
  await emailStore(s.email, `Novo pedido #${order.number} – ${order.customer.name} – ${brl(order.totals.total)}`, body);
}
