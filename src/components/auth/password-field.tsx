"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string; hint?: string };

export function PasswordField({ label, name, error, hint, ...input }: Props) {
  const [show, setShow] = useState(false);
  const id = `f-${name}`;
  const msgId = `${id}-msg`;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {input.required && <span className="text-brand-dark"> *</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? msgId : undefined}
          className="h-12 w-full rounded-xl border-2 border-line bg-white pr-12 pl-4 outline-none transition focus:border-brand aria-invalid:border-red-400"
          {...input}
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="absolute top-1 right-1 grid size-10 place-items-center rounded-lg text-muted hover:text-petrol">
          {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {(error || hint) && (
        <p id={msgId} className={`mt-1 text-xs ${error ? "font-medium text-red-600" : "text-muted"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
