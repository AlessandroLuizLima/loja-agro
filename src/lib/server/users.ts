import "server-only";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSession } from "./session";
import { adminUrl } from "../admin-path";

export type Role = "cliente" | "admin";

/** O que pode ir para a interface: nunca o hash da senha. */
export type PublicUser = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  sessionVersion: number;
  mustChangePassword: boolean;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  password_hash: string;
  created_at: string;
  session_version: number;
  must_change_password: number;
  privacy_accepted_at: string | null;
};

const toPublic = (r: UserRow): PublicUser => ({
  id: r.id,
  name: r.name,
  firstName: r.name.split(" ")[0],
  email: r.email,
  phone: r.phone,
  role: r.role,
  createdAt: r.created_at,
  sessionVersion: r.session_version,
  mustChangePassword: r.must_change_password === 1,
});

export const sessionUser = (r: UserRow) => ({ id: r.id, sessionVersion: r.session_version, role: r.role });

export function findUserByEmail(email: string) {
  return db().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
}

export function findUserById(id: string) {
  return db().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

/** Cria a conta registrando quando o cliente aceitou a Política de Privacidade (LGPD). */
export function createUser(input: { name: string; email: string; phone?: string; passwordHash: string }) {
  const id = randomUUID();
  db()
    .prepare("INSERT INTO users (id, name, email, phone, password_hash, privacy_accepted_at) VALUES (?, ?, ?, ?, ?, datetime('now'))")
    .run(id, input.name, input.email.toLowerCase(), input.phone ?? null, input.passwordHash);
  return findUserById(id)!;
}

export function getPasswordHash(id: string) {
  return findUserById(id)?.password_hash;
}

/**
 * Troca a senha e aumenta a versão da sessão: quem estava logado com a senha antiga
 * (em outro celular, por exemplo) é desconectado. Devolve o usuário atualizado para renovar a sessão atual.
 */
export function updatePassword(id: string, passwordHash: string) {
  db().prepare("UPDATE users SET password_hash = ?, must_change_password = 0, session_version = session_version + 1 WHERE id = ?").run(passwordHash, id);
  return findUserById(id)!;
}

/** Usuário logado ou null (lê o cookie de sessão). */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await getSession();
  if (!session) return null;
  const row = findUserById(session.uid);
  // Sessão de antes de uma troca de senha não vale mais
  return row && row.session_version === session.sv ? toPublic(row) : null;
}

export async function requireUser(next = "/conta") {
  const user = await getCurrentUser();
  if (!user) redirect(`/conta/entrar?next=${encodeURIComponent(next)}`);
  return user;
}

/**
 * Exige um administrador logado. Use no início de TODA página e Server Action do painel:
 * Server Actions são endpoints públicos e precisam checar permissão por conta própria.
 */
export async function requireAdmin({ allowPendingPassword = false } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect(adminUrl("/entrar"));
  if (user.role !== "admin") redirect(adminUrl("/entrar?erro=permissao"));
  // Senha inicial (das variáveis de ambiente) precisa ser trocada antes de usar o painel
  if (user.mustChangePassword && !allowPendingPassword) redirect(adminUrl("/trocar-senha"));
  return user;
}

export function listCustomers() {
  return db()
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at AS createdAt,
              COUNT(o.id) AS orders, COALESCE(SUM(CASE WHEN o.status <> 'cancelado' THEN o.total END), 0) AS spent
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'cliente' GROUP BY u.id ORDER BY u.created_at DESC`,
    )
    .all() as { id: string; name: string; email: string; phone: string | null; createdAt: string; orders: number; spent: number }[];
}
