"use client";

import { Minus, Plus } from "lucide-react";

export function QtyStepper({
  value,
  onChange,
  max = 10,
  min = 1,
  label,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
  label: string;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div className="inline-flex items-center rounded-full border-2 border-line bg-white" role="group" aria-label={`Quantidade de ${label}`}>
      <button type="button" className={`${box} grid place-items-center rounded-full text-petrol disabled:opacity-30`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuir quantidade">
        <Minus className="size-4" />
      </button>
      <span className="min-w-7 text-center font-display font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={`${box} grid place-items-center rounded-full text-petrol disabled:opacity-30`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar quantidade">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
