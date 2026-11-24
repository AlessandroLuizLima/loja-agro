"use client";

import { Printer } from "lucide-react";
import type { ReactNode } from "react";

/** Botão de envio que pede confirmação antes (para ações que não têm volta). */
export function ConfirmSubmit({ message, className = "", children }: { message: string; className?: string; children: ReactNode }) {
  return (
    <button type="submit" className={className} onClick={(e) => !window.confirm(message) && e.preventDefault()}>
      {children}
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn h-10 border-2 border-line bg-white px-4 text-sm text-petrol print:hidden">
      <Printer className="size-4" /> Imprimir
    </button>
  );
}
