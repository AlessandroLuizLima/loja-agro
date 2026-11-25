import { dateLabel, todayISO } from "./dates";
import { brl, whatsappNumber } from "./format";
import { ON_DELIVERY_LABEL, type Order, type Settings } from "./types";

/** Link "clique para conversar" do WhatsApp, com mensagem pronta. Não precisa de API paga. */
export function waLink(phone: string, text?: string) {
  return `https://wa.me/${whatsappNumber(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

function fulfillmentLine(order: Order) {
  const when = dateLabel(order.fulfillment.date, todayISO());
  return order.fulfillment.type === "retirada" ? `Retirada na loja: ${when}` : `Entrega (${order.fulfillment.zoneName}): ${when}`;
}

function paymentLine(order: Order) {
  if (order.payment.method === "pix") return `Pagamento: Pix pelo site${order.paymentStatus === "pago" ? " (pago)" : ""}`;
  const how = order.payment.onDelivery ? ON_DELIVERY_LABEL[order.payment.onDelivery] : "";
  const change = order.payment.changeFor ? ` (troco para ${brl(order.payment.changeFor)})` : "";
  return `Pagamento: na ${order.fulfillment.type === "retirada" ? "retirada" : "entrega"} – ${how}${change}`;
}

/** Mensagem que o cliente manda para a loja logo após finalizar o pedido. */
export function orderMessageForStore(order: Order) {
  const items = order.items.map((i) => `• ${i.qty}x ${i.name} – ${brl(i.lineTotal)}`).join("\n");
  const address = order.fulfillment.address;
  return [
    `Olá! Fiz o pedido *#${order.number}* pelo site.`,
    "",
    items,
    "",
    `*Total: ${brl(order.totals.total)}*`,
    fulfillmentLine(order),
    address ? `Endereço: ${address.street}, ${address.number} – ${address.district}${address.cep ? `, CEP ${address.cep}` : ""}${address.reference ? ` (${address.reference})` : ""}` : "",
    paymentLine(order),
    order.notes ? `Obs.: ${order.notes}` : "",
    "",
    `Nome: ${order.customer.name}`,
  ]
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n");
}

/** Mensagem que a loja manda para o cliente, de acordo com o andamento do pedido. */
export function statusMessageForCustomer(order: Order, settings: Pick<Settings, "storeName" | "address" | "city">) {
  const first = order.customer.name.split(" ")[0];
  const n = `#${order.number}`;
  const when = dateLabel(order.fulfillment.date, todayISO()).toLowerCase();
  const pickup = order.fulfillment.type === "retirada";
  switch (order.status) {
    case "novo":
    case "confirmado":
      return `Olá, ${first}! Aqui é da ${settings.storeName}. Seu pedido ${n} foi confirmado ✅ ${pickup ? `Pode retirar ${when} em ${settings.address}.` : `A entrega está programada para ${when}.`} Total: ${brl(order.totals.total)}.`;
    case "pronto":
      return pickup
        ? `Olá, ${first}! Seu pedido ${n} já está separado e pronto para retirada na ${settings.storeName} (${settings.address}). Até logo!`
        : `Olá, ${first}! Seu pedido ${n} já está separado e sai para entrega ${when}.`;
    case "em_rota":
      return `Olá, ${first}! Seu pedido ${n} saiu para entrega 🚚 Em breve chega aí.`;
    case "concluido":
      return `Olá, ${first}! Obrigado pela compra na ${settings.storeName} 🌱 Qualquer coisa, é só chamar aqui.`;
    case "cancelado":
      return `Olá, ${first}. Seu pedido ${n} na ${settings.storeName} foi cancelado. Se tiver dúvidas, é só responder esta mensagem.`;
  }
}
