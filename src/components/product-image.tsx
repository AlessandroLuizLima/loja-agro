import { imageUrl, tintClass, type Tint } from "@/lib/types";

/** Foto do produto ou, se ainda não tiver foto, o emoji sobre um fundo colorido. */
export function ProductImage({
  item,
  className = "",
  emojiClassName = "text-6xl",
  eager = false,
}: {
  item: { name: string; imageId: string | null; emoji: string; tint: Tint };
  className?: string;
  emojiClassName?: string;
  eager?: boolean;
}) {
  const src = imageUrl(item.imageId);
  return (
    <div className={`grid place-items-center overflow-hidden ${src ? "bg-white" : tintClass(item.tint)} ${className}`}>
      {src ? (
        // Imagens já chegam redimensionadas pelo painel (máx. 1200 px, WebP)
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={item.name} loading={eager ? "eager" : "lazy"} decoding="async" className="size-full object-cover" />
      ) : (
        <span role="img" aria-label={item.name} className={emojiClassName}>
          {item.emoji}
        </span>
      )}
    </div>
  );
}
