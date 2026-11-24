import { Star } from "lucide-react";

export function Rating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  const icon = size === "sm" ? "size-3.5" : "size-5";
  return (
    <div className={`flex items-center gap-1 text-muted ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <span className="flex text-amber-400" role="img" aria-label={`Nota ${value.toLocaleString("pt-BR")} de 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`${icon} ${i < Math.round(value) ? "fill-current" : ""}`} />
        ))}
      </span>
      {value.toLocaleString("pt-BR")}
      {count !== undefined && <span>({count.toLocaleString("pt-BR")})</span>}
    </div>
  );
}
