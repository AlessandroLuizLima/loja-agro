import "server-only";
import { db } from "./db";
import { clientIp } from "./request";

/**
 * Registro de acessos e alterações do painel: quem fez, o quê, quando e de onde.
 * Guardado por 12 meses (ver privacy.ts), para investigar um acesso indevido.
 */

export type AuditEntry = { id: number; at: string; userEmail: string | null; action: string; detail: string; ip: string };

export const AUDIT_LABELS: Record<string, string> = {
  login: "Entrou no painel",
  login_falhou: "Senha errada no login",
  login_bloqueado: "Login bloqueado por excesso de tentativas",
  "2fa_falhou": "Código de verificação errado no login",
  "2fa_ativada": "Ativou a verificação em duas etapas",
  "2fa_desativada": "Desativou a verificação em duas etapas",
  codigo_recuperacao: "Entrou com um código de recuperação",
  logout: "Saiu",
  senha_alterada: "Trocou a senha",
  configuracoes: "Alterou as configurações da loja",
  produto_salvo: "Salvou produto",
  produto_apagado: "Apagou produto",
  estoque: "Ajustou estoque",
  pedido_etapa: "Mudou a etapa do pedido",
  pedido_pagamento: "Mudou o pagamento do pedido",
  pedido_anonimizado: "Removeu os dados pessoais do pedido",
  categoria: "Alterou categoria",
  entrega: "Alterou retirada ou região de entrega",
  cupom: "Alterou cupom",
  cliente_excluido: "Excluiu os dados de um cliente",
  conta_excluida: "Cliente excluiu a própria conta",
  dados_exportados: "Cliente baixou os próprios dados",
  limpeza_lgpd: "Limpeza automática de dados antigos",
};

export async function audit(userEmail: string | null, action: keyof typeof AUDIT_LABELS, detail = "") {
  const ip = await clientIp().catch(() => "");
  db().prepare("INSERT INTO audit_log (user_email, action, detail, ip) VALUES (?, ?, ?, ?)").run(userEmail, action, detail.slice(0, 300), ip);
}

/** Versão sem request (tarefas automáticas). */
export function auditSystem(action: keyof typeof AUDIT_LABELS, detail = "") {
  db().prepare("INSERT INTO audit_log (user_email, action, detail, ip) VALUES (NULL, ?, ?, '')").run(action, detail.slice(0, 300));
}

export function listAudit(limit = 300) {
  return db()
    .prepare("SELECT id, at, user_email AS userEmail, action, detail, ip FROM audit_log ORDER BY id DESC LIMIT ?")
    .all(limit) as AuditEntry[];
}

/** Logins com senha errada ou bloqueados nos últimos `days` dias. */
export function countLoginAlerts(days = 7) {
  const row = db()
    .prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action IN ('login_falhou', 'login_bloqueado') AND at > datetime('now', ?)")
    .get(`-${days} days`) as { n: number };
  return row.n;
}
