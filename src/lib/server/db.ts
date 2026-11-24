import "server-only";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPasswordSync } from "./password";
import { seedDemoData } from "./seed";

/**
 * Banco SQLite embutido no Node (node:sqlite), sem dependências extras.
 * Cada loja tem o próprio arquivo de banco (DATABASE_PATH): produtos, pedidos,
 * clientes, fotos e configurações ficam todos nele. Para backup, basta copiar o arquivo.
 */

const DB_PATH = resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH ?? "./data/loja.db");

/** Cada posição é uma migração. Nunca altere uma já publicada: acrescente uma nova no fim. */
const MIGRATIONS = [
  `
  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT,
    role          TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE images (
    id         TEXT PRIMARY KEY,
    mime       TEXT NOT NULL,
    data       BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE categories (
    id          TEXT PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    emoji       TEXT NOT NULL DEFAULT '🌱',
    tint        TEXT NOT NULL DEFAULT 'verde',
    description TEXT NOT NULL DEFAULT '',
    sort        INTEGER NOT NULL DEFAULT 0,
    active      INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE products (
    id          TEXT PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    price       REAL NOT NULL,
    old_price   REAL,
    unit        TEXT NOT NULL DEFAULT 'unidade',
    stock       INTEGER NOT NULL DEFAULT 0,
    image_id    TEXT REFERENCES images(id) ON DELETE SET NULL,
    emoji       TEXT NOT NULL DEFAULT '📦',
    tint        TEXT NOT NULL DEFAULT 'verde',
    description TEXT NOT NULL DEFAULT '',
    highlights  TEXT NOT NULL DEFAULT '[]',
    sale_mode   TEXT NOT NULL DEFAULT 'online' CHECK (sale_mode IN ('online', 'consulta')),
    featured    INTEGER NOT NULL DEFAULT 0,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX products_category_idx ON products(category_id);

  CREATE TABLE delivery_zones (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    areas      TEXT NOT NULL DEFAULT '',
    fee        REAL NOT NULL DEFAULT 0,
    free_above REAL,
    days       TEXT NOT NULL DEFAULT '[]',
    active     INTEGER NOT NULL DEFAULT 1,
    sort       INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE coupons (
    id           TEXT PRIMARY KEY,
    code         TEXT NOT NULL UNIQUE,
    percent      INTEGER NOT NULL CHECK (percent BETWEEN 1 AND 90),
    min_subtotal REAL NOT NULL DEFAULT 0,
    active       INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE orders (
    id             TEXT PRIMARY KEY,
    number         INTEGER NOT NULL UNIQUE,
    user_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
    status         TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    fulfillment    TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    customer_name  TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    coupon_code    TEXT,
    total          REAL NOT NULL,
    payload        TEXT NOT NULL,
    stock_restored INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX orders_user_idx ON orders(user_id, created_at DESC);
  CREATE INDEX orders_status_idx ON orders(status, created_at DESC);
  `,
  // 2: segurança e LGPD
  `
  ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 1;
  ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE users ADD COLUMN privacy_accepted_at TEXT;
  ALTER TABLE orders ADD COLUMN privacy_accepted_at TEXT;
  ALTER TABLE orders ADD COLUMN anonymized_at TEXT;
  -- o administrador criado pelas variáveis de ambiente troca a senha no primeiro acesso
  UPDATE users SET must_change_password = 1 WHERE role = 'admin';

  CREATE TABLE login_attempts (
    key TEXT NOT NULL,
    at  INTEGER NOT NULL
  );
  CREATE INDEX login_attempts_idx ON login_attempts(key, at);

  CREATE TABLE audit_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    at         TEXT NOT NULL DEFAULT (datetime('now')),
    user_email TEXT,
    action     TEXT NOT NULL,
    detail     TEXT NOT NULL DEFAULT '',
    ip         TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX audit_log_at_idx ON audit_log(at DESC);
  `,
];

const globalForDb = globalThis as unknown as { lojaDb?: DatabaseSync };

export function db() {
  if (!globalForDb.lojaDb) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    const conn = new DatabaseSync(DB_PATH);
    conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
    migrate(conn);
    ensureAdmin(conn);
    globalForDb.lojaDb = conn;
  }
  return globalForDb.lojaDb;
}

function migrate(conn: DatabaseSync) {
  const { user_version: version } = conn.prepare("PRAGMA user_version").get() as { user_version: number };
  for (let i = version; i < MIGRATIONS.length; i++) {
    transaction(conn, () => {
      conn.exec(MIGRATIONS[i]);
      if (i === 0 && process.env.SEED_DEMO !== "false") seedDemoData(conn);
      conn.exec(`PRAGMA user_version = ${i + 1}`);
    });
  }
}

/**
 * Cria o primeiro administrador a partir de ADMIN_EMAIL e ADMIN_PASSWORD,
 * só se a loja ainda não tiver nenhum. Depois disso as variáveis são ignoradas.
 */
function ensureAdmin(conn: DatabaseSync) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const hasAdmin = conn.prepare("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").get();
  if (hasAdmin) return;
  if (password.length < 8) {
    console.warn("[loja] ADMIN_PASSWORD precisa ter pelo menos 8 caracteres. Administrador não criado.");
    return;
  }
  const existing = conn.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined;
  if (existing) {
    conn.prepare("UPDATE users SET role = 'admin', must_change_password = 1 WHERE id = ?").run(existing.id);
  } else {
    conn
      .prepare("INSERT INTO users (id, name, email, role, password_hash, must_change_password) VALUES (?, ?, ?, 'admin', ?, 1)")
      .run(randomUUID(), "Administrador", email, hashPasswordSync(password));
  }
}

/** Executa `fn` numa transação (BEGIN IMMEDIATE trava a escrita, evitando vender o mesmo estoque duas vezes). */
export function transaction<T>(conn: DatabaseSync, fn: () => T): T {
  conn.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    conn.exec("COMMIT");
    return result;
  } catch (err) {
    conn.exec("ROLLBACK");
    throw err;
  }
}

export const bool = (v: unknown) => v === 1 || v === true;
