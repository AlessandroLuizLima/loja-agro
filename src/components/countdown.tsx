"use client";

import { useEffect, useState } from "react";

/** Próximo domingo às 23:59:59 (fim da "semana" da oferta). */
function endOfWeek(now: Date) {
  const end = new Date(now);
  end.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  end.setHours(23, 59, 59, 0);
  return end;
}

function split(ms: number) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  s %= 86400;
  const h = Math.floor(s / 3600);
  s %= 3600;
  return [d, h, Math.floor(s / 60), s % 60].map((n) => String(n).padStart(2, "0"));
}

export function Countdown() {
  // Só calcula no cliente para evitar diferença de hidratação entre servidor e navegador
  const [parts, setParts] = useState<string[] | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setParts(split(endOfWeek(now).getTime() - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const labels = ["dias", "h", "min", "s"];
  return (
    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted" aria-label="Tempo restante da oferta">
      <span className="mr-1">Termina em</span>
      {labels.map((label, i) => (
        <span key={label} className="flex items-center gap-1.5">
          <span
            className="min-w-8 rounded-lg bg-petrol px-1.5 py-1 text-center font-display text-sm font-bold text-white tabular-nums"
            title={label}
          >
            {parts?.[i] ?? "--"}
          </span>
          {i < 3 && <span className="font-bold text-petrol">:</span>}
        </span>
      ))}
    </div>
  );
}
