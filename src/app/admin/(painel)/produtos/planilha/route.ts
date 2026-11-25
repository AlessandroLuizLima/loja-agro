import { audit } from "@/lib/server/audit";
import { exportProductsCsv, templateCsv } from "@/lib/server/product-import";
import { getCurrentUser } from "@/lib/server/users";

/** Baixa a planilha de produtos (?modelo=1 baixa o modelo vazio com dois exemplos). */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin" || user.mustChangePassword) return new Response("Não autorizado", { status: 401 });
  const template = new URL(req.url).searchParams.has("modelo");
  if (!template) await audit(user.email, "produtos_exportados");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(template ? templateCsv() : exportProductsCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${template ? "modelo-produtos" : `produtos-${date}`}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
