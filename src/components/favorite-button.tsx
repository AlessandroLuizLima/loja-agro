"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

export function FavoriteButton({ name }: { name: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remover ${name} dos favoritos` : `Favoritar ${name}`}
      onClick={() => setOn((v) => !v)}
      className="absolute top-2 right-2 z-10 grid size-9 place-items-center rounded-full bg-white shadow-md transition active:scale-90"
    >
      <Heart className={`size-[18px] transition ${on ? "fill-red-500 text-red-500" : "text-muted"}`} />
    </button>
  );
}
