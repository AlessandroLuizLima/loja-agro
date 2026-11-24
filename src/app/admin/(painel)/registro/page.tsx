import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { AUDIT_LABELS, countLoginAlerts, listAudit } from "@/lib/server/audit";

export const metadata: Metadata = { title: "Segurança" };

const ALERTS = new Set(["login_falhou", "login_bloqueado"]);

export default async function AuditPage() {
  await connection();
  const entries = listAudit(300);
  const alerts = countLoginAlerts(7);

  return (
    <>
      <PageHeader title="Segurança" subtitle="Registro de quem entrou no painel e do que foi alterado. Fica guardado por 12 meses." />

      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="flex items-center gap-2 font-display font-bold text-petrol">
            <ShieldCheck className="size-5 text-emerald-600" /> Proteções ativas
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>• Login bloqueado por 15 minutos após 5 senhas erradas</li>
            <li>• Sessão do painel expira em 12 horas</li>
            <li>• Trocar a senha desconecta os outros aparelhos</li>
            <li>• Dados de pedidos antigos removidos automaticamente (LGPD)</li>
          </ul>
        </Card>
        <Card>
          <p className={`flex items-center gap-2 font-display font-bold ${alerts > 0 ? "text-red-600" : "text-petrol"}`}>
            <AlertTriangle className="size-5" /> {alerts} {alerts === 1 ? "tentativa" : "tentativas"} de login com erro em 7 dias
          </p>
          <p className="mt-2 text-sm text-muted">
            Se você não reconhece tentativas de login, troque a senha em Configurações. Uma senha forte e só sua é a melhor proteção do painel.
          </p>
        </Card>
      </div>

      {entries.length === 0 ? (
        <EmptyState emoji="🛡️" text="Nenhum registro ainda." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Quando</th>
                <th className="px-4 py-3 font-semibold">Quem</th>
                <th className="px-4 py-3 font-semibold">O que</th>
                <th className="px-4 py-3 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((e) => (
                <tr key={e.id} className={ALERTS.has(e.action) ? "bg-red-50/60" : undefined}>
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted">{formatDateTime(e.at)}</td>
                  <td className="px-4 py-2.5 break-all">{e.userEmail ?? <span className="text-muted">Sistema / cliente</span>}</td>
                  <td className="px-4 py-2.5">
                    <span className={ALERTS.has(e.action) ? "font-semibold text-red-700" : ""}>{AUDIT_LABELS[e.action] ?? e.action}</span>
                    {e.detail && <span className="text-muted"> · {e.detail}</span>}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{e.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
