"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/server/audit";
import { deleteCustomer } from "@/lib/server/privacy";
import { requireAdmin } from "@/lib/server/users";

/** LGPD: atende o pedido de exclusão de um cliente cadastrado (conta apagada, pedidos sem dados pessoais). */
export async function deleteCustomerAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(fd.get("id"));
  if (id.success) {
    const orders = deleteCustomer(id.data);
    await audit(admin.email, "cliente_excluido", `${orders} pedido(s) anonimizado(s)`);
  }
  refresh();
}
