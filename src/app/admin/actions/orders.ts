"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { setPaymentStatus, updateOrderStatus } from "@/lib/server/orders";
import { requireAdmin } from "@/lib/server/users";
import { ORDER_STATUSES } from "@/lib/types";

export async function setOrderStatusAction(fd: FormData) {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid(), status: z.enum(ORDER_STATUSES) }).safeParse({ id: fd.get("id"), status: fd.get("status") });
  if (parsed.success) updateOrderStatus(parsed.data.id, parsed.data.status);
  refresh();
}

export async function setPaymentStatusAction(fd: FormData) {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid(), status: z.enum(["pendente", "pago"]) }).safeParse({ id: fd.get("id"), status: fd.get("status") });
  if (parsed.success) setPaymentStatus(parsed.data.id, parsed.data.status);
  refresh();
}
