import { countOrdersByStatus, latestOrder } from "@/lib/server/orders";
import { getCurrentUser } from "@/lib/server/users";

/** Consultado pelo painel aberto a cada 20 segundos: há pedido novo? */
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin" || user.mustChangePassword) return Response.json({ error: "Não autorizado" }, { status: 401 });
  return Response.json(
    { latest: latestOrder() ?? null, novos: countOrdersByStatus().novo ?? 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}
