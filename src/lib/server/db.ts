import "server-only";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * Banco SQLite embutido no Node (node:sqlite), sem dependências extras.
 * Funciona em qualquer servidor Node 22.13+ com disco persistente.
 * Em hospedagem serverless (ex.: Vercel) troque por Postgres/Turso
 * mantendo as funções de src/lib/server/users.ts e orders.ts.
 */

const DB_PATH = resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH ?? "./data/pethouse.db");

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          TEXT PRIMARY KEY,
    number      INTEGER NOT NULL UNIQUE,
    user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
    email       TEXT NOT NULL,
    status      TEXT NOT NULL,
    total       REAL NOT NULL,
    payload     TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS newsletter (
    email       TEXT PRIMARY KEY,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

const globalForDb = globalThis as unknown as { pethouseDb?: DatabaseSync };

export function db() {
  if (!globalForDb.pethouseDb) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    const conn = new DatabaseSync(DB_PATH);
    conn.exec(SCHEMA);
    globalForDb.pethouseDb = conn;
  }
  return globalForDb.pethouseDb;
}
