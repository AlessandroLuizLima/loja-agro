"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* navegador sem permissão de área de transferência */
        }
      }}
      className="btn btn-primary mt-3 h-12 w-full sm:w-auto"
    >
      {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
      {copied ? "Copiado!" : label}
    </button>
  );
}
