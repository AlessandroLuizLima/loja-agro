"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/server/audit";
import { getOrder, setPaymentStatus, updateOrderStatus } from "@/lib/server/orders";
import { anonymizeOrder } from "@/lib/server/privacy";
import { requireAdmin } from "@/lib/server/users";
import { ORDER_STATUSES } from "@/lib/types";

export async function setOrderStatusAction(fd: FormData) {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.uuid(), status: z.enum(ORDER_STATUSES) }).safeParse({ id: fd.get("id"), status: fd.get("status") });
  if (parsed.success && updateOrderStatus(parsed.data.id, parsed.data.status)) {
    await audit(admin.email, "pedido_etapa", `#${getOrder(parsed.data.id)?.number} → ${parsed.data.status}`);
  }
  refresh();
}

export async function setPaymentStatusAction(fd: FormData) {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.uuid(), status: z.enum(["pendente", "pago"]) }).safeParse({ id: fd.get("id"), status: fd.get("status") });
  if (parsed.success) {
    setPaymentStatus(parsed.data.id, parsed.data.status);
    await audit(admin.email, "pedido_pagamento", `#${getOrder(parsed.data.id)?.number} → ${parsed.data.status}`);
  }
  refresh();
}

/** LGPD: atende o pedido de um cliente sem cadastro para apagar os dados dele. */
export async function anonymizeOrderAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(fd.get("id"));
  if (id.success) {
    const number = getOrder(id.data)?.number;
    if (anonymizeOrder(id.data)) await audit(admin.email, "pedido_anonimizado", `#${number}`);
  }
  refresh();
}
