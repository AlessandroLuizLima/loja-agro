import "server-only";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSessionUserId } from "./session";

/** O que pode ir para a interface: nunca o hash da senha. */
export type PublicUser = { id: string; name: string; firstName: string; email: string; phone: string | null; createdAt: string };

type UserRow = { id: string; name: string; email: string; phone: string | null; password_hash: string; created_at: string };

const toPublic = (r: UserRow): PublicUser => ({
  id: r.id,
  name: r.name,
  firstName: r.name.split(" ")[0],
  email: r.email,
  phone: r.phone,
  createdAt: r.created_at,
});

export function findUserByEmail(email: string) {
  return db().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
}

export function createUser(input: { name: string; email: string; phone?: string; passwordHash: string }) {
  const id = randomUUID();
  db()
    .prepare("INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)")
    .run(id, input.name, input.email.toLowerCase(), input.phone ?? null, input.passwordHash);
  return id;
}

/** Usuário logado ou null. Lê cookies: use dentro de <Suspense>. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const row = db().prepare("SELECT * FROM users WHERE id = ?").get(uid) as UserRow | undefined;
  return row ? toPublic(row) : null;
}

export async function requireUser(next = "/conta") {
  const user = await getCurrentUser();
  if (!user) redirect(`/conta/entrar?next=${encodeURIComponent(next)}`);
  return user;
}
