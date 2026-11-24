import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/**
 * Descobre o tipo pelo conteúdo do arquivo (assinatura), não pelo nome ou pelo que o navegador diz.
 * SVG não é aceito: pode conter scripts.
 */
export function detectImageType(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

export type UploadResult = { id: string } | { error: string };

/** Valida e grava um arquivo de imagem enviado por formulário. */
export async function storeUpload(file: File): Promise<UploadResult> {
  if (file.size > MAX_IMAGE_BYTES) return { error: "A imagem passa de 3 MB. Use uma foto menor." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = detectImageType(bytes);
  if (!mime) return { error: "Formato não aceito. Envie JPG, PNG ou WebP." };
  const id = randomUUID().replace(/-/g, "");
  db().prepare("INSERT INTO images (id, mime, data) VALUES (?, ?, ?)").run(id, mime, bytes);
  return { id };
}

export function getImage(id: string) {
  return db().prepare("SELECT mime, data FROM images WHERE id = ?").get(id) as { mime: string; data: Uint8Array } | undefined;
}

/** Apaga a imagem se nenhum produto nem a configuração da loja a usam mais. */
export function deleteImageIfUnused(id: string | null | undefined) {
  if (!id) return;
  const conn = db();
  const usedByProduct = conn.prepare("SELECT 1 FROM products WHERE image_id = ? LIMIT 1").get(id);
  const usedAsLogo = conn.prepare("SELECT 1 FROM settings WHERE key = 'logoImageId' AND value = ?").get(JSON.stringify(id));
  if (!usedByProduct && !usedAsLogo) conn.prepare("DELETE FROM images WHERE id = ?").run(id);
}
