import "server-only";
import { upcomingDates } from "../dates";
import type { DeliveryZone, Settings } from "../types";

/** Datas que o cliente pode escolher no checkout. A mesma regra vale na tela e na validação do pedido. */
export const checkoutDates = {
  /** Retirada: a partir de hoje, nos dias em que a loja abre */
  pickup: (s: Pick<Settings, "pickupDays">, today: string) => upcomingDates(s.pickupDays, today, 6, 0),
  /** Entrega: a partir de amanhã, nos dias da rota da região */
  delivery: (z: Pick<DeliveryZone, "days">, today: string) => upcomingDates(z.days, today, 3, 1),
};
