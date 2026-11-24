import "server-only";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSessionUserId } from "./session";

export type Role = "cliente" | "admin";

/** O que pode ir para a interface: nunca o hash da senha. */
export type PublicUser = { id: string; name: string; firstName: string; email: string; phone: string | null; role: Role; createdAt: string };

type UserRow = { id: string; name: string; email: string; phone: string | null; role: Role; password_hash: string; created_at: string };

const toPublic = (r: UserRow): PublicUser => ({
  id: r.id,
  name: r.name,
  firstName: r.name.split(" ")[0],
  email: r.email,
  phone: r.phone,
  role: r.role,
  createdAt: r.created_at,
});

export function findUserByEmail(email: string) {
  return db().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
}

function findUserById(id: string) {
  return db().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function createUser(input: { name: string; email: string; phone?: string; passwordHash: string }) {
  const id = randomUUID();
  db()
    .prepare("INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)")
    .run(id, input.name, input.email.toLowerCase(), input.phone ?? null, input.passwordHash);
  return id;
}

export function getPasswordHash(id: string) {
  return findUserById(id)?.password_hash;
}

export function updatePassword(id: string, passwordHash: string) {
  db().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}

/** Usuário logado ou null (lê o cookie de sessão). */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const row = findUserById(uid);
  return row ? toPublic(row) : null;
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
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/entrar");
  if (user.role !== "admin") redirect("/admin/entrar?erro=permissao");
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
