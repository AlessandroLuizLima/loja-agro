import { Truck } from "lucide-react";
import { brl } from "@/lib/format";
import { FREE_SHIPPING_MIN } from "@/lib/pricing";

export function FreeShippingBar({ missing }: { missing: number }) {
  const progress = Math.min(100, ((FREE_SHIPPING_MIN - missing) / FREE_SHIPPING_MIN) * 100);
  return (
    <div className="rounded-xl bg-sun-soft p-3 text-sm">
      <p className="mb-2 flex items-center gap-2 font-medium text-petrol">
        <Truck className="size-4 shrink-0" />
        {missing > 0 ? (
          <span>
            Faltam <b>{brl(missing)}</b> para ganhar <b>frete grátis</b>
          </span>
        ) : (
          <span>
            Parabéns! Você ganhou <b>frete grátis</b> 🎉
          </span>
        )}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Progresso para frete grátis">
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
