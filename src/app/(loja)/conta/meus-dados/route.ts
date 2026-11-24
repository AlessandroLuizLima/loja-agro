import { audit } from "@/lib/server/audit";
import { exportCustomerData } from "@/lib/server/privacy";
import { getCurrentUser } from "@/lib/server/users";

/** LGPD (acesso e portabilidade): o cliente baixa tudo o que a loja guarda sobre ele, em JSON. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Faça login para baixar seus dados.", { status: 401 });
  const data = exportCustomerData(user.id);
  await audit(null, "dados_exportados");
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meus-dados.json"',
      "Cache-Control": "no-store",
    },
  });
}
