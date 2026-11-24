"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const MAX_SIDE = 1200;

/**
 * Reduz a foto no próprio celular/computador antes de enviar (máx. 1200 px, WebP).
 * Foto de celular com 5 MB vira ~150 KB: envio rápido mesmo com sinal fraco.
 */
async function shrink(file: File, maxSide: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

export function ImageInput({ name, label, currentUrl, maxSide = MAX_SIDE, hint, shape = "square" }: { name: string; label: string; currentUrl: string | null; maxSide?: number; hint?: string; shape?: "square" | "wide" }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
      e.target.value = "";
      return;
    }
    setBusy(true);
    try {
      const small = await shrink(file, maxSide);
      const dt = new DataTransfer();
      dt.items.add(small);
      e.target.files = dt.files;
      setPreview(URL.createObjectURL(small));
      setRemoved(false);
    } catch {
      setPreview(URL.createObjectURL(file));
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    if (input.current) input.current.value = "";
    setPreview(null);
    setRemoved(true);
  }

  const box = shape === "wide" ? "h-24 w-48" : "size-32";

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-ink">{label}</p>
      <div className="flex items-center gap-4">
        <div className={`${box} grid shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-cream`}>
          {busy ? (
            <Loader2 className="size-6 animate-spin text-muted" />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-contain" />
          ) : (
            <ImagePlus className="size-8 text-muted" />
          )}
        </div>
        <div className="space-y-2">
          <label className="btn h-10 cursor-pointer border-2 border-line bg-white px-4 text-sm text-petrol hover:border-brand">
            <ImagePlus className="size-4" /> {preview ? "Trocar" : "Escolher foto"}
            <input ref={input} type="file" name={name} accept="image/jpeg,image/png,image/webp" onChange={onChange} className="sr-only" />
          </label>
          {preview && (
            <button type="button" onClick={remove} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline">
              <Trash2 className="size-4" /> Remover
            </button>
          )}
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
      <input type="hidden" name={`${name}Remove`} value={removed ? "1" : ""} />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
